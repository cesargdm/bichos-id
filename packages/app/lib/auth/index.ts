import auth from '@react-native-firebase/auth'
export function getIdToken() {
  return auth().currentUser?.getIdToken()
}
