import { Dimensions } from 'react-native';

/** Minimum touch target (pt), per the accessibility requirement. */
export const MIN_TAP_TARGET = 44;

export const getScreenWidth = (): number => Dimensions.get('window').width;
export const getScreenHeight = (): number => Dimensions.get('window').height;
