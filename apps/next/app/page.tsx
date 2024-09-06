import { Metadata } from 'next'
import { Suspense } from 'react'

import HomeScreen from '@bichos-id/app/screens/home'

export const metadata: Metadata = {
  title: 'Bichos ID - Fucesa',
  description:
    'Identifica insectos, arácnidos y otros bichos con Bichos ID usando inteligencia artificial.',
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  )
}
