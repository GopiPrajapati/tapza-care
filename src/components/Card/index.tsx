import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import {
  SurfaceTone,
  useThemedStyles,
  type Theme,
} from '../../commonutils/theme';
import PressableScale from '../PressableScale';

interface CardBaseProps {
  children: React.ReactNode;
  /** Removes the inner padding (e.g. for full-bleed images). */
  flush?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A pressable card must have an accessibility label. */
export type CardProps = CardBaseProps &
  (
    | { onPress?: undefined; accessibilityLabel?: string }
    | { onPress: () => void; accessibilityLabel: string }
  );

/** Rounded surface with a soft shadow, as on Zepto's product and offer cards. */
function Card({
  children,
  onPress,
  accessibilityLabel,
  flush,
  elevated = true,
  style,
}: CardProps) {
  const styles = useThemedStyles(createStyles);
  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    !flush && styles.padded,
    style,
  ];

  if (onPress) {
    return (
      <PressableScale
        accessibilityLabel={accessibilityLabel ?? ''}
        onPress={onPress}
        scaleTo={0.98}
        style={cardStyle}
      >
        <SurfaceTone>{children}</SurfaceTone>
      </PressableScale>
    );
  }
  return (
    <View style={cardStyle}>
      <SurfaceTone>{children}</SurfaceTone>
    </View>
  );
}

const createStyles = ({ colors, radii, spacing, elevation, sizes }: Theme) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
  },
  elevated: elevation.card,
  padded: { padding: spacing.lg },
});

export default Card;
