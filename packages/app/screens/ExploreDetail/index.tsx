'use client'

import { useEffect } from 'react'
import { Text, View, ScrollView, FlatList, Image } from 'react-native'
import useSWR from 'swr'
import { TextLink } from 'solito/link'
import { useParams } from 'solito/navigation'
import { StatusBar } from 'expo-status-bar'

import { Api, ASSETS_BASE_URL } from '@bichos-id/app/lib/api'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'

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

function getVenomousLabel(level: string) {
  switch (level) {
    case 'HIGHLY_VENOMOUS':
      return '🚨 De importancia médica'
    case 'MILDLY_VENOMOUS':
      return '🚨 De importancia médica'
    case 'VENOMOUS':
      return '⚠️ Puede causar alergias'
    case 'NON_VENOMOUS':
      return '✅ Sin importancia médica'
  }
}

function getVenomousColor(level: string) {
  switch (level) {
    case 'HIGHLY_VENOMOUS':
      return 'rgba(255,0,0,0.2)'
    case 'MILDLY_VENOMOUS':
      return 'rgba(255, 123, 0, 0.2)'
    case 'VENOMOUS':
      return 'rgba(238, 207, 5, 0.2)'
    case 'NON_VENOMOUS':
      return 'rgba(0,255,0,0.2)'
  }
}
function DiscoverDetailScreen({ fallbackData }: Props) {
  const params = useUserParams()

  const { data, error, isLoading } = useSWR<any>(
    Api.getOrganismKey(params.id),
    fetcher,
    { fallbackData },
  )

  useEffect(() => {}, [data])

  if (!data) {
    if (isLoading) {
      return <Text>Cargando...</Text>
    }
    return <Text>Error {JSON.stringify(error, null, 2)}</Text>
  }

  return (
    <>
      <StatusBar style="light" />
      <ScrollView style={{ flex: 1 }}>
        <FlatList
          data={data.images}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ width: '100%' }}
          renderItem={({ item }) => (
            <Image
              alt={`${data.identification?.commonName} - ${data.identification?.scientificClassification.genus} ${data.identification?.scientificClassification.species}`}
              style={{ width: 200, height: 200, objectFit: 'cover' }}
              source={{ uri: item }}
            />
          )}
        />

        <View style={{ gap: 24, padding: 10 }}>
          <Text
            style={{ fontSize: 32, fontWeight: '800', color: 'white' }}
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
                padding: 16,
                borderRadius: 8,
                backgroundColor: getVenomousColor(
                  data.identification.venomous.level,
                ),
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>
                {getVenomousLabel(data.identification.venomous.level)}
              </Text>
            </View>
          ) : null}

          <View style={{ gap: 8 }}>
            <Text
              style={{ color: 'white', fontWeight: '800', fontSize: 18 }}
              role="heading"
              aria-level="2"
            >
              Taxonomía
            </Text>
            <Text style={{ color: 'white', lineHeight: 28, fontSize: 16 }}>
              Familia: {data.identification?.scientificClassification.family}
            </Text>
            <Text style={{ color: 'white', lineHeight: 28, fontSize: 16 }}>
              Género: {data.identification?.scientificClassification.genus}
            </Text>
            <Text style={{ color: 'white', lineHeight: 28, fontSize: 16 }}>
              Especie: {data.identification?.scientificClassification.species}
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text
              style={{ color: 'white', fontWeight: '800', fontSize: 18 }}
              role="heading"
              aria-level="2"
            >
              Descripción
            </Text>
            <Text style={{ color: 'white', lineHeight: 28, fontSize: 16 }}>
              {data.identification?.description}
            </Text>
          </View>

          <TextLink
            href={`https://google.com/search?q=${data.identification?.scientificClassification.genus} ${data.identification?.scientificClassification.species}`}
          >
            Google It
          </TextLink>

          <TextLink href="/">Explore</TextLink>
        </View>
      </ScrollView>
    </>
  )
}

DiscoverDetailScreen.options = {
  title: '',
  headerTintColor: 'white',
  headerBackTitleVisible: false,
  headerBlurEffect: 'dark',
} as NativeStackNavigationOptions

export default DiscoverDetailScreen
