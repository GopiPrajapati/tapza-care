/**
 * Global Jest mocks for native modules that do not exist in the Node test environment.
 */
import 'react-native-gesture-handler/jestSetup';

require('react-native-reanimated').setUpTests();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('lottie-react-native', () => 'LottieView');

jest.mock('react-native-haptic-feedback', () => ({
  __esModule: true,
  default: { trigger: jest.fn() },
  trigger: jest.fn(),
}));
