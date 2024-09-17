import { routingInstrumentation } from '@bichos-id/app/lib/sentry'
import { DarkTheme, NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useCallback, useMemo, useRef } from 'react'

type Props = {
	children: React.ReactNode
}

export function NavigationProvider({ children }: Props) {
	const navigation = useRef()

	const handleOnReady = useCallback(() => {
		routingInstrumentation.registerNavigationContainer(navigation)
	}, [])

	return (
		<NavigationContainer
			onReady={handleOnReady}
			theme={DarkTheme}
			linking={useMemo(
				() => ({
					prefixes: [Linking.createURL('/'), 'https://bichos-id.fucesa.com'],
					config: {
						initialRouteName: 'home',
						screens: {
							home: '',
							settings: 'settings',
							explore: 'explore',
							'explore-detail': 'explore/:id',
						},
					},
				}),
				[],
			)}
		>
			{children}
		</NavigationContainer>
	)
}
