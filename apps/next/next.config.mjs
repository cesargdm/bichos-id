import { withExpo } from '@expo/next-adapter'
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [{ hostname: 'bichos-id.assets.fucesa.com' }],
	},
	// reanimated (and thus, Moti) doesn't work with strict mode currently...
	// https://github.com/nandorojo/moti/issues/224
	// https://github.com/necolas/react-native-web/pull/2330
	// https://github.com/nandorojo/moti/issues/224
	// once that gets fixed, set this back to true
	reactStrictMode: false,
	transpilePackages: [
		'react-native',
		'react-native-web',
		'expo',

		'moti',
		'solito',

		'expo-modules-core',
		'expo-linear-gradient',
		'@expo/html-elements',

		'react-native-mmkv',

		'react-native-reanimated',
		'react-native-gesture-handler',

		'@bichos-id/app',
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
