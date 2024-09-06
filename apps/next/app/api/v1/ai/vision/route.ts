import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { createKysely } from '@vercel/postgres-kysely'
import { Database, OrganismSchema } from '../../_db'

const schema = z.object({
  base64Image: z.string().min(1).startsWith('data:image/'),
})

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
      temperature: 0.5,
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

    const id = `${parsed.identification.scientificClassification.genus}-${
      parsed.identification.scientificClassification.species ?? 'sp'
    }`

    const existing = await db
      .selectFrom('organism')
      .select('id')
      .where('id', '=', id)
      .execute()

    if (!existing.length) {
      await db
        .insertInto('organism')
        .values({
          id,
          identification: parsed.identification,
          confidence: parsed.confidence,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .executeTakeFirst()
    }

    return NextResponse.json(parsed, { status: 200 })
  } catch (error) {
    console.log(error)

    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
