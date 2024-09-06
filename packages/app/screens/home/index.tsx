import { View, Text } from 'react-native'
import { TextLink } from 'solito/link'

export default function HomeScreen() {
  return (
    <View>
      <Text>
        Here is a basic starter to show you how you can navigate from one screen
        to another. This screen uses the same code on Next.js and React Native.
      </Text>
      <TextLink href="/user/fernando">Regular Link</TextLink>
    </View>
  )
}
