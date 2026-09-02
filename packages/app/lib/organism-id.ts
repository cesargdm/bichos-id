/**
 * An organism's id doubles as its URL slug (`/explore/apidae-apis-mellifera`).
 *
 * It's built by joining family/genus/species, so a listing identified only to
 * family used to produce empty segments — `apidae--` — which read as broken
 * URLs and split link equity across two spellings of the same page.
 */
/** Slug for scans that couldn't be placed in any family. */
export const UNIDENTIFIED_ORGANISM_ID = 'sin-identificacion'

export function normalizeOrganismId(id: string) {
	return id
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
}

/**
 * Builds the id from the ranks that were actually identified, skipping the ones
 * that weren't. Returns undefined when nothing usable was identified at all.
 */
export function buildOrganismId(parts: (string | null | undefined)[]) {
	const id = parts
		.map((part) => normalizeOrganismId(part ?? ''))
		.filter(Boolean)
		.join('-')

	return id || undefined
}
