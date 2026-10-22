import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

/** Scroll state shared by Home's animated pieces. All values live on the UI thread. */
export interface HomeScroll {
  /** Vertical scroll offset of the home list (negative while overscrolling on iOS). */
  scrollY: SharedValue<number>;
  /** How far the ETA row collapses before the search bar pins (measured). */
  collapseDistance: SharedValue<number>;
  /** True when the OS asks for reduced motion: decorative motion is skipped. */
  reduceMotion: boolean;
}

export const HomeScrollContext = createContext<HomeScroll | null>(null);

export function useHomeScroll(): HomeScroll {
  const value = useContext(HomeScrollContext);
  if (!value) {
    throw new Error('useHomeScroll must be used inside HomeScrollContext');
  }
  return value;
}
