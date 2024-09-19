import type { Metadata } from 'next'

import { Suspense } from 'react'

import ExploreScreen from '@/app/screens/Explore'
import { getOrganisms } from '@/next/lib/db'

type Props = {
	searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
	description:
		'Descubre insectos, arácnidos y otros bichos con Bichos ID usando inteligencia artificial.',
	title: 'Explorar',
}

export default async function ExplorePage({ searchParams }: Props) {
	const organisms = await getOrganisms(searchParams)

	return (
		<Suspense fallback={null}>
			<ExploreScreen fallbackData={organisms} />
		</Suspense>
	)
}
