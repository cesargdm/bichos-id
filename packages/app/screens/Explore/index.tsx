'use client'

import { Link, TextLink } from 'solito/link'
import {
	RefreshControl,
	ImageBackground,
	FlatList,
	Platform,
	StyleSheet,
	Text,
} from 'react-native'
import useSWR from 'swr'
import { StatusBar } from 'expo-status-bar'
import { Api, ASSETS_BASE_URL, fetcher } from '@bichos-id/app/lib/api'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { Skeleton } from 'moti/skeleton'

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
	shape: {
		justifyContent: 'center',
		height: 250,
		width: 250,
		borderRadius: 25,
		marginRight: 10,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
		padding: 1,
		gap: 1,
	},
	padded: {
		padding: 16,
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
					transition={{ type: 'timing', delay: 1 }}
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
								width: '100%',
								overflow: 'hidden',
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
										fontSize: 18,
										fontWeight: '700',
										flexWrap: 'wrap',
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
	title: 'Explorar',
	headerTintColor: 'white',
	headerBackTitleVisible: false,
} as NativeStackNavigationOptions

export default DiscoverScreen
