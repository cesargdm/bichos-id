/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const path = require('path')

// Find the project and workspace directories
const projectRoot = __dirname

const monorepoRoot = path.resolve(projectRoot, '../..')

const defaultConfig = getSentryExpoConfig(projectRoot)

// 1. Watch all files within the monorepo
defaultConfig.watchFolders = [monorepoRoot]
// 2. Let Metro know where to resolve packages and in what order
defaultConfig.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, 'node_modules'),
	path.resolve(monorepoRoot, 'node_modules'),
]
defaultConfig.resolver.sourceExts.push('cjs')

module.exports = defaultConfig
