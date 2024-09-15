import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { NavigationProvider } from './navigation'

type AuthState = unknown

function AuthProvider({
	children,
}: {
	state: AuthState
	children: React.ReactNode
}) {
	return children
}

type Props = {
	state: AuthState
	children: React.ReactNode
}

export function Provider({ children, state }: Props) {
	return (
		<AuthProvider state={state}>
			<NavigationProvider>
				<GestureHandlerRootView>{children}</GestureHandlerRootView>
			</NavigationProvider>
		</AuthProvider>
	)
}
