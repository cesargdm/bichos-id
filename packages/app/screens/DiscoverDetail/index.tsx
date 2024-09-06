'use client'

import { TextLink } from 'solito/link'
import { useParams } from 'solito/navigation'

const useUserParams = useParams<{ id: string }>

export default function DiscoverDetailScreen() {
  const params = useUserParams()

  return <TextLink href="/">{params.id} 👈 Go Home</TextLink>
}
