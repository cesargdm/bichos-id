'use client'

import { Text, View, ScrollView } from 'react-native'
import useSWR from 'swr'
import { TextLink } from 'solito/link'
import { useParams } from 'solito/navigation'
import { StatusBar } from 'expo-status-bar'

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
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={{ gap: 8 }}
        style={{ flex: 1, padding: 10 }}
      >
        <Text
          style={{ fontSize: 20, fontWeight: '600' }}
          role="heading"
          aria-level={1}
        >
          {data.identification?.commonName} (
          {data.identification?.scientificClassification.genus}{' '}
          {data.identification?.scientificClassification.species})
        </Text>

        {data.identification.venomous ? (
          <View
            style={{
              padding: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: data.identification.venomous.level.includes(
                'HIGH',
              )
                ? 'rgba(255,0,0,0.2)'
                : 'rgba(251, 255, 0, 0.1)',
            }}
          >
            <Text
              style={{
                color: data.identification.venomous.level.includes('HIGH')
                  ? 'red'
                  : 'yellow',
              }}
            >
              {data.identification.venomous.level}
            </Text>
          </View>
        ) : null}

        <Text>{data.identification?.description}</Text>

        <TextLink href="/">Explore</TextLink>
      </ScrollView>
    </>
  )
}
