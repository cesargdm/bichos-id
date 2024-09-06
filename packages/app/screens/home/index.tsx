'use client'

import { CameraView, useCameraPermissions } from 'expo-camera'
import { useCallback, useRef, useState } from 'react'
import {
  Alert,
  ActivityIndicator,
  View,
  Text,
  Button,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'solito/navigation'
import Ionicons from '@expo/vector-icons/Ionicons'
import { StatusBar } from 'expo-status-bar'
import * as ImagePicker from 'expo-image-picker'
import { Link } from 'solito/link'

import { Api } from '@bichos-id/app/lib/api'

function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [isLoading, setIsLoading] = useState(false)
  const [isTorchEnabled, setIsTorchEnabled] = useState(false)
  const router = useRouter()
  const cameraRef = useRef<CameraView>(null)

  const handleCapture = useCallback(async () => {
    setIsLoading(true)

    try {
      const image = await cameraRef.current?.takePictureAsync({
        base64: true,
        quality: 0.3,
        imageType: 'jpg',
      })

      if (!image || !image.base64) {
        throw new Error('No image taken')
      }

      const data = await Api.identify(`data:image/jpeg;base64,${image.base64}`)

      router.push(`/explore/${data.id}`)
    } catch (error) {
      console.log(error)
      console.dir(error)
      console.log(JSON.stringify(error, null, 2))
      //
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleToggleTorch = useCallback(() => {
    setIsTorchEnabled((prev) => !prev)
  }, [])

  const handlePickImage = useCallback(async () => {
    try {
      setIsLoading(true)

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

      router.push(`/explore/${data.id}`)
    } catch (error) {
      console.log(error)
      console.dir(error)
      //
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleExplore = useCallback(() => {
    router.push('/explore')
  }, [router])

  if (!permission) {
    // Camera permissions are still loading.
    return <View />
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'black',
        }}
      >
        <Text style={{ color: 'white' }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </SafeAreaView>
    )
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <CameraView
          enableTorch={isTorchEnabled}
          ref={cameraRef}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <SafeAreaView
            style={{ flex: 1, justifyContent: 'space-between' }}
            edges={['top', 'bottom', 'left', 'right']}
          >
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Pressable onPress={handleToggleTorch} style={{ padding: 16 }}>
                <Ionicons size={24} color="white" name="flashlight" />
              </Pressable>
              <Link href="/settings" style={{ padding: 16 }}>
                <Ionicons size={24} color="white" name="settings" />
              </Link>
            </View>

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
                  }}
                >
                  {isLoading ? <ActivityIndicator size="large" /> : null}
                </View>
              </Pressable>
              <Pressable style={{ padding: 16 }} onPress={handleExplore}>
                <Ionicons size={32} color="white" name="compass-outline" />
              </Pressable>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    </>
  )
}

HomeScreen.options = { title: 'Home', headerShown: false }

export default HomeScreen
