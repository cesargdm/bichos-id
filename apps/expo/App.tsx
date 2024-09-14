import { NativeNavigation } from '@bichos-id/app/navigation/native'
import { Provider } from '@bichos-id/app/provider'
import auth from '@react-native-firebase/auth'
import { useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import crashlytics from '@react-native-firebase/crashlytics'

SplashScreen.preventAutoHideAsync()

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function signIn() {
      try {
        const res = await auth().signInAnonymously()

        console.log({ res })
      } catch (error) {
        crashlytics().recordError(error)
        console.error(error)
        //
      } finally {
        SplashScreen.hideAsync()
      }
    }

    signIn()
  }, [])

  return (
    <Provider state={{ user }}>
      <NativeNavigation />
    </Provider>
  )
}
