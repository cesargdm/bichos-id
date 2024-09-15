'use client'

import { Link, TextLink } from 'solito/link'
import { View, ImageBackground, FlatList, Text } from 'react-native'
import useSWR from 'swr'
import { StatusBar } from 'expo-status-bar'
import { Api, ASSETS_BASE_URL, fetcher } from '@bichos-id/app/lib/api'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'

import ErrorScreen from '../Error'

type Data = {
	id: string
	image_key: string
	commonName: string
	classification: { genus: string; species: string }
}

type Props = {
	fallbackData?: Data[]
}

function DiscoverScreen({ fallbackData }: Props) {
	const { data, error, isLoading } = useSWR<Props['fallbackData'], Error>(
		Api.getOrganismsKey(),
		fetcher,
		{ fallbackData },
	)

	if (!data) {
		if (isLoading) {
			return (
				<View style={{ flex: 1 }}>
					<Text style={{ color: 'white' }}>Cargando...</Text>
				</View>
			)
		}

		return <ErrorScreen error={error} />
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
								width: '100%',
								overflow: 'hidden',
							} as object
						}
						href={`/explore/${item.id}`}
					>
						<ImageBackground
							source={{ uri: `${ASSETS_BASE_URL}/${item.image_key}` }}
							style={{ flex: 1 }}
							resizeMode="cover"
						>
							<LinearGradient
								colors={['transparent', 'rgba(0,0,0,0.7)']}
								style={{ flex: 1, justifyContent: 'flex-end', padding: 10 }}
							>
								<Text
									lineBreakMode="middle"
									style={{
										color: 'white',
										fontSize: 18,
										fontWeight: '700',
										flexWrap: 'wrap',
										width: '100%',
									}}
								>
									{item.commonName}
								</Text>
								<Text style={{ color: 'white', fontSize: 14 }}>
									({item.classification?.genus} {item.classification?.species})
								</Text>
							</LinearGradient>
						</ImageBackground>
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
