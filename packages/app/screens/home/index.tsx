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
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'solito/navigation'
import * as Clipboard from 'expo-clipboard'

function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const cameraRef = useRef<CameraView>(null)

  const handleCapture = useCallback(async () => {
    setIsLoading(true)

    try {
      const base64Image = await cameraRef.current?.takePictureAsync({
        base64: true,
        quality: 0.3,
        imageType: 'jpg',
      })

      if (!base64Image) {
        throw new Error('No image taken')
      }

      console.log('Sending image....')

      const response = await fetch(
        `https://bichos-id.fucesa.com/api/v1/ai/vision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64Image: `data:image/jpeg;base64,${base64Image.base64}`,
          }),
        },
      ).then((response) => response.json())

      Alert.alert(
        'Animal Identification',
        `Common name:${response.identification.commonName}\nGenus: ${response.identification.scientificClassification.genus}\nSpecies: ${response.identification.scientificClassification.species}\n\nVenomous: ${response.identification.venomous.level}`,
        [
          {
            text: 'Copy image',
            onPress: () => {
              Clipboard.setStringAsync(
                `data:image/jpeg;base64,${base64Image.base64}`,
              )
            },
          },
          {
            text: 'Done',
          },
        ],
      )
    } catch (error) {
      console.log(error)
      console.dir(error)
      console.log(JSON.stringify(error, null, 2))
      //
    } finally {
      setIsLoading(false)
    }
  }, [])

  function handleExplore() {
    router.push('/explore')
  }

  if (!permission) {
    // Camera permissions are still loading.
    return <View />
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* <StatusBar /> */}
      <CameraView
        ref={cameraRef}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <SafeAreaView
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}
          edges={['bottom', 'left', 'right']}
        >
          <View />
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
          <Pressable
            style={{ backgroundColor: 'red', minHeight: 40, minWidth: 40 }}
            onPress={handleExplore}
          >
            <Text>Explore</Text>
          </Pressable>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}

HomeScreen.options = { title: 'Home', headerShown: false }

export default HomeScreen
