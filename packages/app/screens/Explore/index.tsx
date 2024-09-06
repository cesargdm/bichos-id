'use client'

import { createParam } from 'solito'
import { TextLink } from 'solito/link'
import { View } from 'react-native'

type Props = {
  fallbackData?: any[]
}

export default function DiscoverScreen({ fallbackData }: Props) {
  return (
    <View>
      <TextLink href={`/explore/${234234}`}>{23424}</TextLink>
      <TextLink href="/">Go Home</TextLink>
    </View>
  )
}
