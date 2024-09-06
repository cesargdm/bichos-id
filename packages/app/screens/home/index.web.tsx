'use client'

import { View, Text } from 'react-native'
import { Link } from 'solito/link'

export default function HomeScreen() {
  return (
    <>
      <Text role="heading" aria-level="1">
        Bicho ID
      </Text>
      <Link href="/explore">Ir a explorar</Link>
    </>
  )
}
