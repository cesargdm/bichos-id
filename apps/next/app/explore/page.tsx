import { Suspense } from 'react'
import { Metadata } from 'next'

import ExploreScreen from '@bichos-id/app/screens/Explore'

export const metadata: Metadata = {
	title: 'Explorar',
	description:
		'Descubre insectos, arácnidos y otros bichos con Bichos ID usando inteligencia artificial.',
}

export default function ExplorePage() {
	const organisms = [] as any[]

	return (
		<Suspense fallback={null}>
			<ExploreScreen fallbackData={organisms} />
		</Suspense>
	)
}
