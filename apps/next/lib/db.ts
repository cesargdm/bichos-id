import type { UndirectedOrderByExpression } from 'kysely/dist/cjs/parser/order-by-parser'

import { createKysely } from '@vercel/postgres-kysely'
import { z } from 'zod'

import type { Organism } from '@/app/lib/types'

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

type GetOrganismsOptions = {
	sortBy?: UndirectedOrderByExpression<Database, 'organisms', object>
	direction?: 'asc' | 'desc'
	limit?: number
	query?: string
}

/**
 * Returns a list of organisms.
 */
export function getOrganisms(options: GetOrganismsOptions = {}) {
	const { direction, limit = 50, query, sortBy = 'common_name' } = options

	const db = createKysely<Database>()

	let dbQuery = db
		.selectFrom('organisms')
		.orderBy(sortBy, direction)
		.limit(limit)
		.selectAll()

	if (query) {
		dbQuery = dbQuery.where('common_name', 'ilike', `%${query}%`)
	}

	return dbQuery.execute().catch(() => [])
}

/**
 * Returns an organism by its ID.
 */
export function getOrganism(id: string) {
	const db = createKysely<Database>()

	const dbQuery = db.selectFrom('organisms').where('id', '=', id).selectAll()

	return dbQuery.executeTakeFirst().catch(() => undefined)
}
