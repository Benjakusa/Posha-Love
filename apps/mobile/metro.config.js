const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo (needed for @posha/shared, @posha/config source)
config.watchFolders = [monorepoRoot];

// Resolve from both app-local and monorepo-root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Allow Metro to walk up to find packages (fixes expo-image-picker + others in hoisted root)
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
