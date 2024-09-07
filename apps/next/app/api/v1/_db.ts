import { z } from 'zod'

export const OrganismSchema = z.object({
  identification: z.object({
    commonName: z.string(),
    scientificClassification: z.object({
      family: z.string(),
      genus: z.string(),
      species: z.string().optional(),
    }),
    description: z.string().optional(),
    venomous: z.object({
      type: z.string().optional(),
      level: z.union([
        z.literal('NON_VENOMOUS'),
        z.literal('MILDLY_VENOMOUS'),
        z.literal('VENOMOUS'),
        z.literal('HIGHLY_VENOMOUS'),
      ]),
    }),
  }),
  confidence: z.number(),
})

export interface Organism {
  id: string
  identification: {
    commonName: string
    scientificClassification: {
      family: string
      genus: string
      species?: string
    }
    description?: string
    venomous: {
      type?: string
      level: 'NON_VENOMOUS' | 'MILDLY_VENOMOUS' | 'VENOMOUS' | 'HIGHLY_VENOMOUS'
    }
  }
  confidence: number
  created_at: string
  updated_at: string
}

export interface Database {
  organism: Organism
}
