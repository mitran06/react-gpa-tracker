const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Firebase compatibility fixes for Expo SDK 53
config.resolver.alias = {
  ...config.resolver.alias,
  // Fix Firebase auth compatibility issues
  '@firebase/auth-compat': require.resolve('@firebase/auth-compat'),
  '@firebase/database-compat': require.resolve('@firebase/database-compat'),
  '@firebase/firestore-compat': require.resolve('@firebase/firestore-compat'),
  '@firebase/functions-compat': require.resolve('@firebase/functions-compat'),
  '@firebase/messaging-compat': require.resolve('@firebase/messaging-compat'),
  '@firebase/storage-compat': require.resolve('@firebase/storage-compat'),
  '@firebase/remote-config-compat': require.resolve('@firebase/remote-config-compat'),
  '@firebase/performance-compat': require.resolve('@firebase/performance-compat'),
};

// Additional resolver settings for Firebase
config.resolver.unstable_enablePackageExports = false;

// Transform settings to handle Firebase modules
config.transformer = {
  ...config.transformer,
  // Enable support for newer JavaScript features
  unstable_allowRequireContext: true,
  minifierConfig: {
    // Disable mangling to prevent Firebase issues
    mangle: false,
  },
};

module.exports = config;
