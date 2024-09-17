/* eslint-disable no-undef */
module.exports = function (api) {
	api.cache(true)

	return {
		plugins: [
			'react-native-reanimated/plugin',
			['@babel/plugin-transform-private-methods', { loose: true }],
		],
		presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
	}
}
