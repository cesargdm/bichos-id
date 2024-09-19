'use client'

import useSWR from 'swr'

import type { Organism } from '@/app/lib/types'

import { fetcher } from '@/app/lib/api/fetcher'
import { keys } from '@/app/lib/api/keys'

import { latestListOptions } from '../utils'
import OrganismItem from './OrganismItem'

export default function LatestsOrganisms({
	fallbackData,
}: {
	fallbackData?: Organism[]
}) {
	const { data } = useSWR<Organism[]>(
		keys.organisms.all(new URLSearchParams(latestListOptions)),
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
