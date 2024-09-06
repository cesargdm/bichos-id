import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from '@bichos-id/app/screens/home'
import DiscoverDetailScreen from '@bichos-id/app/screens/ExploreDetail'
import DiscoverScreen from '@bichos-id/app/screens/Explore'
import SettingsScreen from '@bichos-id/app/screens/Settings'

const Stack = createNativeStackNavigator<{
  home: undefined
  settings: undefined
  explore: undefined
  'explore-detail': {
    id: string
  }
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={HomeScreen.options}
      />
      <Stack.Screen
        name="settings"
        component={SettingsScreen}
        options={{ title: 'Explore' }}
      />
      <Stack.Screen
        name="explore"
        component={DiscoverScreen}
        options={{ title: 'Explore' }}
      />
      <Stack.Screen
        name="explore-detail"
        component={DiscoverDetailScreen}
        options={{ title: 'Explore Detail' }}
      />
    </Stack.Navigator>
  )
}
