'use client'

import useSWR from 'swr'
import { fetcher } from '@bichos-id/app/lib/api'
import Organism from './Organism'

export default function LatestDiscoveries() {
	const { data } = useSWR<any[]>(
		'/api/v1/organisms?sortBy=created_at',
		fetcher,
		{ fallbackData: [], suspense: true },
	)

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				width: '100%',
				overflowX: 'auto',
				paddingBottom: 20,
				gap: 5,
			}}
		>
			{data?.map((organism) => <Organism key={organism.id} data={organism} />)}
		</div>
	)
}
