const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable CSS transpilation for web if needed
config.transformer.isCSSTranspilationEnabled = true;

// Ensure we handle ESM packages like Firebase correctly
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;
