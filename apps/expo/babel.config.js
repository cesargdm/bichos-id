module.exports = function (api) {
	api.cache(true)

	return {
		presets: [
			['babel-preset-expo', '@babel/preset-flow', { jsxRuntime: 'automatic' }],
		],
		plugins: [
			'react-native-reanimated/plugin',
			['@babel/plugin-transform-private-methods', { loose: true }],
		],
	}
}
