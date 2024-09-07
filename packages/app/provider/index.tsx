import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { NavigationProvider } from './navigation'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <GestureHandlerRootView>{children}</GestureHandlerRootView>
    </NavigationProvider>
  )
}
