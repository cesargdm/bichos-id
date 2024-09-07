'use client'

import { Link, TextLink } from 'solito/link'
import { View, FlatList, Text } from 'react-native'
import useSWR from 'swr'
import { StatusBar } from 'expo-status-bar'
import { Api } from '@bichos-id/app/lib/api'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'

type Props = {
  fallbackData?: any[]
}

const fetcher = (url: string) => fetch(url).then((response) => response.json())

function DiscoverScreen({ fallbackData }: Props) {
  const { data, error, isLoading } = useSWR<any>(
    Api.getOrganismsKey(),
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
      <StatusBar style="light" />
      <FlatList
        style={{ flex: 1, width: '100%' }}
        data={data}
        renderItem={({ item }) => (
          <Link
            viewProps={
              {
                flex: 1,
                height: 200,
                borderWidth: 1,
                width: '100%',
                overflow: 'hidden',
              } as any
            }
            href={`/explore/${item.id}`}
          >
            <Text
              lineBreakMode="middle"
              style={{
                color: 'white',
                fontSize: 20,
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              {item.identification.commonName} (
              {item.identification.scientificClassification.genus}{' '}
              {item.identification.scientificClassification.species})
            </Text>
          </Link>
        )}
        numColumns={2}
      />
      <TextLink href="/">Go Home</TextLink>
    </>
  )
}

DiscoverScreen.options = {
  title: 'Explorar',
  headerTintColor: 'white',
  headerBackTitleVisible: false,
} as NativeStackNavigationOptions

export default DiscoverScreen
