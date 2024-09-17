import { createNativeStackNavigator } from '@react-navigation/native-stack'

import ExploreScreen from '@bichos-id/app/screens/Explore'
import ExploreDetailScreen from '@bichos-id/app/screens/ExploreDetail'
import HomeScreen from '@bichos-id/app/screens/Home'
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
				options={SettingsScreen.options}
			/>
			<Stack.Screen
				name="explore"
				component={ExploreScreen}
				options={ExploreScreen.options}
			/>
			<Stack.Screen
				name="explore-detail"
				component={ExploreDetailScreen}
				options={ExploreDetailScreen.options}
			/>
		</Stack.Navigator>
	)
}
