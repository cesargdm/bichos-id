import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from 'app/screens/home'
import DiscoverDetailScreen from 'app/screens/DiscoverDetail'
import DiscoverScreen from 'app/screens/Discover'

const Stack = createNativeStackNavigator<{
  home: undefined
  discover: undefined
  'discover-detail': {
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
        name="discover"
        component={DiscoverScreen}
        options={{ title: 'Discover' }}
      />
      <Stack.Screen
        name="discover-detail"
        component={DiscoverDetailScreen}
        options={{ title: 'Discover Detail' }}
      />
    </Stack.Navigator>
  )
}
