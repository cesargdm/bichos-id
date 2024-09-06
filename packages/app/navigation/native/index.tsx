import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from 'app/screens/home'
import UserDetailScreen from 'app/screens/user'

const Stack = createNativeStackNavigator<{
  home: undefined
  user: {
    id: string
  }
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Stack.Screen
        name="user"
        component={UserDetailScreen}
        options={{ title: 'User' }}
      />
    </Stack.Navigator>
  )
}
