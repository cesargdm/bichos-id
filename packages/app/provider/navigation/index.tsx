import { DarkTheme, NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useCallback, useMemo, useRef } from 'react'

import { routingInstrumentation } from '@bichos-id/app/lib/sentry'

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
					config: {
						initialRouteName: 'home',
						screens: {
							explore: 'explore',
							'explore-detail': 'explore/:id',
							home: '',
							settings: 'settings',
						},
					},
					prefixes: [Linking.createURL('/'), 'https://bichos-id.fucesa.com'],
				}),
				[],
			)}
		>
			{children}
		</NavigationContainer>
	)
}
