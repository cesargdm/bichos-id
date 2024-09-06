'use client'

import { TextLink } from 'solito/link'
import { Text } from 'react-native'
import { useParams } from 'solito/navigation'
import useSWR from 'swr'

const useUserParams = useParams<{ id: string }>

type Props = {
  fallbackData?: {
    id: string
    identification: {
      commonName: string
      scientificClassification: {
        genus: string
        species?: string
      }
    }
  }
}

export default function DiscoverDetailScreen({ fallbackData }: Props) {
  const params = useUserParams()

  const { data, error, isLoading } = useSWR<any>(
    `https://bichos-id.fucesa.com/api/v1/organisms/${params.id}`,
    fetch,
    { fallbackData },
  )

  if (!data) {
    if (isLoading) {
      return <Text>Cargando...</Text>
    }
    return <Text>Error {JSON.stringify(error, null, 2)}</Text>
  }

  return (
    <>
      <Text role="heading" aria-level={1}>
        {data.identification.scientificClassification.genus}{' '}
        {data.identification.scientificClassification.species}
      </Text>
      <Text>{data.identification.description}</Text>
      <Text>{JSON.stringify(data, null, 2)}</Text>
      <TextLink href="/">Discover</TextLink>
    </>
  )
}
