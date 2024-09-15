import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { NavigationProvider } from './navigation'

type AuthState = any

function AuthProvider({
	children,
}: {
	state: AuthState
	children: React.ReactNode
}) {
	return children
}

export function Provider({
	children,
	state,
}: {
	state: AuthState
	children: React.ReactNode
}) {
	return (
		<AuthProvider state={state}>
			<NavigationProvider>
				<GestureHandlerRootView>{children}</GestureHandlerRootView>
			</NavigationProvider>
		</AuthProvider>
	)
}
