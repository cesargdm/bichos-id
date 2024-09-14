/**
 * @type {import('expo/metro-config')}
 */
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

// Find the project and workspace directories
const projectRoot = __dirname
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, '../..')

const defaultConfig = getDefaultConfig(projectRoot)

// 1. Watch all files within the monorepo
defaultConfig.watchFolders = [monorepoRoot]
// 2. Let Metro know where to resolve packages and in what order
defaultConfig.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]
defaultConfig.resolver.sourceExts.push('cjs')

module.exports = defaultConfig
