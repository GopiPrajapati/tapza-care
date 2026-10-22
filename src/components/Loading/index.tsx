import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import { useTranslation } from 'react-i18next';

export interface LoadingProps {
  /** Shown under the spinner and read by screen readers. */
  label?: string;
}

/** Generic spinner for actions. Lists and pages use shape-matched skeletons instead. */
function Loading({ label }: LoadingProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const loadingLabel = label ?? t('loading');
  return (
    <View
      style={styles.center}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={loadingLabel}
    >
      <ActivityIndicator color={colors.primaryText} size="large" />
      <AppText color="textSecondary">{loadingLabel}</AppText>
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
