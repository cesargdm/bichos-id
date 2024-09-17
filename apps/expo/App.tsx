import type { FirebaseAuthTypes } from '@react-native-firebase/auth'

import analytics from '@react-native-firebase/analytics'
import auth from '@react-native-firebase/auth'
import { preventAutoHideAsync, hideAsync } from 'expo-splash-screen'
import {
	requestTrackingPermissionsAsync,
	PermissionStatus,
} from 'expo-tracking-transparency'
import { useEffect, useState } from 'react'

import Sentry from '@bichos-id/app/lib/sentry'
import { NativeNavigation } from '@bichos-id/app/navigation/native'
import { Provider } from '@bichos-id/app/provider'

void preventAutoHideAsync()

const initialState = { user: null } as const

function App() {
	const [state, setState] = useState<{
		user: FirebaseAuthTypes.UserCredential['user'] | null
	}>(initialState)

	useEffect(() => {
		async function signIn() {
			try {
				const credential = await auth().signInAnonymously()

				setState({ user: credential.user })
			} catch (error) {
				Sentry?.captureException(error)
			} finally {
				void hideAsync()
			}
		}

		void signIn()
	}, [])

	useEffect(() => {
		if (!state.user) return

		async function requestTrackingPermission() {
			try {
				const { status } = await requestTrackingPermissionsAsync()

				if (status === PermissionStatus.GRANTED) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
					analytics().setAnalyticsCollectionEnabled(true)
					if (state.user?.uid) {
						Sentry.setUser({ id: state.user.uid })
					}
				}
			} catch {
				// ignore error
			}
		}

		void requestTrackingPermission()
	}, [state.user])

	return (
		<Provider state={state}>
			<NativeNavigation />
		</Provider>
	)
}

export default Sentry.wrap(App)
