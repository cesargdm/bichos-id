'use client'

import { Text, View, ScrollView, FlatList, Image } from 'react-native'
import useSWR from 'swr'
import { TextLink } from 'solito/link'
import { useParams } from 'solito/navigation'
import { StatusBar } from 'expo-status-bar'

import { Api, ASSETS_BASE_URL } from '@bichos-id/app/lib/api'

const useUserParams = useParams<{ id: string }>

type Props = {
  fallbackData?: {
    id: string
    images?: `${typeof ASSETS_BASE_URL}/${string}`[]
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
    Api.getOrganismKey(params.id),
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

        {data.identification?.venomous ? (
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

        <Text role="heading" aria-level="2">
          Taxonomía
        </Text>

        <View>
          <Text>
            Familia: {data.identification?.scientificClassification.family}
          </Text>
          <Text>
            Género: {data.identification?.scientificClassification.genus}
          </Text>
          <Text>
            Especie: {data.identification?.scientificClassification.species}
          </Text>
        </View>

        <Text role="heading" aria-level="2">
          Descripción
        </Text>
        <Text>{data.identification?.description}</Text>

        <Text role="heading" aria-level="2">
          Últimas imágenes
        </Text>

        <FlatList
          data={data.images}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ width: '100%' }}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Image
              alt={`${data.identification?.commonName} - ${data.identification?.scientificClassification.genus} ${data.identification?.scientificClassification.species}`}
              style={{ width: 200, height: 200, objectFit: 'contain' }}
              source={{ uri: item }}
            />
          )}
        />

        <TextLink
          href={`https://google.com/search?q=${data.identification?.scientificClassification.genus} ${data.identification?.scientificClassification.species}`}
        >
          Google It
        </TextLink>

        <TextLink href="/">Explore</TextLink>
      </ScrollView>
    </>
  )
}
