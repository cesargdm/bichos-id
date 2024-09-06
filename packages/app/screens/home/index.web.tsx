import { View, Text } from 'react-native'
import { Link } from 'solito/link'

export default function HomeScreen() {
  return (
    <View>
      <Text>Web home</Text>
      <Link href="/discover">Go to Discover</Link>
    </View>
  )
}
