import type { AnyColumn } from 'kysely'

import { neon } from '@neondatabase/serverless'
import { Kysely, sql } from 'kysely'
import { NeonDialect } from 'kysely-neon'
import { cache } from 'react'
import { z } from 'zod'

import type { Organism } from '@/app/lib/types'

// Every string here comes straight from the model, which occasionally returns
// values with surrounding whitespace (there is a " abejorro de cabeza grande"
// in the database, leading space and all, which then renders into headings and
// page titles). Trimming at the parse boundary keeps it out of the database —
// and matters most for the classification fields, since those are concatenated
// into the organism id and its R2 object path.
export const IdentificationSchema = z.object({
	_imageQualityRating: z.number(),
	classification: z.object({
		class: z.string().trim(),
		family: z.string().trim(),
		// `.nullable()`, not `.optional()`: OpenAI's structured outputs require
		// every field to be present, and `zodResponseFormat` throws outright on
		// an optional-but-not-nullable field ("uses `.optional()` without
		// `.nullable()` which is not supported by the API"). That throw happened
		// before any request reached OpenAI, so identification failed with a
		// generic 500 for every authenticated request.
		genus: z.string().trim().nullable(),
		order: z.string().trim(),
		phylum: z.string().trim(),
		species: z.string().trim().nullable(),
	}),
	common_name: z.string().trim(),
})

export const OrganismSchema = z.object({
	common_name: z.string().trim(),
	description: z.string().trim(),
	habitat: z.string().trim(),
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
// that at module scope makes merely importing this file fatal.
let neonClient: ReturnType<typeof neon> | undefined

function getNeonClient() {
	neonClient ??= neon(process.env.POSTGRES_URL!)
	return neonClient
}

export const db = new Kysely<Database>({
	dialect: new NeonDialect({ neon: () => getNeonClient() }),
})

/**
 * Whether a database connection is configured at all.
 *
 * Used only so a build without `POSTGRES_URL` (local, CI) can still prerender
 * pages instead of failing. Genuine query errors are deliberately NOT
 * swallowed: returning empty data on a transient failure would let ISR cache
 * an empty page — or, worse, a `notFound()` 404 for a real organism — for the
 * whole revalidate window. Letting them throw yields an uncached 500 instead.
 */
function isDatabaseConfigured() {
	return Boolean(process.env.POSTGRES_URL)
}

type GetOrganismsOptions = {
	sortBy?: AnyColumn<Database, 'organisms'>
	direction?: 'asc' | 'desc'
	limit?: number
	query?: string
}

/** The sitemap protocol caps a single sitemap file at 50,000 URLs. */
const SITEMAP_MAX_URLS = 50_000

/**
 * An organism is complete enough to index only when it has real content for
 * all of: common name, description, and a species-level classification.
 *
 * Incomplete stubs — a family or genus with no species, whose slug ends in a
 * trailing dash (`acrididae-caelifera-`, or even `--`) — are thin pages that
 * Google reports as "Crawled - currently not indexed". They should be marked
 * noindex on their detail page and kept out of the sitemap.
 *
 * NOTE: `indexableOrganismFilter` below expresses this same rule in SQL so the
 * sitemap can filter without transferring every description. Keep the two in
 * sync.
 */
export function isOrganismIndexable(
	organism: Pick<Organism, 'classification' | 'common_name' | 'description'>,
) {
	return Boolean(
		organism.common_name?.trim() &&
			organism.description?.trim() &&
			organism.classification?.species?.trim(),
	)
}

/** SQL counterpart of {@link isOrganismIndexable}. */
const indexableOrganismFilter = sql<boolean>`
	btrim(coalesce(common_name, '')) <> ''
	and btrim(coalesce(description, '')) <> ''
	and btrim(coalesce(classification ->> 'species', '')) <> ''
`

/**
 * Returns a list of organisms.
 */
export const getOrganisms = cache((options: GetOrganismsOptions = {}) => {
	if (!isDatabaseConfigured()) return []

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
})

/**
 * Returns the id and last-modified date of every organism worth indexing.
 *
 * Deliberately not `getOrganisms()`: that selects every column (including the
 * long `description` text) and caps at 50 rows by default, which silently
 * truncated the sitemap. This selects two columns and filters incomplete stubs
 * out in SQL, so the full catalogue stays cheap to fetch.
 */
export const getIndexableOrganismRefs = cache((limit = SITEMAP_MAX_URLS) => {
	if (!isDatabaseConfigured()) return []

	return db
		.selectFrom('organisms')
		.where(indexableOrganismFilter)
		// Ordered by the primary key: stable output for diffing, and free
		// compared with sorting the whole table on an unindexed column.
		.orderBy('id', 'asc')
		.select(['id', 'updated_at'])
		.limit(limit)
		.execute()
})

/**
 * Returns an organism by its ID.
 */
export const getOrganism = cache((id: string) => {
	if (!isDatabaseConfigured()) return undefined

	return db
		.selectFrom('organisms')
		.where('id', '=', id)
		.selectAll()
		.executeTakeFirst()
})

export const getOrganismScans = cache((id: string) => {
	if (!isDatabaseConfigured()) return []

	return db
		.selectFrom('organism_scans')
		.where('organism_id', '=', id)
		.selectAll()
		.execute()
})
