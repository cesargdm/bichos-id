import { DarkTheme, NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useMemo } from 'react'

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationContainer
      theme={DarkTheme}
      linking={useMemo(
        () => ({
          prefixes: [Linking.createURL('/')],
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
