'use client'

import useSWR from 'swr'

import type { Organism } from '@/app/lib/types'

import { fetcher } from '@/app/lib/api'

import OrganismItem from './Organism'

export default function LatestDiscoveries() {
	const { data } = useSWR<Organism[]>(
		'/api/v1/organisms?sortBy=created_at&direction=desc',
		fetcher,
		{ fallbackData: [], suspense: true },
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
