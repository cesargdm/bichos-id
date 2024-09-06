import { createParam } from 'solito'
import { TextLink } from 'solito/link'
import { View } from 'react-native'

const { useParam } = createParam<{ id: string }>()

export default function DiscoverScreen() {
  return (
    <View>
      <TextLink href={`/discover/${234234}`}>{23424}</TextLink>
      <TextLink href="/">Go Home</TextLink>
    </View>
  )
}
