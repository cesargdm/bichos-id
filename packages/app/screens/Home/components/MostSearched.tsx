'use client'

import useSWR from 'swr'

import { fetcher } from '@bichos-id/app/lib/api'

import Organism from './Organism'

export default function MostSearched() {
	const { data } = useSWR<{ id: string }[]>(
		'/api/v1/organisms?sortBy=scan_count&direction=desc',
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
