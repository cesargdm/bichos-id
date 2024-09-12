import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { createKysely } from '@vercel/postgres-kysely'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import * as crypto from 'node:crypto'

import { Database, OrganismSchema } from '../../_db'
import { getR2Client, R2_BUCKET_NAME } from '../../_r2'

const schema = z.object({
  base64Image: z.string().min(1).startsWith('data:image/'),
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export async function POST(request: NextRequest) {
  try {
    // TODO: limit usage to verified app clients (APP ATTESTATION)
    // https://developer.apple.com/documentation/devicecheck/validating-apps-that-connect-to-your-server

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'No OpenAI API key provided' },
        { status: 500 },
      )
    }

    const openai = new OpenAI()
    const db = createKysely<Database>()

    if (!request.body) {
      throw new Error('No body provided')
    }

    const userId = request.ip || 'anonymous'

    const data = await request.json()

    schema.parse(data)

    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: `You are an expert entomologist that will recognize organisms accurately appearing in a given photo.

- Use shapes, colors, surroundings and metadata to get the best identification.
- Do not return any information if the photo is inappropriate, blurry or simply unrelated with arthropods.
- In the species field, if it's unknown or not sure, use 'sp'.
- Make sure venomous fields are correct.
- If common name is unavailable, use the scientific name.
- In the species field, only return the species name avoid the genus.
- Translate only the description and common name fields to spanish.
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
      user: userId,
      response_format: zodResponseFormat(OrganismSchema, 'event'),
    })

    const choice = response.choices[0].message

    console.log(choice?.parsed)

    if (!choice?.parsed || !choice.parsed.identification) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 },
      )
    }

    const parsed = OrganismSchema.parse(choice.parsed)

    if (!parsed) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 },
      )
    }

    const id = slugify(
      `${parsed.identification.scientificClassification.genus}-${
        parsed.identification.scientificClassification.species ?? 'sp'
      }`,
    )

    await Promise.allSettled([
      db
        .selectFrom('organism')
        .where('id', '=', id)
        .execute()
        .then((existing) => {
          if (!existing.length) {
            return void db
              .insertInto('organism')
              .values({
                id,
                identification: parsed.identification,
                confidence: parsed.confidence,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .executeTakeFirst()
          } else {
            return void db
              .updateTable('organism')
              .set({
                identification: parsed.identification,
                confidence: parsed.confidence,
                updated_at: new Date().toISOString(),
              })
              .where('id', '=', id)
              .executeTakeFirst()
          }
        }),
      getR2Client().send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: `organisms/${id}/${crypto
            .randomBytes(20)
            .toString('hex')}-${Date.now()}.jpg`,
          Body: Buffer.from(
            data.base64Image.replace(/^data:image\/\w+;base64,/, ''),
            'base64',
          ),
          ContentType: 'image/jpeg',
          ContentEncoding: 'base64',
          CacheControl: 'max-age=31536000, immutable',
        }),
      ),
    ])

    return NextResponse.json({ id, ...parsed }, { status: 200 })
  } catch (error) {
    console.log(error)

    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
