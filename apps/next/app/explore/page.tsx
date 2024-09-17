import type { Metadata } from 'next'

import { Suspense } from 'react'

import ExploreScreen from '@bichos-id/app/screens/Explore'

export const metadata: Metadata = {
	description:
		'Descubre insectos, arácnidos y otros bichos con Bichos ID usando inteligencia artificial.',
	title: 'Explorar',
}

export default function ExplorePage() {
	const organisms = [] as never[]

	return (
		<Suspense fallback={null}>
			<ExploreScreen fallbackData={organisms} />
		</Suspense>
	)
}
