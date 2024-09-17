'use client'

import useSWR from 'swr'

import { fetcher } from '@bichos-id/app/lib/api'

import Organism from './Organism'

export default function MostSearched() {
	const { data } = useSWR<any[]>(
		'/api/v1/organisms?sortBy=scan_count&direction=desc',
		fetcher,
		{ fallbackData: [], suspense: true },
	)

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				overflowX: 'auto',
				width: '100%',
				paddingBottom: 20,
				gap: 5,
			}}
		>
			{data?.map((organism) => <Organism key={organism.id} data={organism} />)}
		</div>
	)
}
