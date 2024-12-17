import type { Metadata } from 'next'

import ExploreScreen from '@/app/screens/Explore'
import { getOrganisms } from '@/next/lib/db'

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const revalidate = 3600 // 1 hour

export const metadata: Metadata = {
	description:
		'Descubre insectos, arácnidos y otros bichos con Bichos ID usando inteligencia artificial.',
	title: 'Explorar',
}

export default async function ExplorePage({ searchParams }: Props) {
	const organisms = await getOrganisms(await searchParams)

	return <ExploreScreen fallbackData={organisms} />
}
