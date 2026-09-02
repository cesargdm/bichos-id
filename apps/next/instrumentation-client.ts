// React Native modules (react-native-reanimated, via moti) reference the
// global `__DEV__` that Metro injects at bundle time. Next.js's bundler
// doesn't define it, so any RN-web chunk that reads `__DEV__` at module
// evaluation time throws `ReferenceError: __DEV__ is not defined` and takes
// the whole page down with it (e.g. /explore, which renders Skeleton from
// moti/skeleton). Polyfill it before any other client code runs.
const globalScope = globalThis as Record<string, unknown>

if (typeof globalScope.__DEV__ === 'undefined') {
	globalScope.__DEV__ = process.env.NODE_ENV !== 'production'
}
