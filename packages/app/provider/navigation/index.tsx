import type {
	LinkingOptions,
	NavigationContainerRef,
} from '@react-navigation/native'

import { DarkTheme, NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useCallback, useMemo, useRef } from 'react'

import { routingInstrumentation } from '@/app/lib/sentry'

type ParamList = {
	explore: undefined
	'explore-detail': { id: string }
	home: undefined
	settings: undefined
}

type Props = {
	children: React.ReactNode
}

export function NavigationProvider({ children }: Props) {
	const navigation = useRef<NavigationContainerRef<ParamList> | null>(null)

	const handleOnReady = useCallback(() => {
		routingInstrumentation.registerNavigationContainer(navigation)
	}, [])

	return (
		<NavigationContainer
			ref={navigation}
			onReady={handleOnReady}
			theme={DarkTheme}
			linking={useMemo(
				(): LinkingOptions<ParamList> => ({
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
