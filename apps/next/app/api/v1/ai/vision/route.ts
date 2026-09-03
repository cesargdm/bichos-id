import type { NextRequest } from 'next/server'

import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import * as Sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { sql } from 'kysely'
import * as crypto from 'node:crypto'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

import { buildOrganismId, buildScanPrefix } from '@/app/lib/organism-id'
import { db, IdentificationSchema, OrganismSchema } from '@/next/lib/db'
import { verifyFirebaseIdToken } from '@/next/lib/firebase-verify'
import { getR2BucketName, getR2Client } from '@/next/lib/r2'

const requestBodySchema = z.object({
	base64Image: z
		.string()
		.min(1)
		.startsWith('data:image/')
		.max(1024 * 1024 * 10),
})

function getRandomId() {
	// Web Crypto (not node:crypto) so the return type doesn't depend on
	// @types/node's generic Buffer<TArrayBuffer>, whose `toString(encoding)`
	// overload TS 6 fails to resolve over Uint8Array's 0-arg one.
	return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(20)))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('')
}

export async function POST(request: NextRequest) {
	try {
		if (!process.env.OPENAI_API_KEY) {
			return NextResponse.json(
				{ error: 'No OpenAI API key provided' },
				{ status: 500 },
			)
		}

		const idToken = request.headers.get('Authorization')?.split(' ').at(1)

		const decodedToken = await verifyFirebaseIdToken(idToken)
		if (!decodedToken) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		if (!request.body) {
			throw new Error('No body provided')
		}

		const openai = new OpenAI()

		const rawData: unknown = await request.json()
		const data = requestBodySchema.parse(rawData)

		// Cost/benefit: luna is half gpt-4.1's price with newer-generation vision;
		// nano descriptions are generated once per organism and cached in the DB.
		const visionModel = 'gpt-5.6-luna'
		const textModel = 'gpt-5.4-nano'

		const { cf } = await getCloudflareContext({ async: true })
		const geoParts = [
			cf?.country && `country: '${cf.country}'`,
			cf?.region && `region: '${cf.region}'`,
		].filter(Boolean)

		const identificationResponse = await openai.chat.completions.parse({
			messages: [
				{
					content: `You are an expert entomologist identifying an arthropod from a photo taken by a user, most often on a phone at close range.

IDENTIFY AS PRECISELY AS THE EVIDENCE ALLOWS
- Work down the ranks: phylum, class, order, family, genus, species. Report the most specific rank you can actually justify from what is visible.
- Prefer a confident genus over a guessed species, and a confident family over a guessed genus. Do not invent precision — but do not stop at family when diagnostic features for the genus are clearly visible either.
- Common, widespread species are more likely than rare lookalikes. Weigh how plausible a candidate is in the user's region before choosing it.

FIELD RULES (these are strict)
- "species" holds the specific epithet ALONE, never the binomial.
  Correct: genus "Xylocopa", species "varipuncta".
  Wrong: species "Xylocopa varipuncta". Wrong: species "X. varipuncta".
- Use null — not an empty string, not "sp.", not "unknown" — for genus or species you cannot determine.
- "class", "order", "family" and "phylum" are required. For any arthropod you can see well enough to describe, family is almost always determinable; return your best supported answer rather than defaulting to null.
- Capitalize phylum/class/order/family/genus normally (e.g. "Insecta", "Hymenoptera", "Apidae", "Xylocopa"); keep the specific epithet lowercase (e.g. "varipuncta").
- "common_name" is the name in Spanish (Mexico) as an ordinary person would say it, with no surrounding whitespace and no scientific name in parentheses.

WHEN THE PHOTO DOES NOT SHOW AN ARTHROPOD
- If the subject is not an arthropod, or the image is too blurry, too dark, or too distant to support any identification, return null for genus and species and give the most general classification you can honestly support.

IMAGE QUALITY RATING
- Rate 0-10 on how usable this photo is for identification: sharpness of diagnostic features, framing, lighting, and how much of the animal is visible. A crisp, well-lit, full-body shot is 9-10; a blurry or heavily obscured subject is 0-3.${
						geoParts.length
							? `

LOCATION
- The photo was taken in ${geoParts.join(', ')}. Favor species whose known range includes this area.`
							: ''
					}`,
					role: 'system',
				},
				{
					content: [
						{
							image_url: { detail: 'high', url: data.base64Image },
							type: 'image_url',
						},
					],
					role: 'user',
				},
			],
			model: visionModel,
			reasoning_effort: 'low',
			response_format: zodResponseFormat(IdentificationSchema, 'event'),
			user: idToken,
		})

		const parsedIdentification =
			identificationResponse.choices[0]?.message?.parsed

		if (!parsedIdentification) {
			return NextResponse.json(
				{ error: 'No response from AI' },
				{ status: 500 },
			)
		}

		const { _imageQualityRating, ...parsed } = parsedIdentification

		// The model must return genus/species as null rather than omitting them
		// (see IdentificationSchema), but stored rows have always used "absent"
		// for unknown. Normalize back so a null doesn't become a third state in
		// the persisted JSON.
		const identification = {
			...parsed,
			classification: {
				...parsed.classification,
				genus: parsed.classification.genus ?? undefined,
				species: parsed.classification.species ?? undefined,
			},
		}

		// Family is what makes the listing addressable; without it there's no
		// page worth creating.
		if (!identification.classification.family?.trim()) {
			return NextResponse.json(
				{ error: 'Invalid organism species' },
				{ status: 400 },
			)
		}

		const organismId = buildOrganismId([
			identification.classification.family,
			identification.classification.genus,
			identification.classification.species,
		])

		if (!organismId) {
			return NextResponse.json(
				{ error: 'Invalid organism species' },
				{ status: 400 },
			)
		}

		const imagePath = buildScanPrefix([
			identification.classification.family,
			identification.classification.genus,
			identification.classification.species,
		])

		const imageSha256 = crypto
			.createHash('sha256')
			.update(data.base64Image)
			.digest('hex')
		const imageExtension = data?.base64Image
			.split(';')[0]
			?.split('/')[1]
			?.toLowerCase()

		const imageKey =
			`${imagePath}/${imageSha256}.${imageExtension}`.toLowerCase()

		const existingImage = await getR2Client()
			.send(new GetObjectCommand({ Bucket: getR2BucketName(), Key: imageKey }))
			.catch(() => null)

		// Only recorded once the image the row references is confirmed to exist
		// in R2 (already there, or just uploaded successfully) — a scan row
		// inserted before an upload that then fails would point at a key that was
		// never written.
		//
		// Bumping the counter here, rather than at the call sites, is what keeps
		// it honest: a scan can be recorded on three different paths (the photo
		// already being in R2, a new organism, a repeat sighting), and counting on
		// only one of them left `scan_count` reading 1 for organisms with dozens
		// of scans.
		//
		// Insert and counter move in one statement so a failure can't record a
		// scan that never gets counted. It has to be a data-modifying CTE rather
		// than `db.transaction()`: the Neon HTTP driver has no interactive
		// transactions ("NeonDialect doesn't support interactive transactions"),
		// so that call throws at runtime. On the new-organism path the row doesn't
		// exist yet, so the update matches nothing and the insert seeds it at 1.
		const insertScanRecord = async () => {
			const now = new Date().toISOString()

			await sql`
				with inserted as (
					insert into organism_scans (
						created_at, created_by, id, image_key,
						image_quality_rating, model, organism_id, updated_at
					)
					values (
						${now}, ${decodedToken.sub}, ${getRandomId()}, ${imageKey},
						${_imageQualityRating}, ${visionModel}, ${organismId}, ${now}
					)
					returning organism_id
				)
				update organisms
				set scan_count = scan_count + 1
				where id = (select organism_id from inserted)
			`.execute(db)

			// Every path that records a scan moves the counter, so every path has
			// to drop the cached detail page too — otherwise the person who just
			// scanned it keeps seeing the old count for the full cache lifetime.
			revalidatePath(`/explore/${organismId}`)
		}

		if (existingImage) {
			await insertScanRecord()

			return NextResponse.json(
				{ id: organismId, ...parsedIdentification },
				{ status: 200 },
			)
		}

		const [existing] = await Promise.all([
			db
				.selectFrom('organisms')
				.where('id', '=', organismId)
				.select('image_quality_rating')
				.executeTakeFirst(),
			getR2Client().send(
				new PutObjectCommand({
					Body: Buffer.from(
						data.base64Image.replace(/^data:image\/\w+;base64,/, ''),
						'base64',
					),
					Bucket: getR2BucketName(),
					CacheControl: 'public, max-age=31536000, immutable',
					ContentType: `image/${imageExtension}`,
					Key: imageKey,
					Metadata: {
						'X-Image-Sha256': imageSha256,
					},
				}),
			),
		])

		await insertScanRecord()

		if (!existing) {
			const organismResponse = await openai.chat.completions.parse({
				messages: [
					{
						content: `You are an expert entomologist writing for a general audience in Mexico.

LANGUAGE
- Write everything in Spanish (Mexico). Plain, everyday wording — explain a term the first time you need it rather than assuming it.
- No markdown, no bullet points, no headings. Plain prose only.

WHAT TO WRITE
- "common_name": the name people in Mexico would actually use. If there is no common name in use, use a short descriptive name ("escarabajo joya verde"). Never put the scientific name here.
- "description": 3-5 sentences on what it looks like — size, colors, body shape, and the features that distinguish it from similar-looking arthropods.
- "habitat": 2-3 sentences on where it lives in Mexico, when it is active, and what a person is likely to be doing when they run into one.

VENOM — be careful and accurate here, people use this to decide whether they are in danger
- "metadata.venomous.level" is exactly one of:
  NON_VENOMOUS — no venom, or no ability to deliver it to a human.
  VENOMOUS — can sting or bite with venom, but for a typical healthy adult the result is pain or local swelling, not danger (e.g. most bees and wasps, most spiders).
  HIGHLY_VENOMOUS — capable of causing a medically serious reaction that warrants seeking care (e.g. Latrodectus, Loxosceles, Centruroides).
- "metadata.venomous.type" is a SHORT Spanish noun phrase naming how it delivers venom, lowercase: "picadura", "mordedura", "aguijón", "pelos urticantes". If it has no venom, use exactly "ninguno". Do not use English, and do not put "none", "NO", or a level name here.
- If unsure, choose the lower-risk-sounding label only when you are genuinely confident; never overstate safety.`,
						role: 'system',
					},
					{
						// Only the ranks that were actually determined — interpolating a
						// null genus put the literal string "null" in the prompt.
						content: `Identify and describe this arthropod: ${[
							`familia ${parsedIdentification.classification.family}`,
							parsedIdentification.classification.genus &&
								`género ${parsedIdentification.classification.genus}`,
							parsedIdentification.classification.species &&
								`especie ${parsedIdentification.classification.species}`,
						]
							.filter(Boolean)
							.join(', ')}.`,
						role: 'user',
					},
				],
				model: textModel,
				reasoning_effort: 'none',
				response_format: zodResponseFormat(OrganismSchema, 'event'),
			})

			const parsedOrganismInfo = organismResponse.choices[0]?.message?.parsed

			if (!parsedOrganismInfo) {
				throw new Error('No response from AI')
			}

			const newOrganismValues = {
				id: organismId,
				...identification,
				...parsedOrganismInfo,
				created_at: new Date().toISOString(),
				created_by: decodedToken.sub,
				image_key: imageKey,
				image_quality_rating: _imageQualityRating,
				scan_count: 1,
				taxonomy: identification.classification.species
					? 'SPECIES'
					: identification.classification.genus
						? 'GENUS'
						: 'FAMILY',
				updated_at: new Date().toISOString(),
			} as const

			Sentry.captureEvent({
				extra: { values: newOrganismValues },
				message: 'New organism',
			})

			await db.insertInto('organisms').values(newOrganismValues).execute()

			// Revalidate existing cache
			revalidatePath(`/explore`)
		} else if (existing.image_quality_rating < _imageQualityRating) {
			await db
				.updateTable('organisms')
				.where('id', '=', organismId)
				.set({
					image_key: imageKey,
					image_quality_rating: _imageQualityRating,
				})
				.execute()

			// Revalidate existing cache
			revalidatePath(`/explore/${organismId}`)
		}

		return NextResponse.json(
			{ id: organismId, ...parsedIdentification },
			{ status: 200 },
		)
	} catch (error) {
		Sentry.captureException(error)

		return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
	}
}
