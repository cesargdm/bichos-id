import type { Organism } from '@/app/lib/types'

export type Props = {
	popularOrganismsData?: Organism[]
	latestsOrganismsData?: Organism[]
	featuredOrganismsData?: Organism[]
}

export const featuredListOptions = {}

export const latestListOptions = {
	direction: 'desc',
	sortBy: 'created_at',
} as const

export const popularListOptions = {
	direction: 'desc',
	sortBy: 'scan_count',
} as const
