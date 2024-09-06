import { Metadata } from 'next'
import { Suspense } from 'react'

import HomeScreen from '@bichos-id/app/screens/home'

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  )
}
