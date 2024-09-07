'use client'

import { useCallback, useRef, useState } from 'react'
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  Alert,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'solito/navigation'
import Ionicons from '@expo/vector-icons/Ionicons'
import { StatusBar } from 'expo-status-bar'
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { runOnJS } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Link } from 'solito/link'
import MaskedView from '@react-native-masked-view/masked-view'
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
  Point,
} from 'react-native-vision-camera'
import { useIsFocused } from '@react-navigation/native'

import { Api } from '@bichos-id/app/lib/api'

const CAPTURABLE_WIDTH_PERCENTAGE = 0.6
const CAPTURABLE_HEIGHT_PERCENTAGE = 0.4

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'space-between',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  maskContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mask: {
    width: `${CAPTURABLE_WIDTH_PERCENTAGE * 100}%`,
    height: `${CAPTURABLE_HEIGHT_PERCENTAGE * 100}%`,
    borderRadius: 16,
    backgroundColor: 'black',
  },
  maskedView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  topActionsContainer: {
    width: '100%',
    justifyContent: 'space-between',
  },
  topActionsContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomActionsContainer: {
    width: '100%',
    justifyContent: 'space-between',
  },
})

function HomeScreen() {
  const { hasPermission } = useCameraPermission()
  const [isLoading, setIsLoading] = useState(false)
  const device = useCameraDevice('back')

  const [isTorchEnabled, setIsTorchEnabled] = useState<'on' | 'off'>('off')
  const router = useRouter()
  const cameraRef = useRef<Camera>(null)

  const isFocused = useIsFocused()

  const isCameraActive = hasPermission && isFocused

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
            resize: {
              width: PHOTO_WIDTH,
              height: PHOTO_HEIGHT,
            },
          },
          {
            crop: {
              width: PHOTO_WIDTH * CAPTURABLE_WIDTH_PERCENTAGE,
              height: PHOTO_HEIGHT * CAPTURABLE_HEIGHT_PERCENTAGE,
              originX: PHOTO_WIDTH * ((1 - CAPTURABLE_WIDTH_PERCENTAGE) / 2),
              originY: PHOTO_HEIGHT * ((1 - CAPTURABLE_HEIGHT_PERCENTAGE) / 2),
            },
          },
        ],
        { compress: 0.666, format: SaveFormat.JPEG, base64: true },
      ).then((result) => result.base64)

      const data = await Api.identify(`data:image/jpeg;base64,${base64Image}`)

      if (!data.id) {
        throw new Error('No data returned')
      }

      router.push(`/explore/${data.id}`)
    } catch (error) {
      Alert.alert('Error', error?.message ?? 'No se pudo identificar la imagen')
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
        mediaTypes: MediaTypeOptions.Images,
        quality: 0.3,
        base64: true,
      })

      if (result.canceled) {
        throw new Error('Image selection canceled')
      }

      const image = result.assets[0]

      if (!image) {
        throw new Error('No image selected')
      }

      const data = await Api.identify(`data:image/jpeg;base64,${image.base64}`)

      if (!data.id) {
        throw new Error('No data returned')
      }

      router.push(`/explore/${data.id}`)
    } catch (error) {
      Alert.alert('Error', error?.message ?? 'No se pudo identificar la imagen')
      //
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const focus = useCallback((point: Point) => {
    if (cameraRef.current == null) return
    cameraRef.current.focus(point)
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
                isActive={isCameraActive}
                outputOrientation="preview"
                photoQualityBalance="balanced"
                photoHdr
                photo
                enableZoomGesture
                style={styles.camera}
              />
            ) : (
              <Text>Sin camara</Text>
            )}
          </GestureDetector>
        </MaskedView>

        <SafeAreaView
          style={styles.topActionsContainer}
          edges={['top', 'left', 'right']}
        >
          <View style={styles.topActionsContent}>
            <Pressable onPress={handleToggleTorch} style={{ padding: 16 }}>
              <Ionicons size={24} color="white" name="flashlight" />
            </Pressable>
            <Link href="/settings" style={{ padding: 16 }}>
              <Ionicons size={24} color="white" name="settings" />
            </Link>
          </View>
        </SafeAreaView>

        <SafeAreaView
          style={styles.bottomActionsContainer}
          edges={['bottom', 'left', 'right']}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Pressable onPress={handlePickImage} style={{ padding: 16 }}>
              <Ionicons size={32} color="white" name="images-outline" />
            </Pressable>
            <Pressable
              disabled={isLoading}
              onPress={handleCapture}
              style={{
                opacity: isLoading ? 0.5 : 1,
                borderWidth: 3,
                borderColor: 'white',
                width: 70,
                height: 70,
                borderRadius: 999,
                padding: 3,
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'white',
                  borderRadius: 999,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                }}
              >
                {isLoading ? <ActivityIndicator /> : null}
              </View>
            </Pressable>
            <Pressable style={{ padding: 16 }} onPress={handleExplore}>
              <Ionicons size={32} color="white" name="compass-outline" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </>
  )
}

HomeScreen.options = { title: 'Home', headerShown: false }

export default HomeScreen
