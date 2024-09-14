import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { createKysely } from '@vercel/postgres-kysely'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import * as crypto from 'node:crypto'
import { initializeApp, cert, getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

import { Database, IdentificationSchema, OrganismSchema } from '../../_db'
import { getR2Client, R2_BUCKET_NAME } from '../../_r2'

const requestBodySchema = z.object({
  base64Image: z
    .string()
    .min(1)
    .startsWith('data:image/')
    .max(1024 * 1024 * 10),
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

try {
  initializeApp({
    credential: cert({
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      projectId: 'bichos-id',
    }),
  })
} catch {
  console.log('initializeApp failed')
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
    const isVerified = idToken && getAuth().verifyIdToken(idToken)
    if (!isVerified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!request.body) {
      throw new Error('No body provided')
    }

    const openai = new OpenAI()
    const db = createKysely<Database>()

    let data = await request.json()
    data = requestBodySchema.parse(data)

    const identificationResponse = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert entomologist that will recognize organisms accurately appearing in a photo uploaded by a user.

Instructions:
- Use shapes, colors, surroundings and metadata to get the best identification.
- Photos are likely to be recently taken with a mobile phone.
- Do not return any information if the photo is inappropriate, blurry or simply unrelated with arthropods.
- In the species field, if it's unknown or not sure, use 'sp'.
- Review the image quality rating in a scale from 0 to 10, consider composition, quality, lighting and sharpness.
- In the species field, only return the species name avoid the genus.
${
  request.geo
    ? `- The user's geo data is, country: '${request.geo?.country}', region: '${request.geo?.region}'.`
    : ''
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `The given photo is:`,
            },
            {
              type: 'image_url',
              image_url: { url: data.base64Image },
            },
          ],
        },
      ],
      temperature: 0.3,
      user: idToken,
      response_format: zodResponseFormat(IdentificationSchema, 'event'),
    })

    const parsedIdentification =
      identificationResponse.choices[0].message?.parsed

    if (!parsedIdentification) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 },
      )
    }

    const { _imageQualityRating, ...identification } = parsedIdentification

    const organismSpecies = `${identification.classification.family}-${
      identification.classification.genus ?? 'sp'
    }-${identification.classification.species ?? 'sp'}`

    const organismId = slugify(organismSpecies)
    const imagePath = `scans/${organismSpecies.replaceAll('-', '/')}`

    const imageSha256 = crypto
      .createHash('sha256')
      .update(data.base64Image)
      .digest('hex')
    const imageExtension = data.base64Image
      .split(';')[0]
      .split('/')[1]
      .toLowerCase()

    const imageKey =
      `${imagePath}/${imageSha256}.${imageExtension}`.toLowerCase()

    const existingImage = await getR2Client()
      .send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: imageKey }))
      .catch(() => null)

    void (await db
      .insertInto('organism_scans')
      .values({
        id: getRandomId(),
        image_key: imageKey,
        image_quality_rating: _imageQualityRating,
        organism_id: organismId,
        created_at: new Date().toISOString(),
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
            Bucket: R2_BUCKET_NAME,
            Key: imageKey,
            Body: Buffer.from(
              data.base64Image.replace(/^data:image\/\w+;base64,/, ''),
              'base64',
            ),
            Metadata: {
              'X-Image-Sha256': imageSha256,
            },
            ContentType: `image/${imageExtension}`,
            ContentEncoding: 'base64',
            CacheControl: 'max-age=31536000, immutable',
          }),
        )
        .catch(() => undefined),
    ])

    if (!existing) {
      const organismResponse = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content: `You are an expert entomologist with extensive knowledge of arthropods, particularly insects and arachnids.

Instructions:
- Do not use any markdown formatting in your response.
- Provide a detailed description of the organism, focusing on its physical characteristics, behavior, and habitat in Spanish (Mexico).
- Use language suitable for a non-expert audience, avoiding technical jargon where possible in Spanish (Mexico).
- IMPORTANT: Translate the common name and description to SPANISH (MEXICO).`,
          },
          {
            role: 'user',
            content: `The organism is ${
              parsedIdentification.classification.family
            } ${parsedIdentification.classification.genus} ${
              parsedIdentification.classification.species || 'sp'
            }.`,
          },
        ],
        response_format: zodResponseFormat(OrganismSchema, 'event'),
      })

      const newInformation = organismResponse.choices[0].message?.parsed

      if (!newInformation) {
        throw new Error('No response from AI')
      }

      await db
        .insertInto('organisms')
        .values({
          id: organismId,
          ...identification,
          ...newInformation,
          image_key: imageKey,
          image_quality_rating: _imageQualityRating,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute()
    } else if (existing.image_quality_rating < _imageQualityRating) {
      await db
        .updateTable('organisms')
        .where('id', '=', organismId)
        .set({
          image_key: imageKey,
          image_quality_rating: _imageQualityRating,
        })
        .execute()
    }

    return NextResponse.json(
      { id: organismId, ...parsedIdentification },
      { status: 200 },
    )
  } catch (error) {
    console.log(error)

    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
