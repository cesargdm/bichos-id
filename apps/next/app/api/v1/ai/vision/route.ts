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
          content: `You are an expert entomologist that will recognize species based on a photo.
Use shape, color and subject surroundings and metadata to archive the best identification.
Try to be as accurate as possible with genus and species, if unsure, return 'sp' as species.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `The user's country is: '${request.geo?.country}', region: '${request.geo?.region}' Identify the insect or arachnid in the next photo.`,
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

    if (!response?.choices?.[0]?.message?.parsed) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 },
      )
    }

    const parsed = OrganismSchema.parse(response.choices[0].message.parsed)

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
            return db
              .insertInto('organism')
              .values({
                id,
                identification: parsed.identification,
                confidence: parsed.confidence,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
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
