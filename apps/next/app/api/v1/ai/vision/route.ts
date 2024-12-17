import type { NextRequest } from 'next/server'

import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import * as Sentry from '@sentry/nextjs'
import { geolocation } from '@vercel/functions'
import { createKysely } from '@vercel/postgres-kysely'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import * as crypto from 'node:crypto'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

import type { Database } from '@/next/lib/db'

import { IdentificationSchema, OrganismSchema } from '@/next/lib/db'
import { getR2Client, R2_BUCKET_NAME } from '@/next/lib/r2'

const requestBodySchema = z.object({
	base64Image: z
		.string()
		.min(1)
		.startsWith('data:image/')
		.max(1024 * 1024 * 10),
})

function slugify<T extends string>(text: T) {
	return text
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '') as Lowercase<T>
}

function initializeFirebase() {
	try {
		initializeApp({
			credential: cert({
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
				privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(
					/\\n/gm,
					'\n',
				),
				projectId: 'bichos-id',
			}),
		})
	} catch (error) {
		Sentry.captureException(error)
	}
}

function getRandomId() {
	return crypto.randomBytes(20).toString('hex')
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

		initializeFirebase()

		const decodedToken = idToken && (await getAuth().verifyIdToken(idToken))
		if (!decodedToken) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		if (!request.body) {
			throw new Error('No body provided')
		}

		const openai = new OpenAI()
		const db = createKysely<Database>()

		const rawData: unknown = await request.json()
		const data = requestBodySchema.parse(rawData)

		const model = 'gpt-4o-2024-11-20'

		const geo = geolocation(request)

		const identificationResponse = await openai.beta.chat.completions.parse({
			messages: [
				{
					content: `You are an expert entomologist that will recognize organisms accurately appearing in a photo taken by a user. Be as accurate as possible.

Instructions:
- Use shapes, colors, surroundings and metadata to get the best identification.
- Photos are likely to be recently taken with a mobile phone.
- Do not return any information if the photo is inappropriate, blurry or simply unrelated with arthropods.
- In the species or genus field if it's unknown or not sure, return empty string ('').
- Review the image quality rating in a scale from 0 to 10, consider composition, quality, lighting and sharpness.
- In the species field, only return the species name avoid the genus.
${
	Object.values(geo ?? {}).length
		? `- The user's geo data is, country: '${geo?.country}', region: '${geo?.region}'.`
		: ''
}`,
					role: 'system',
				},
				{
					content: [
						{
							image_url: { url: data.base64Image },
							type: 'image_url',
						},
					],
					role: 'user',
				},
			],
			model,
			response_format: zodResponseFormat(IdentificationSchema, 'event'),
			temperature: 0.3,
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

		const { _imageQualityRating, ...identification } = parsedIdentification

		const organismSpecies = `${identification.classification.family}-${
			identification.classification.genus || ''
		}-${identification.classification.species || ''}` as const

		if (organismSpecies.startsWith('-')) {
			return NextResponse.json(
				{ error: 'Invalid organism species' },
				{ status: 400 },
			)
		}

		const organismId = slugify(organismSpecies)
		const imagePath = `scans/${organismSpecies.replaceAll('-', '/')}`

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
			.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: imageKey }))
			.catch(() => null)

		void (await db
			.insertInto('organism_scans')
			.values({
				created_at: new Date().toISOString(),
				created_by: decodedToken.sub,
				id: getRandomId(),
				image_key: imageKey,
				image_quality_rating: _imageQualityRating,
				model,
				organism_id: organismId,
				updated_at: new Date().toISOString(),
			})
			.execute())

		if (existingImage) {
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
			getR2Client()
				.send(
					new PutObjectCommand({
						Body: Buffer.from(
							data.base64Image.replace(/^data:image\/\w+;base64,/, ''),
							'base64',
						),
						Bucket: R2_BUCKET_NAME,
						CacheControl: 'public, max-age=31536000, immutable',
						ContentEncoding: 'base64',
						ContentType: `image/${imageExtension}`,
						Key: imageKey,
						Metadata: {
							'X-Image-Sha256': imageSha256,
						},
					}),
				)
				.catch(() => false),
		])

		if (!existing) {
			const organismResponse = await openai.beta.chat.completions.parse({
				messages: [
					{
						content: `You are an expert entomologist with extensive knowledge of arthropods, particularly insects and arachnids.

Instructions:
- Do not use any markdown formatting in your response.
- Provide a detailed description of the organism, focusing on its physical characteristics, behavior, and habitat in Spanish (Mexico).
- Use language suitable for a non-expert audience, avoiding technical jargon where possible in Spanish (Mexico).
- IMPORTANT: Translate the common name and description to SPANISH (MEXICO).`,
						role: 'system',
					},
					{
						content: `The organism is ${
							parsedIdentification.classification.family
						} ${parsedIdentification.classification.genus} ${
							parsedIdentification.classification.species || 'sp'
						}.`,
						role: 'user',
					},
				],
				model,
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
				scan_count: 0,
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
				.set((eb) => ({
					image_key: imageKey,
					image_quality_rating: _imageQualityRating,
					scan_count: eb('scan_count', '+', 1),
				}))
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
