import type { FirebaseAuthTypes } from '@react-native-firebase/auth'

import auth from '@react-native-firebase/auth'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'

import Sentry from '@bichos-id/app/lib/sentry'
import { NativeNavigation } from '@bichos-id/app/navigation/native'
import { Provider } from '@bichos-id/app/provider'

void SplashScreen.preventAutoHideAsync()

function App() {
	const [user, setUser] = useState<
		FirebaseAuthTypes.UserCredential['user'] | null
	>(null)

	useEffect(() => {
		async function signIn() {
			try {
				const credential = await auth().signInAnonymously()

				Sentry.setUser({ id: credential.user.uid })
				setUser(credential.user)
			} catch (error) {
				Sentry.captureException(error)
			} finally {
				void SplashScreen.hideAsync()
			}
		}

		void signIn()
	}, [])

	return (
		<Provider state={{ user }}>
			<NativeNavigation />
		</Provider>
	)
}

export default Sentry.wrap(App)
