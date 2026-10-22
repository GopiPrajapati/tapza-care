import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';

export interface LoadingProps {
  /** Shown under the spinner and read by screen readers. */
  label?: string;
}

/** Generic spinner for actions. Lists and pages use shape-matched skeletons instead. */
function Loading({ label = 'Loading' }: LoadingProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View
      style={styles.center}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <ActivityIndicator color={colors.primaryText} size="large" />
      <AppText color="textSecondary">{label}</AppText>
    </View>
  );
}

const createStyles = ({ spacing }: Theme) => ({
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.md,
    padding: spacing.xl,
  },
});

export default Loading;
