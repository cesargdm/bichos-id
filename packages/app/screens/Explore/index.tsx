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
import { useSearchParams } from 'solito/navigation'
import useSWR from 'swr'

import type { Organism } from '@/app/lib/types'

import { ASSETS_BASE_URL } from '@/app/lib/api/constants'
import { fetcher } from '@/app/lib/api/fetcher'
import { keys } from '@/app/lib/api/keys'

import ErrorScreen from '../Error'

type Props = {
	fallbackData?: Organism[]
}

const styles = StyleSheet.create({
	container: { flex: 1, width: '100%' },
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
	skeletonContainer: {
		flex: 1,
		gap: 1,
		padding: 1,
	},
})

type Params = {
	query?: string
}

function DiscoverScreen({ fallbackData }: Props) {
	const params = useSearchParams<Params>()

	const { data, error, isLoading, mutate } = useSWR<
		Props['fallbackData'],
		Error
	>(keys.organisms.all(params), fetcher, { fallbackData })

	if (!data) {
		if (isLoading) {
			return (
				<MotiView
					transition={{ delay: 1, type: 'timing' }}
					style={styles.skeletonContainer}
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
				style={styles.container}
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
						viewProps={{
							style: {
								flex: 1,
								minHeight: Platform.OS === 'web' ? 400 : 200,
								overflow: 'hidden',
								width: '100%',
							},
						}}
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
