import type { Metadata } from 'next'

import { Suspense } from 'react'

import SettingsScreen from '@bichos-id/app/screens/Settings'

export const metadata: Metadata = {
	description:
		'Descubre insectos, arácnidos y otros bichos con Bichos ID usando inteligencia artificial.',
	title: 'Ajustes - Bichos ID - Fucesa',
}

export default function SettingsPage() {
	return (
		<Suspense fallback={null}>
			<SettingsScreen />
		</Suspense>
	)
}
