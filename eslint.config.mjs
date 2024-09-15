/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-check

import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'

export default [
	{
		plugins: {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			react,
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				// @ts-ignore
				tsconfigRootDir: import.meta.dirname,
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
	},
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	pluginJs.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		files: ['**/*.js'],
		...tseslint.configs.disableTypeChecked,
	},
]
