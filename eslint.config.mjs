import pluginJs from '@eslint/js'
import perfectionist from 'eslint-plugin-perfectionist'
import react from 'eslint-plugin-react'
import tseslint from 'typescript-eslint'

export default [
	{
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			perfectionist,
			react,
		},
		rules: {
			'@typescript-eslint/consistent-type-imports': [
				'warn',
				{
					fixStyle: 'separate-type-imports',
					prefer: 'type-imports',
				},
			],
			'@typescript-eslint/no-misused-promises': [
				'warn',
				{ checksVoidReturn: false },
			],
			'@typescript-eslint/no-require-imports': 'off',
			'perfectionist/sort-imports': [
				'warn',
				{
					groups: [
						'type-import',
						['value-builtin', 'value-external'],
						'type-internal',
						'value-internal',
						['type-parent', 'type-sibling', 'type-index'],
						['value-parent', 'value-sibling', 'value-index'],
						'unknown',
					],
					internalPattern: ['^@/.*'],
					order: 'asc',
					type: 'alphabetical',
				},
			],
			'perfectionist/sort-objects': 'warn',
		},
	},
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	pluginJs.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		files: ['**/*.js'],
		...tseslint.configs.disableTypeChecked,
	},
	{
		ignores: ['**/.next', 'apps/expo/android/**', 'apps/expo/ios/**'],
	},
]
