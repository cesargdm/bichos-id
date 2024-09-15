'use client'

import { Text, View, ScrollView, FlatList, Image } from 'react-native'
import useSWR from 'swr'
import { useParams } from 'solito/navigation'
import { StatusBar } from 'expo-status-bar'

import { Api, ASSETS_BASE_URL } from '@bichos-id/app/lib/api'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'

const useUserParams = useParams<{ id: string }>

type OrganismData = {
	id: string
	images?: `${typeof ASSETS_BASE_URL}/${string}`[]
	commonName: string
	description?: string
	habitat?: string
	metadata: {
		venomous: {
			type?: string
			level: 'NON_VENOMOUS' | 'VENOMOUS' | 'HIGHLY_VENOMOUS'
		}
	}
	classification: {
		phylum: string
		class: string
		order: string
		family: string
		genus: string
		species?: string
	}
}

type Props = {
	fallbackData?: OrganismData
}

const fetcher = (url: string) => fetch(url).then((response) => response.json())

function getVenomousLabel(level: string) {
	switch (level) {
		case 'HIGHLY_VENOMOUS':
			return '🚨  De importancia médica'
		case 'VENOMOUS':
			return '⚠️  Puede causar alergias'
		case 'NON_VENOMOUS':
			return '✅  Sin importancia médica'
		default:
			return level
	}
}

function getVenomousColor(level: string) {
	switch (level) {
		case 'HIGHLY_VENOMOUS':
			return 'rgba(255,0,0,0.2)'
		case 'VENOMOUS':
			return 'rgba(238, 207, 5, 0.2)'
		case 'NON_VENOMOUS':
			return 'rgba(0,255,0,0.2)'
		default:
			return 'rgba(255,255,255,0.2)'
	}
}
function DiscoverDetailScreen({ fallbackData }: Props) {
	const params = useUserParams()

	const { data, error, isLoading } = useSWR<OrganismData>(
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
			<StatusBar style="light" />
			<ScrollView role="article" style={{ flex: 1 }}>
				<FlatList
					data={data.images}
					horizontal
					showsHorizontalScrollIndicator={false}
					style={{ width: '100%' }}
					renderItem={({ item }) => (
						<Image
							alt={`${data?.commonName} - ${data.classification?.genus} ${data.classification?.species}`}
							style={{ width: 200, height: 200, objectFit: 'cover' }}
							source={{ uri: item }}
						/>
					)}
				/>

				<View style={{ gap: 24, padding: 10 }}>
					<View>
						<Text
							style={{ fontSize: 32, fontWeight: '800', color: 'white' }}
							role="heading"
							aria-level={1}
						>
							{data?.commonName}
						</Text>

						<Text style={{ fontSize: 16, color: 'white' }}>
							Nombre científico: {data?.classification?.genus}{' '}
							{data?.classification.species}
						</Text>
					</View>

					{data?.metadata?.venomous?.level ? (
						<View
							style={{
								padding: 16,
								borderRadius: 8,
								backgroundColor: getVenomousColor(data.metadata.venomous.level),
							}}
						>
							<Text style={{ color: 'white', fontWeight: '700' }}>
								{getVenomousLabel(data.metadata.venomous.level)}
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
							Filo: {data?.classification.phylum}
							{'\n'}
							Clase: {data?.classification.class}
							{'\n'}
							Orden: {data?.classification.order}
							{'\n'}
							Familia: {data?.classification.family}
							{'\n'}
							Género: {data?.classification.genus}
							{'\n'}
							Especie: {data?.classification.species}
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
							{data?.description}
						</Text>
					</View>

					<View style={{ gap: 8 }}>
						<Text
							style={{ color: 'white', fontWeight: '800', fontSize: 18 }}
							role="heading"
							aria-level="2"
						>
							Hábitat
						</Text>
						<Text style={{ color: 'white', lineHeight: 28, fontSize: 16 }}>
							{data?.habitat}
						</Text>
					</View>
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
