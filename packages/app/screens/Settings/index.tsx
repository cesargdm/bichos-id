'use client'

import { ScrollView, Text } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'

function SettingsScreen() {
	return (
		<>
			<StatusBar style="light" />
			<ScrollView style={{ flex: 1 }}>
				<Text style={{ color: 'white' }} role="heading" aria-level="1">
					Settings
				</Text>
			</ScrollView>
		</>
	)
}

SettingsScreen.options = {
	headerTintColor: 'white',
	headerBackTitleVisible: false,
	presentation: 'modal',
} as NativeStackNavigationOptions

export default SettingsScreen
