import { z } from 'zod'

export const IdentificationSchema = z.object({
	commonName: z.string(),
	classification: z.object({
		phylum: z.string(),
		class: z.string(),
		order: z.string(),
		family: z.string(),
		genus: z.string().optional(),
		species: z.string().optional(),
	}),
	_imageQualityRating: z.number(),
})

export const OrganismSchema = z.object({
	description: z.string(),
	habitat: z.string(),
	commonName: z.string(),
	metadata: z.object({
		venomous: z.object({
			type: z.string(),
			level: z.enum(['NON_VENOMOUS', 'VENOMOUS', 'HIGHLY_VENOMOUS']),
		}),
	}),
})

export interface Organism {
	id: string
	commonName: string
	classification: {
		phylum: string
		class: string
		order: string
		family: string
		genus?: string
		species?: string
	}
	description?: string
	metadata: {
		venomous: {
			type?: string
			level: 'NON_VENOMOUS' | 'VENOMOUS' | 'HIGHLY_VENOMOUS'
		}
	}
	taxonomy: 'SPECIES' | 'GENUS' | 'FAMILY'
	image_quality_rating: number
	image_key: string
	created_at: string
	updated_at: string
	created_by: string
}

export interface OrganismScan {
	id: string
	image_key: string
	organism_id: string
	model: 'gpt-4o-mini'
	image_quality_rating: number
	created_at: string
	updated_at: string
	created_by: string
}

export interface Database {
	organisms: Organism
	organism_scans: OrganismScan
}
