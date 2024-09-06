import { NativeNavigation } from '@bichos-id/app/navigation/native'
import { Provider } from '@bichos-id/app/provider'

export default function App() {
  return (
    <Provider>
      <NativeNavigation />
    </Provider>
  )
}
