'use client'

import { ScrollView, Text } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { StatusBar } from 'expo-status-bar'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'

function SettingsScreen() {
  return (
    <>
      <StatusBar style="light" />
      <ScrollView>
        <Text role="heading" aria-level="1">
          Settings
        </Text>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={{ width: '100%', height: 44 }}
          onPress={async () => {
            try {
              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              })

              console.warn(credential)
              // signed in
            } catch (e: any) {
              console.log(e)

              if (e.code === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
              } else {
                // handle other errors
              }
            }
          }}
        />
      </ScrollView>
    </>
  )
}

SettingsScreen.options = {
  title: 'Ajustes',
  headerTintColor: 'white',
  headerBackTitleVisible: false,
} as NativeStackNavigationOptions

export default SettingsScreen
