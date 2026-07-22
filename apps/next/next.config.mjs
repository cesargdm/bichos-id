import { withExpo } from '@expo/next-adapter'
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
	headers: async () => [
		{
			headers: [
				{
					key: 'Content-Type',
					value: 'application/json',
				},
			],
			source: '/.well-known/apple-app-site-association',
		},
	],
	images: {
		remotePatterns: [{ hostname: 'bichos-id.assets.fucesa.com' }],
	},
	// reanimated (and thus, Moti) doesn't work with strict mode currently...
	// https://github.com/nandorojo/moti/issues/224
	// https://github.com/necolas/react-native-web/pull/2330
	// https://github.com/nandorojo/moti/issues/224
	// once that gets fixed, set this back to true
	reactStrictMode: false,
	// @expo/next-adapter only configures webpack; Turbopack (the Next 16
	// default bundler) needs the react-native-web alias and .web.* platform
	// extensions configured explicitly.
	turbopack: {
		resolveAlias: {
			'@react-native-firebase/app/dist/module/internal/web/firebaseAuth':
				'./lib/rnfb-firebase-auth-web-shim.js',
			'@react-native-firebase/app/dist/module/internal/web/firebaseAuth.js':
				'./lib/rnfb-firebase-auth-web-shim.js',
			'react-native': 'react-native-web',
		},
		resolveExtensions: [
			'.web.tsx',
			'.web.ts',
			'.web.jsx',
			'.web.js',
			'.tsx',
			'.ts',
			'.jsx',
			'.js',
			'.mjs',
			'.json',
		],
	},
	transpilePackages: [
		'react-native',
		'react-native-web',
		'expo',

		'moti',
		'solito',

		'expo-modules-core',
		'expo-linear-gradient',
		'expo-status-bar',
		'expo-image-picker',
		'expo-image-manipulator',
		'expo-linking',
		'expo-constants',
		'expo-asset',
		'expo-font',
		'@expo/html-elements',
		'@expo/vector-icons',

		'react-native-reanimated',
		'react-native-gesture-handler',
		'react-native-safe-area-context',
		'react-native-vision-camera',
		'@react-native-masked-view/masked-view',
		'@react-native-async-storage/async-storage',

		'@/app',
	],
}

/** @type {import('@sentry/nextjs').SentryBuildOptions} */
const sentryConfig = {
	automaticVercelMonitors: true,
	disableLogger: true,
	hideSourceMaps: true,
	org: 'fucesa',
	project: 'bichos-id-web',
	reactComponentAnnotation: {
		enabled: true,
	},
	tunnelRoute: '/monitoring',
	widenClientFileUpload: true,
}

export default withSentryConfig(withExpo(nextConfig), sentryConfig)
