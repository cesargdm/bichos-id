import type { AnyColumn } from 'kysely'

import { neon } from '@neondatabase/serverless'
import * as Sentry from '@sentry/nextjs'
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

// Constructed lazily: `neon()` throws when POSTGRES_URL is absent, and doing
// that at module scope makes merely importing this file fatal — which breaks
// static generation instead of letting the query helpers below degrade to
// empty results.
let neonClient: ReturnType<typeof neon> | undefined

function getNeonClient() {
	neonClient ??= neon(process.env.POSTGRES_URL!)
	return neonClient
}

export const db = new Kysely<Database>({
	dialect: new NeonDialect({ neon: () => getNeonClient() }),
})

type GetOrganismsOptions = {
	sortBy?: AnyColumn<Database, 'organisms'>
	direction?: 'asc' | 'desc'
	limit?: number
	query?: string
}

/**
 * Returns a list of organisms.
 */
export const getOrganisms = cache(async (options: GetOrganismsOptions = {}) => {
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

		return await dbQuery.execute()
	} catch (error) {
		Sentry.captureException(error)
		return []
	}
})

/**
 * Returns an organism by its ID.
 */
export const getOrganism = cache(async (id: string) => {
	try {
		const dbQuery = db.selectFrom('organisms').where('id', '=', id).selectAll()
		return await dbQuery.executeTakeFirst()
	} catch (error) {
		Sentry.captureException(error)
		return undefined
	}
})

export const getOrganismScans = cache(async (id: string) => {
	try {
		return await db
			.selectFrom('organism_scans')
			.where('organism_id', '=', id)
			.selectAll()
			.execute()
	} catch (error) {
		Sentry.captureException(error)
		return []
	}
})
