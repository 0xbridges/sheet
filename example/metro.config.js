// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Peer deps live in both example/node_modules and root/node_modules.
// When the library source (../src/) imports them, Metro's hierarchical lookup
// finds the root copy first, creating duplicate module instances that crash at
// runtime. Redirect those imports to the example's single copy.
const peerDeps = [
  'react',
  'react/jsx-runtime',
  'react-native',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-safe-area-context',
];

const libSrc = path.resolve(monorepoRoot, 'src');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@0xbridges/sheet') {
    return {
      filePath: path.resolve(libSrc, 'index.ts'),
      type: 'sourceFile',
    };
  }

  if (
    context.originModulePath.startsWith(libSrc + path.sep) &&
    peerDeps.some((dep) => moduleName === dep || moduleName.startsWith(dep + '/'))
  ) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, 'stub.js') },
      moduleName,
      platform,
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
