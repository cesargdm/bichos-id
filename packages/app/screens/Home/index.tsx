'use client'

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import type { Point } from 'react-native-vision-camera'

import { Ionicons } from '@expo/vector-icons'
import MaskedView from '@react-native-masked-view/masked-view'
import { useIsFocused } from '@react-navigation/native'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useRef, useState, useEffect } from 'react'
import { StyleSheet, Text, View, Alert, Image, Pressable } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useMMKVBoolean } from 'react-native-mmkv'
import { runOnJS } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
	Camera,
	useCameraPermission,
	useCameraDevice,
} from 'react-native-vision-camera'
import { Link } from 'solito/link'
import { useRouter } from 'solito/navigation'

import { Api } from '@bichos-id/app/lib/api'

const CAPTURABLE_WIDTH_PERCENTAGE = 0.6
const CAPTURABLE_HEIGHT_PERCENTAGE = 0.4

const styles = StyleSheet.create({
	bottomActionsContainer: {
		justifyContent: 'space-between',
		width: '100%',
	},
	bottomActionsContent: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},
	camera: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'flex-end',
		position: 'relative',
	},
	container: {
		backgroundColor: 'black',
		flex: 1,
		justifyContent: 'space-between',
	},
	loadingContainer: {
		alignItems: 'center',
		height: '100%',
		justifyContent: 'center',
		position: 'absolute',
		width: '100%',
	},
	mask: {
		backgroundColor: 'black',
		borderRadius: 16,
		height: `${CAPTURABLE_HEIGHT_PERCENTAGE * 100}%`,
		width: `${CAPTURABLE_WIDTH_PERCENTAGE * 100}%`,
	},
	maskContainer: {
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		flex: 1,
		justifyContent: 'center',
	},
	maskedView: {
		height: '100%',
		position: 'absolute',
		width: '100%',
	},
	permissionContainer: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center',
	},
	shutterInnerCircle: {
		alignContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
		borderRadius: 999,
		height: '100%',
		justifyContent: 'center',
		width: '100%',
	},
	topActionsContainer: {
		justifyContent: 'space-between',
		width: '100%',
	},
	topActionsContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},
})

function HomeScreen() {
	const router = useRouter()
	const cameraRef = useRef<Camera>(null)
	const isFocused = useIsFocused()
	const { hasPermission, requestPermission } = useCameraPermission()
	const [isOnboardingComplete] = useMMKVBoolean(
		'@bichos-id/onboarding-complete',
	)
	const [isCameraInitialized, setIsCameraInitialized] = useState(false)

	const device = useCameraDevice('back')
	const [isLoading, setIsLoading] = useState(false)
	const [base64Image, setBase64Image] = useState<string | null>(null)
	const [isTorchEnabled, setIsTorchEnabled] = useState<'on' | 'off'>('off')

	const isCameraActive = hasPermission && isFocused

	const identifyImage = useCallback(async (base64Image: string) => {
		try {
			setBase64Image(base64Image)

			await new Promise((resolve) => setTimeout(resolve, 5000))

			const data = await Api.identify(`data:image/jpeg;base64,${base64Image}`)

			if (data.error) {
				return Alert.alert('Error', data.error)
			}

			router.push(`/explore/${data.id}`)
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Error al capturar la imagen'

			Alert.alert('Error', message)
		} finally {
			setBase64Image(null)
		}
	}, [])

	useEffect(() => {
		if (!isFocused) return
		if (isOnboardingComplete) return

		router.push('/settings')
	}, [isFocused])

	const handleCameraInitialized = useCallback(() => {
		setIsCameraInitialized(true)
	}, [])

	const handleCapture = useCallback(async () => {
		setIsLoading(true)

		try {
			const photo = await cameraRef.current?.takePhoto({
				enableShutterSound: false,
			})

			if (!photo) {
				throw new Error('No image taken')
			}

			const photoHeight = photo.height
			const photoWidth = photo.width

			const photoRatio = photoHeight / photoWidth

			const PHOTO_HEIGHT = 500 / CAPTURABLE_HEIGHT_PERCENTAGE
			const PHOTO_WIDTH = Math.round(PHOTO_HEIGHT * photoRatio)

			const base64Image = await manipulateAsync(
				photo.path,
				[
					{
						resize: { height: PHOTO_HEIGHT, width: PHOTO_WIDTH },
					},
					{
						crop: {
							height: PHOTO_HEIGHT * CAPTURABLE_HEIGHT_PERCENTAGE,
							originX: PHOTO_WIDTH * ((1 - CAPTURABLE_WIDTH_PERCENTAGE) / 2),
							originY: PHOTO_HEIGHT * ((1 - CAPTURABLE_HEIGHT_PERCENTAGE) / 2),
							width: PHOTO_WIDTH * CAPTURABLE_WIDTH_PERCENTAGE,
						},
					},
				],
				{ base64: true, compress: 0.666, format: SaveFormat.JPEG },
			).then((result) => result.base64)

			if (!base64Image) throw new Error('No image taken')

			await identifyImage(base64Image)
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : 'Error al capturar la imagen'

			Alert.alert('Error', message)
		} finally {
			setIsLoading(false)
		}
	}, [router])

	const handleToggleTorch = useCallback(() => {
		setIsTorchEnabled((prev) => (prev === 'on' ? 'off' : 'on'))
	}, [])

	const handlePickImage = useCallback(async () => {
		try {
			setIsLoading(true)

			const result = await launchImageLibraryAsync({
				base64: true,
				mediaTypes: MediaTypeOptions.Images,
				quality: 0.3,
			})

			if (result.canceled) {
				throw new Error('Image selection canceled')
			}

			const image = result.assets[0]

			if (!image?.base64) {
				throw new Error('No image selected')
			}

			await identifyImage(image.base64)
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: 'Error al seleccionar la imagen'

			Alert.alert('Error', message)
			//
		} finally {
			setIsLoading(false)
		}
	}, [router])

	const focus = useCallback((point: Point) => {
		if (cameraRef.current == null) return
		void cameraRef.current.focus(point)
	}, [])

	const gesture = Gesture.Tap().onEnd(({ x, y }) => {
		runOnJS(focus)({ x, y })
	})

	const handleExplore = useCallback(() => {
		router.push('/explore')
	}, [router])

	return (
		<>
			<StatusBar style="light" />
			<View style={styles.container}>
				<MaskedView
					style={styles.maskedView}
					maskElement={
						<View style={styles.maskContainer}>
							<View style={styles.mask} />
						</View>
					}
				>
					<GestureDetector gesture={gesture}>
						{device ? (
							<Camera
								torch={isTorchEnabled}
								ref={cameraRef}
								device={device}
								onInitialized={handleCameraInitialized}
								isActive={isCameraActive}
								outputOrientation="preview"
								photoQualityBalance="balanced"
								photoHdr
								photo
								enableZoomGesture
								style={styles.camera}
							/>
						) : (
							<View style={styles.permissionContainer}>
								{hasPermission ? (
									<Text style={{ color: 'white' }}>Cargando...</Text>
								) : (
									<Pressable
										onPress={requestPermission}
										style={{ padding: 20 }}
									>
										<Text style={{ color: 'white' }}>
											Permitir acceso a la cámara
										</Text>
									</Pressable>
								)}
							</View>
						)}
					</GestureDetector>
				</MaskedView>

				{base64Image ? (
					<View style={styles.loadingContainer}>
						<Image
							style={styles.mask}
							source={{ uri: `data:image/jpeg;base64,${base64Image}` }}
						/>
					</View>
				) : null}

				<SafeAreaView
					style={styles.topActionsContainer}
					edges={['top', 'left', 'right']}
				>
					<View style={styles.topActionsContent}>
						<Pressable onPress={handleToggleTorch} style={{ padding: 20 }}>
							<Ionicons size={30} color="white" name="flashlight" />
						</Pressable>
						<View aria-hidden />
						<Link href="/settings" viewProps={{ style: { padding: 20 } }}>
							<Ionicons size={30} color="white" name="settings" />
						</Link>
					</View>
				</SafeAreaView>

				<SafeAreaView
					style={styles.bottomActionsContainer}
					edges={['bottom', 'left', 'right']}
				>
					<View style={styles.bottomActionsContent}>
						<Pressable
							onPress={handlePickImage}
							style={(state) => ({
								opacity: isLoading || state.pressed ? 0.5 : 1,
								padding: 20,
							})}
						>
							<Ionicons size={35} color="white" name="images-outline" />
						</Pressable>
						<Pressable
							disabled={isLoading || !isCameraInitialized}
							onPress={handleCapture}
							style={(state) => ({
								borderColor: 'white',
								borderRadius: 999,
								borderWidth: 3,
								height: 70,
								opacity:
									!isCameraInitialized || isLoading || state.pressed ? 0.5 : 1,
								padding: 3,
								width: 70,
							})}
						>
							<View style={styles.shutterInnerCircle} />
						</Pressable>
						<Pressable style={{ padding: 20 }} onPress={handleExplore}>
							<Ionicons size={35} color="white" name="compass-outline" />
						</Pressable>
					</View>
				</SafeAreaView>
			</View>
		</>
	)
}

HomeScreen.options = {
	headerShown: false,
	headerTintColor: 'white',
	title: 'Home',
} as NativeStackNavigationOptions

export default HomeScreen
