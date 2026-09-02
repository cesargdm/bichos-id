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
 * Ids used to repeat a rank that already appeared in the slug —
 * `pentatomidae-chinavia-chinavia-hilaris` — because the id was built while the
 * species field still held the full binomial. Stored ids no longer contain an
 * adjacent repeated segment, so collapsing one always points at the canonical
 * page rather than inventing a URL that doesn't exist.
 */
export function repairLegacyOrganismId(id: string) {
	const parts = normalizeOrganismId(id).split('-')

	return parts.filter((part, index) => index === 0 || part !== parts[index - 1]).join('-')
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
