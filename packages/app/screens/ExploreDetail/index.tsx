'use client'

import {
	Text,
	View,
	ScrollView,
	FlatList,
	Image,
	StyleSheet,
} from 'react-native'
import useSWR from 'swr'
import { useParams } from 'solito/navigation'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'

import { Api, ASSETS_BASE_URL, fetcher } from '@bichos-id/app/lib/api'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'

const useUserParams = useParams<{ id: string }>

type OrganismData = {
	id: string
	images?: `${typeof ASSETS_BASE_URL}/${string}`[]
	commonName: string
	description?: string
	habitat?: string
	scansCount?: number
	taxonomy: 'SPECIES' | 'GENUS' | 'FAMILY'
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
		genus?: string
		species?: string
	}
}

type Props = {
	fallbackData?: OrganismData
}

function getVenomousLabel(level: string) {
	switch (level) {
		case 'HIGHLY_VENOMOUS':
			return 'Importancia médica'
		case 'VENOMOUS':
			return 'Precaución médica'
		case 'NON_VENOMOUS':
			return 'Sin importancia médica'
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
		default:
			return 'rgba(255,255,255,0.1)'
	}
}

const styles = StyleSheet.create({
	tagContainer: {
		padding: 10,
		paddingHorizontal: 15,
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 999,
		overflow: 'hidden',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
})

function getTaxonomyLabel(data: OrganismData['taxonomy']) {
	return {
		SPECIES: 'Especie',
		GENUS: 'Género',
		FAMILY: 'Familia',
	}[data]
}

function DiscoverDetailScreen({ fallbackData }: Props) {
	const params = useUserParams()

	const { data, error, isLoading } = useSWR<OrganismData, Error>(
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
			<LinearGradient
				colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0)']}
				style={{
					height: 100,
					width: '100%',
					position: 'absolute',
					top: 0,
					zIndex: 999,
				}}
			/>
			<StatusBar style="light" />
			<ScrollView
				role="article"
				style={{ flex: 1 }}
				contentContainerStyle={{ paddingBottom: 50 }}
			>
				<FlatList
					data={data.images}
					horizontal
					bounces={false}
					showsHorizontalScrollIndicator={false}
					style={{ width: '100%' }}
					renderItem={({ item }) => (
						<Image
							alt={`${data?.commonName} - ${data.classification?.genus} ${data.classification?.species}`}
							style={{ width: 200, height: 300, objectFit: 'cover' }}
							source={{ uri: item }}
						/>
					)}
				/>

				<View style={{ gap: 24, padding: 10 }}>
					<View>
						<Text
							style={{ fontSize: 40, fontWeight: '600', color: 'white' }}
							role="heading"
							aria-level={1}
						>
							{data?.commonName}
						</Text>

						<Text style={{ fontSize: 16, color: 'white' }}>
							Nombre científico: {data?.classification?.genus}{' '}
							{data?.classification?.species}
						</Text>
					</View>

					<View style={{ height: 1, width: '100%', backgroundColor: '#333' }} />

					<ScrollView
						contentContainerStyle={{ gap: 10 }}
						style={{ flexDirection: 'row' }}
						horizontal
						bounces={false}
					>
						{data?.metadata?.venomous?.level ? (
							<View
								style={{
									padding: 10,
									paddingHorizontal: 15,
									borderRadius: 999,
									backgroundColor: getVenomousColor(
										data.metadata.venomous.level,
									),
								}}
							>
								<Text style={{ color: 'white', fontWeight: '700' }}>
									{getVenomousLabel(data.metadata.venomous.level)}
								</Text>
							</View>
						) : null}
						<View style={styles.tagContainer}>
							{/* <Ionicons size={15} color="white" name="eye" /> */}
							<Text style={{ color: 'white' }}>{data.scansCount}</Text>
						</View>
						<View style={styles.tagContainer}>
							{/* <Ionicons size={15} color="white" name="library" /> */}
							<Text style={{ color: 'white' }}>
								{getTaxonomyLabel(data.taxonomy)}
							</Text>
						</View>
					</ScrollView>

					<View style={{ height: 1, width: '100%', backgroundColor: '#333' }} />

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

					<View style={{ height: 1, width: '100%', backgroundColor: '#333' }} />

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

					<View style={{ height: 1, width: '100%', backgroundColor: '#333' }} />

					<View style={{ gap: 8 }}>
						<Text
							style={{ color: 'white', fontWeight: '800', fontSize: 18 }}
							role="heading"
							aria-level="2"
						>
							Taxonomía
						</Text>
						<Text style={{ color: 'white', lineHeight: 28, fontSize: 16 }}>
							{`Filo: ${data?.classification?.phylum}
  Clase: ${data?.classification?.class}
    Orden: ${data?.classification?.order}
      Familia: ${data?.classification?.family}
        Género: ${data?.classification?.genus}
          Especie: ${data?.classification?.species}`}
						</Text>
					</View>
				</View>
			</ScrollView>
		</>
	)
}

DiscoverDetailScreen.options = {
	headerTransparent: true,
	headerBackTitleVisible: false,
	title: '',
	headerTintColor: 'white',
} as NativeStackNavigationOptions

export default DiscoverDetailScreen
