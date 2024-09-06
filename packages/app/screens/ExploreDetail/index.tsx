'use client'

import { TextLink } from 'solito/link'
import { Text } from 'react-native'
import { useParams } from 'solito/navigation'
import useSWR from 'swr'

const useUserParams = useParams<{ id: string }>

export default function DiscoverDetailScreen() {
  const params = useUserParams()

  const { data, error, isLoading } = useSWR(
    `https://bicho-id.fucesa.com/api/v1/organisms/${params.id}`,
    fetch,
  )

  if (!data) {
    if (isLoading) {
      return <Text>Cargando...</Text>
    }

    return <Text>Error {JSON.stringify(error, null, 2)}</Text>
  }

  return (
    <>
      <Text>{JSON.stringify(data, null, 2)}</Text>
      <TextLink href="/">{params.id} 👈 Go Home</TextLink>
    </>
  )
}
