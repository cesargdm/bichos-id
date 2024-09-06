import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { createKysely } from '@vercel/postgres-kysely'
import { put } from '@vercel/blob'

import { Database, OrganismSchema } from '../../_db'

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

    const userId = request.headers.get('x-user-id') ?? 'anonymous'

    const data = await request.json()

    schema.parse(data)

    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert entomologist.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Identify the insect or arachnid in the next photo. Use shape, color and subject surroundings to archive the best identification.',
            },
            {
              type: 'image_url',
              image_url: {
                url: data.base64Image,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      user: userId,
      response_format: zodResponseFormat(OrganismSchema, 'event'),
    })

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
      put(
        `/organisms/${id}/${Date.now()}.jpeg`,
        Buffer.from(
          data.base64Image.replace(/^data:image\/\w+;base64,/, ''),
          'base64',
        ).toString('binary'),
        { access: 'public' },
      ),
    ])

    return NextResponse.json({ id, ...parsed }, { status: 200 })
  } catch (error) {
    console.log(error)

    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
