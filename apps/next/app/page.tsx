import { Suspense } from 'react'

import HomeScreen from '@bichos-id/app/screens/Home'

export default function HomePage() {
	return (
		<Suspense fallback={null}>
			<HomeScreen />
		</Suspense>
	)
}
