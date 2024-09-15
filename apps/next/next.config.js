/* eslint-disable @typescript-eslint/no-require-imports */
const { withExpo } = require('@expo/next-adapter')
const { withSentryConfig } = require('@sentry/nextjs')
const withFonts = require('next-fonts')

/** @type {import('next').NextConfig} */
const nextConfig = {
	// reanimated (and thus, Moti) doesn't work with strict mode currently...
	// https://github.com/nandorojo/moti/issues/224
	// https://github.com/necolas/react-native-web/pull/2330
	// https://github.com/nandorojo/moti/issues/224
	// once that gets fixed, set this back to true
	reactStrictMode: false,
	swcMinify: true,
	transpilePackages: [
		'react-native',
		'moti',
		'expo-modules-core',
		'expo-linear-gradient',
		'react-native-vector-icons',
		'@react-native/assets-registry',
		'react-native-web',
		'solito',
		'app',
		'react-native-reanimated',
		'@expo/html-elements',
		'react-native-gesture-handler',
	],
	experimental: {
		forceSwcTransforms: true,
	},
	webpack: (config) => {
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			'react-native$': 'react-native-web',
			'react-native-linear-gradient': 'react-native-web-linear-gradient',
		}

		return config
	},
}

module.exports = withSentryConfig(
	withFonts(withExpo(nextConfig), {
		org: 'fucesa',
		project: 'bichos-id-web',
		silent: !process.env.CI,
		widenClientFileUpload: true,
		reactComponentAnnotation: {
			enabled: true,
		},
		tunnelRoute: '/monitoring',
		hideSourceMaps: true,
		disableLogger: true,
		automaticVercelMonitors: true,
	}),
)
