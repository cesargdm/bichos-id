import { createNativeStackNavigator } from '@react-navigation/native-stack'

import ExploreScreen from '@/app/screens/Explore'
import ExploreDetailScreen from '@/app/screens/ExploreDetail'
import HomeScreen from '@/app/screens/Home'
import SettingsScreen from '@/app/screens/Settings'

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
