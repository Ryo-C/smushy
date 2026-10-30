// metro.config.js
// Required for NativeWind v4 to process CSS at runtime
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16, // Use 16px base (matches STYLING.md and mobile best practices)
});
