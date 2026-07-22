// Drop-in replacement for
// @react-native-firebase/app/dist/module/internal/web/firebaseAuth.js.
// firebase 12 removed `getReactNativePersistence` from the browser bundle;
// react-native-firebase falls back to identity persistence at runtime
// (`getReactNativePersistence ?? (storage => storage)`), but Turbopack fails
// the build on the statically-missing export. Re-exporting the same modules
// plus the runtime fallback keeps the web build green without patching RNFB.
export * from 'firebase/app'
export * from 'firebase/auth'

export function getReactNativePersistence(storage) {
	return storage
}
