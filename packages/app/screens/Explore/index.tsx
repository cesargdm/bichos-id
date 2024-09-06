'use client'

import { createParam } from 'solito'
import { Link, TextLink } from 'solito/link'
import { ScrollView, Text, View } from 'react-native'
import useSWR from 'swr'
import { StatusBar } from 'expo-status-bar'

type Props = {
  fallbackData?: any[]
}

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export default function DiscoverScreen({ fallbackData }: Props) {
  const { data, error, isLoading } = useSWR<any>(
    `https://bichos-id.fucesa.com/api/v1/organisms`,
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16 }}>
        {data.map((item: any) => (
          <Link href={`/explore/${item.id}`} key={item.id}>
            <Text>
              {item.identification.commonName} (
              {item.identification.scientificClassification.genus}{' '}
              {item.identification.scientificClassification.species})
            </Text>
          </Link>
        ))}
        <TextLink href="/">Go Home</TextLink>
      </ScrollView>
    </>
  )
}
