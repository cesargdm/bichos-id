import type { UndirectedOrderByExpression } from 'kysely/dist/cjs/parser/order-by-parser'

import { neon } from '@neondatabase/serverless'
import { Kysely } from 'kysely'
import { NeonDialect } from 'kysely-neon'
import { cache } from 'react'
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
	model: `gpt-${string}`
	image_quality_rating: number
	created_at: string
	updated_at: string
	created_by: string
}

export interface Database {
	organisms: Organism
	organism_scans: OrganismScan
}

export const db = new Kysely<Database>({
	dialect: new NeonDialect({
		neon: neon(process.env.POSTGRES_URL!),
	}),
})

/**
 * An organism is considered "complete enough to index" only when it has real,
 * non-empty content across all of: common name, description, and a species-level
 * classification. Incomplete stubs (e.g. a genus with a trailing-dash slug and no
 * species) are thin pages that Google reports as "Crawled - currently not indexed",
 * so they should be excluded from the sitemap and marked noindex.
 */
export function isOrganismIndexable(
	organism: Pick<Organism, 'common_name' | 'description' | 'classification'>,
): boolean {
	return Boolean(
		organism.common_name?.trim() &&
			organism.description?.trim() &&
			organism.classification?.species?.trim(),
	)
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
export const getOrganisms = cache((options: GetOrganismsOptions = {}) => {
	try {
		const { direction, limit = 50, query, sortBy = 'common_name' } = options

		let dbQuery = db
			.selectFrom('organisms')
			.orderBy(sortBy, direction)
			.limit(limit)
			.selectAll()

		if (query) {
			dbQuery = dbQuery.where('common_name', 'ilike', `%${query}%`)
		}

		return dbQuery.execute()
	} catch {
		return []
	}
})

/**
 * Returns an organism by its ID.
 */
export const getOrganism = cache((id: string) => {
	try {
		const dbQuery = db.selectFrom('organisms').where('id', '=', id).selectAll()
		return dbQuery.executeTakeFirst()
	} catch {
		return undefined
	}
})

export const getOrganismScans = cache((id: string) => {
	try {
		return db
			.selectFrom('organism_scans')
			.where('organism_id', '=', id)
			.selectAll()
			.execute()
	} catch {
		return []
	}
})
