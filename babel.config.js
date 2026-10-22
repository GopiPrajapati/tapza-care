module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // zod 4 ships `export * as ns from` syntax, which the React Native preset does not compile.
    '@babel/plugin-transform-export-namespace-from',
    // Reanimated 4 worklets plugin. Must stay the last plugin.
    'react-native-worklets/plugin',
  ],
};
