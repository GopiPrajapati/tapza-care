import React from 'react';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '../../../commonutils/theme';
import { useHomeScroll } from './HomeScrollContext';

const ENTRY_OFFSET = 14;

export interface EntryAnimatedProps {
  id: string;
  /** Section ids that have entered the viewport at least once (written from onViewableItemsChanged). */
  seen: SharedValue<Record<string, true>>;
  children: React.ReactNode;
}

/**
 * Fades a section in and slides it up 14pt the first time it enters the viewport. Sections already seen render
 * fully visible straight away, so scrolling back or list recycling never replays the animation.
 */
function EntryAnimated({ id, seen, children }: EntryAnimatedProps) {
  const { motion } = useTheme();
  const { reduceMotion } = useHomeScroll();
  const progress = useSharedValue(reduceMotion || seen.value[id] ? 1 : 0);

  useAnimatedReaction(
    () => seen.value[id] === true,
    (isSeen, wasSeen) => {
      if (isSeen && !wasSeen && progress.value < 1) {
        progress.value = withTiming(1, { duration: motion.slow });
      }
    },
  );

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * ENTRY_OFFSET }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default EntryAnimated;
