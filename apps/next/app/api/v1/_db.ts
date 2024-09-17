import { z } from 'zod'

export const IdentificationSchema = z.object({
	_imageQualityRating: z.number(),
	classification: z.object({
		class: z.string(),
		family: z.string(),
		genus: z.string().optional(),
		order: z.string(),
		phylum: z.string(),
		species: z.string().optional(),
	}),
	common_name: z.string(),
})

export const OrganismSchema = z.object({
	common_name: z.string(),
	description: z.string(),
	habitat: z.string(),
	metadata: z.object({
		venomous: z.object({
			level: z.enum(['NON_VENOMOUS', 'VENOMOUS', 'HIGHLY_VENOMOUS']),
			type: z.string(),
		}),
	}),
})

export interface Organism {
	id: string
	common_name: string
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
	scan_count: number
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
