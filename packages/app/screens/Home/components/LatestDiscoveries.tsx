'use client'

import useSWR from 'swr'

import { fetcher } from '@bichos-id/app/lib/api'

import type { Organism as OrganismType } from '../../../../../apps/next/app/api/v1/_db'

import Organism from './Organism'

export default function LatestDiscoveries() {
	const { data } = useSWR<OrganismType[]>(
		'/api/v1/organisms?sortBy=created_at',
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
			{data?.map((organism) => <Organism key={organism.id} data={organism} />)}
		</div>
	)
}
