'use client'

import { Text } from 'react-native'
import useSWR from 'swr'
import { TextLink } from 'solito/link'
import { useParams } from 'solito/navigation'

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

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export default function DiscoverDetailScreen({ fallbackData }: Props) {
  const params = useUserParams()

  const { data, error, isLoading } = useSWR<any>(
    `https://bichos-id.fucesa.com/api/v1/organisms/${params.id}`,
    fetcher,
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
        {data.identification?.scientificClassification.genus}{' '}
        {data.identification?.scientificClassification.species}
      </Text>
      <Text>{data.identification?.description}</Text>
      <Text>{JSON.stringify(data, null, 2)}</Text>
      <TextLink href="/">Explore</TextLink>
    </>
  )
}
