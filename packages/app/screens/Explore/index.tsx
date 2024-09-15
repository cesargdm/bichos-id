'use client'

import { Link, TextLink } from 'solito/link'
import { ImageBackground, FlatList, Text } from 'react-native'
import useSWR from 'swr'
import { StatusBar } from 'expo-status-bar'
import { Api, ASSETS_BASE_URL } from '@bichos-id/app/lib/api'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'

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
								width: '100%',
								overflow: 'hidden',
							} as any
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
