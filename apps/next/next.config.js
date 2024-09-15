/* eslint-disable @typescript-eslint/no-require-imports */
const { withExpo } = require('@expo/next-adapter')
// const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
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

		'react-native-reanimated',
		'react-native-gesture-handler',

		'@bichos-id/app',
	],
}

module.exports = withExpo(nextConfig)

// module.exports = withExpo(
// 	withSentryConfig(nextConfig, {
// 		org: 'fucesa',
// 		project: 'bichos-id-web',
// 		silent: !process.env.CI,
// 		widenClientFileUpload: true,
// 		reactComponentAnnotation: {
// 			enabled: true,
// 		},
// 		tunnelRoute: '/monitoring',
// 		hideSourceMaps: true,
// 		disableLogger: true,
// 		automaticVercelMonitors: true,
// 	}),
// )
