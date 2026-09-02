import type { Organism } from '@/app/lib/types'

export type Props = {
	popularOrganismsData?: Organism[]
	latestsOrganismsData?: Organism[]
	featuredOrganismsData?: Organism[]
}

// `identified: 'true'` on all three: these are the home page's showcase rows,
// and roughly 40% of records are stubs with no species — they render as
// "Sin identificación" cards linking to pages the site already marks noindex.
// Sent as a string because these objects are also fed straight into
// URLSearchParams for the client-side fetch. `/explore` stays unfiltered.
export const featuredListOptions = {
	identified: 'true',
} as const

export const latestListOptions = {
	direction: 'desc',
	identified: 'true',
	sortBy: 'created_at',
} as const

export const popularListOptions = {
	direction: 'desc',
	identified: 'true',
	sortBy: 'scan_count',
} as const
