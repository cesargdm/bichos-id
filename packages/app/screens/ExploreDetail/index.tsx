/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */
'use client'

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'

import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { Text, View, ScrollView, FlatList, StyleSheet } from 'react-native'
import { SolitoImage } from 'solito/image'
import { useParams } from 'solito/navigation'
import useSWR from 'swr'

import type { ASSETS_BASE_URL } from '@/app/lib/api'
import type { Organism } from '@/app/lib/types'

import { Api, fetcher } from '@/app/lib/api'

import { getTaxonomyLabel, getVenomousColor, getVenomousLabel } from './utils'

const useUserParams = useParams<{ id: string }>

type Props = {
	fallbackData?: Organism & { images?: `${typeof ASSETS_BASE_URL}/${string}`[] }
}

const styles = StyleSheet.create({
	tagContainer: {
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 999,
		flexDirection: 'row',
		gap: 5,
		overflow: 'hidden',
		padding: 10,
		paddingHorizontal: 15,
	},
})

function DiscoverDetailScreen({ fallbackData }: Props) {
	const params = useUserParams()

	const { data, error, isLoading } = useSWR<Props['fallbackData'], Error>(
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
					position: 'absolute',
					top: 0,
					width: '100%',
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
						<SolitoImage
							alt={`${data?.common_name} - ${data.classification?.genus} ${data.classification?.species}`}
							contentFit="cover"
							width={200}
							height={300}
							src={item}
						/>
					)}
				/>

				<View style={{ gap: 24, padding: 10 }}>
					<View>
						<Text
							style={{ color: 'white', fontSize: 40, fontWeight: '600' }}
							role="heading"
							aria-level={1}
						>
							{data?.common_name}
						</Text>

						<Text style={{ color: 'white', fontSize: 16 }}>
							Nombre científico: {data?.classification?.genus}{' '}
							{data?.classification?.species}
						</Text>
					</View>

					<View style={{ backgroundColor: '#333', height: 1, width: '100%' }} />

					<ScrollView
						contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
						style={{ flexDirection: 'row', marginHorizontal: -20 }}
						horizontal
						bounces={false}
						showsHorizontalScrollIndicator={false}
					>
						{data?.metadata?.venomous?.level ? (
							<View
								style={{
									alignItems: 'center',
									backgroundColor: getVenomousColor(
										data.metadata.venomous.level,
									),
									borderRadius: 999,
									flexDirection: 'row',
									gap: 5,
									padding: 10,
									paddingHorizontal: 15,
								}}
							>
								<SolitoImage
									alt=""
									style={{ height: 15, width: 15 }}
									src={require('./medical-cross.png')}
								/>
								<Text style={{ color: 'white', fontWeight: '700' }}>
									{getVenomousLabel(data.metadata.venomous.level)}
								</Text>
							</View>
						) : null}
						<View style={styles.tagContainer}>
							<SolitoImage
								alt=""
								style={{ height: 15, width: 15 }}
								src={require('./eye.png')}
							/>
							<Text style={{ color: 'white' }}>{data.scan_count}</Text>
						</View>
						<View style={styles.tagContainer}>
							<SolitoImage
								alt=""
								style={{ height: 15, width: 15 }}
								src={require('./dna.png')}
							/>
							<Text style={{ color: 'white' }}>
								{getTaxonomyLabel(data.taxonomy)}
							</Text>
						</View>
					</ScrollView>

					<View style={{ backgroundColor: '#333', height: 1, width: '100%' }} />

					<View style={{ gap: 8 }}>
						<Text
							style={{ color: 'white', fontSize: 18, fontWeight: '800' }}
							role="heading"
							aria-level="2"
						>
							Descripción
						</Text>
						<Text style={{ color: 'white', fontSize: 16, lineHeight: 28 }}>
							{data?.description}
						</Text>
					</View>

					<View style={{ backgroundColor: '#333', height: 1, width: '100%' }} />

					<View style={{ gap: 8 }}>
						<Text
							style={{ color: 'white', fontSize: 18, fontWeight: '800' }}
							role="heading"
							aria-level="2"
						>
							Hábitat
						</Text>
						<Text style={{ color: 'white', fontSize: 16, lineHeight: 28 }}>
							{data?.habitat}
						</Text>
					</View>

					<View style={{ backgroundColor: '#333', height: 1, width: '100%' }} />

					<View style={{ gap: 8 }}>
						<Text
							style={{ color: 'white', fontSize: 18, fontWeight: '800' }}
							role="heading"
							aria-level="2"
						>
							Taxonomía
						</Text>
						<Text style={{ color: 'white', fontSize: 16, lineHeight: 28 }}>
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
	headerBackTitleVisible: false,
	headerTintColor: 'white',
	headerTransparent: true,
	title: '',
} as NativeStackNavigationOptions

export default DiscoverDetailScreen
