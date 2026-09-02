'use client'

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'

import { useEffect, useState } from 'react'
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
	useWindowDimensions,
} from 'react-native'
import { Link, TextLink } from 'solito/link'
import { useSearchParams } from 'solito/navigation'
import useSWR from 'swr'

import type { Organism } from '@/app/lib/types'

import { getImageUrl } from '@/app/lib/api/constants'
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

const TILE_HEIGHT = Platform.OS === 'web' ? 400 : 200

const DESKTOP_BREAKPOINT = 1024

function getColumnCount(width: number) {
	if (Platform.OS !== 'web') return 2

	return width >= DESKTOP_BREAKPOINT ? 3 : 2
}

function DiscoverScreen({ fallbackData }: Props) {
	const params = useSearchParams<Params>()
	const { width } = useWindowDimensions()

	// The server has no viewport, so it always renders the two-column layout.
	// Reading the real width only after mount keeps the first client render
	// identical to it — otherwise a desktop browser hydrates with three columns,
	// which changes both the row structure and the FlatList key and throws away
	// the server-rendered list.
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => setIsMounted(true), [])

	const numColumns = getColumnCount(isMounted ? width : 0)

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
				// FlatList won't change numColumns on an existing instance, so the
				// key forces a remount when the breakpoint is crossed.
				key={numColumns}
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
						style={{
							flex: 1,
							height: TILE_HEIGHT,
							overflow: 'hidden',
							width: '100%',
						}}
						href={`/explore/${organism.id}`}
					>
						{/*
						 * Explicit height rather than `flex: 1`: the Link renders as an
						 * <a>, which isn't a flex item here, so a flex-based height
						 * resolved to nothing on web and the image never rendered at all
						 * (tiles showed the name over empty space).
						 */}
						<ImageBackground
							source={{ uri: getImageUrl(organism.image_key, { width: 800 }) }}
							style={{ height: TILE_HEIGHT, width: '100%' }}
							imageStyle={{ resizeMode: 'cover' }}
						>
							<LinearGradient
								colors={['transparent', 'rgba(0,0,0,0.7)']}
								style={{
									height: '100%',
									justifyContent: 'flex-end',
									padding: 10,
								}}
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
				numColumns={numColumns}
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
