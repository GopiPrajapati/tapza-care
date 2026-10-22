module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Reanimated 4 + Worklets resolve web/JS implementations under Jest.
  resolver: 'react-native-reanimated/jest/resolver',
  // lucide's "react-native" export is .mjs, which Jest cannot run; use its CommonJS build.
  moduleNameMapper: {
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  // These packages ship untranspiled ESM/TS/Flow, so Babel must transform them.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-navigation|@gorhom|react-native-.*|lottie-react-native|lucide-react-native)/)',
  ],
};
