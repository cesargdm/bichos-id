import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const schema = z.object({
  base64Image: z.string().min(1).startsWith('data:image/'),
})

const AnimalSchema = z.object({
  identification: z.object({
    commonName: z.string(),
    scientificClassification: z.object({
      genus: z.string(),
      species: z.string().optional(),
    }),
    venomous: z.object({
      type: z.string().optional(),
      level: z.union([
        z.literal('Non-venomous'),
        z.literal('Mildly venomous'),
        z.literal('Venomous'),
        z.literal('Highly venomous'),
      ]),
    }),
  }),
  confidence: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI()

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
      response_format: zodResponseFormat(AnimalSchema, 'event'),
    })

    return NextResponse.json(response.choices[0].message.parsed, {
      status: 200,
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
