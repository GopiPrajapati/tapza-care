import React from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../commonutils/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const RELEASE_SPRING = { damping: 15, stiffness: 320 };

export interface PressableScaleProps
  extends Omit<PressableProps, 'style' | 'accessibilityLabel'> {
  style?: StyleProp<ViewStyle>;
  /** Required: every touchable must be announced by screen readers. */
  accessibilityLabel: string;
  /** Scale while pressed. */
  scaleTo?: number;
}

/**
 * Pressable that shrinks slightly while pressed. Runs on the UI thread; skipped when the OS asks for reduced motion.
 */
function PressableScale({
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  disabled,
  accessibilityRole = 'button',
  accessibilityState,
  ...rest
}: PressableScaleProps) {
  const { motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!reduceMotion) {
      scale.value = withTiming(scaleTo, { duration: motion.pressIn });
    }
    onPressIn?.(event);
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    scale.value = withSpring(1, RELEASE_SPRING);
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        ...accessibilityState,
        disabled: Boolean(disabled),
      }}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    />
  );
}

export default PressableScale;
