'use client'

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'

import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { MotiView } from 'moti'
import { Skeleton } from 'moti/skeleton'
import {
	RefreshControl,
	ImageBackground,
	FlatList,
	Platform,
	StyleSheet,
	Text,
} from 'react-native'
import { Link, TextLink } from 'solito/link'
import useSWR from 'swr'

import { Api, ASSETS_BASE_URL, fetcher } from '@bichos-id/app/lib/api'

import ErrorScreen from '../Error'

type Data = {
	id: string
	image_key: string
	common_name: string
	classification: { genus: string; species: string }
}

type Props = {
	fallbackData?: Data[]
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 1,
		padding: 1,
	},
	padded: {
		padding: 16,
	},
	shape: {
		backgroundColor: 'white',
		borderRadius: 25,
		height: 250,
		justifyContent: 'center',
		marginRight: 10,
		width: 250,
	},
})

function DiscoverScreen({ fallbackData }: Props) {
	const { data, error, isLoading, mutate } = useSWR<
		Props['fallbackData'],
		Error
	>(Api.getOrganismsKey(), fetcher, { fallbackData })

	if (!data) {
		if (isLoading) {
			return (
				<MotiView
					transition={{ delay: 1, type: 'timing' }}
					style={styles.container}
				>
					<Skeleton radius={0} colorMode="dark" width="100%" height={200} />
					<Skeleton radius={0} colorMode="dark" width="100%" height={200} />
					<Skeleton radius={0} colorMode="dark" width="100%" height={200} />
					<Skeleton radius={0} colorMode="dark" width="100%" height={200} />
				</MotiView>
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
				refreshControl={
					Platform.OS !== 'web' ? (
						<RefreshControl
							refreshing={isLoading}
							onRefresh={() => void mutate()}
						/>
					) : undefined
				}
				renderItem={({ item: organism }) => (
					<Link
						viewProps={
							{
								flex: 1,
								height: 200,
								overflow: 'hidden',
								width: '100%',
							} as object
						}
						href={`/explore/${organism.id}`}
					>
						<ImageBackground
							source={{ uri: `${ASSETS_BASE_URL}/${organism.image_key}` }}
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
										flexWrap: 'wrap',
										fontSize: 18,
										fontWeight: '700',
										width: '100%',
									}}
								>
									{organism.common_name}
								</Text>
								<Text style={{ color: 'white', fontSize: 14 }}>
									({organism.classification?.genus}{' '}
									{organism.classification?.species})
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
	headerBackTitleVisible: false,
	headerTintColor: 'white',
	title: 'Explorar',
} as NativeStackNavigationOptions

export default DiscoverScreen
