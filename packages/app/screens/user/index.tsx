import { createParam } from 'solito'
import { TextLink } from 'solito/link'

const { useParam } = createParam<{ id: string }>()

export default function UserDetailScreen() {
  const [id] = useParam('id')

  return <TextLink href="/">👈 Go Home</TextLink>
}
