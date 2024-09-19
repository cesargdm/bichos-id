'use client'

import useSWR from 'swr'

import type { Organism } from '@/app/lib/types'

import { fetcher } from '@/app/lib/api/fetcher'
import { keys } from '@/app/lib/api/keys'

import { featuredListOptions } from '../utils'
import OrganismItem from './OrganismItem'

export default function FeaturedOrganisms({
	fallbackData,
}: {
	fallbackData?: Organism[]
}) {
	const { data } = useSWR<Organism[]>(
		keys.organisms.all(new URLSearchParams(featuredListOptions)),
		fetcher,
		{ fallbackData, suspense: true },
	)

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				gap: 5,
				overflowX: 'auto',
				paddingBottom: 20,
				width: '100%',
			}}
		>
			{data?.map((organism) => (
				<OrganismItem key={organism.id} data={organism} />
			))}
		</div>
	)
}
