'use client'

import useSWR from 'swr'

import type { Organism } from '@/app/lib/types'

import { fetcher } from '@/app/lib/api/fetcher'
import { keys } from '@/app/lib/api/keys'

import { popularListOptions } from '../utils'
import OrganismItem from './OrganismItem'

type Props = {
	fallbackData?: Organism[]
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'row',
		gap: 5,
		overflowX: 'auto',
		paddingBottom: 20,
		width: '100%',
	},
} as const

export default function MostSearched({ fallbackData }: Props) {
	const { data } = useSWR<Organism[]>(
		keys.organisms.all(new URLSearchParams(popularListOptions)),
		fetcher,
		{ fallbackData, suspense: true },
	)

	return (
		<div style={styles.container}>
			{data?.map((organism) => (
				<OrganismItem key={organism.id} data={organism} />
			))}
		</div>
	)
}
