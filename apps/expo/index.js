import { registerRootComponent } from 'expo'
import 'react-native-gesture-handler'

import '@/app/lib/sentry'

import App from './App'

registerRootComponent(App)
