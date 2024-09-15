import { Suspense } from 'react'
import { Metadata } from 'next'

import SettingsScreen from '@bichos-id/app/screens/Settings'

export const metadata: Metadata = {
	title: 'Ajustes - Bichos ID - Fucesa',
	description:
		'Descubre insectos, arácnidos y otros bichos con Bichos ID usando inteligencia artificial.',
}

export default function SettingsPage() {
	return (
		<Suspense fallback={null}>
			<SettingsScreen />
		</Suspense>
	)
}
