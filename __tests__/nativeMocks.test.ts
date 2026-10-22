/**
 * Smoke test: every native library can be imported under Jest with the mocks in jest.setup.ts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trigger } from 'react-native-haptic-feedback';

describe('native module mocks', () => {
  it('loads every native library without crashing', () => {
    expect(require('react-native-reanimated')).toBeDefined();
    expect(require('react-native-gesture-handler')).toBeDefined();
    expect(require('react-native-safe-area-context')).toBeDefined();
    expect(require('react-native-screens')).toBeDefined();
    expect(require('react-native-svg')).toBeDefined();
    expect(require('react-native-linear-gradient')).toBeDefined();
    expect(require('lottie-react-native')).toBeDefined();
    expect(require('lucide-react-native')).toBeDefined();
    expect(require('@gorhom/bottom-sheet')).toBeDefined();
    expect(require('@react-navigation/native')).toBeDefined();
    expect(require('@react-navigation/native-stack')).toBeDefined();
    expect(require('@react-navigation/bottom-tabs')).toBeDefined();
  });

  it('round-trips a value through mocked AsyncStorage', async () => {
    await AsyncStorage.setItem('key', 'value');
    expect(await AsyncStorage.getItem('key')).toBe('value');
  });

  it('mocks haptics', () => {
    trigger('impactLight');
    expect(trigger).toHaveBeenCalledWith('impactLight');
  });
});
