import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { CloudOff } from 'lucide-react-native';

import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import PressableScale from '../PressableScale';

export interface StaleConfigBannerProps {
  onRetry: () => void;
  retrying?: boolean;
  /** "saved" when showing the cached layout, "default" when showing the bundled one. */
  source?: 'saved' | 'default';
}

/** Tells the user the home layout may be out of date because the latest config could not load. */
function StaleConfigBanner({
  onRetry,
  retrying,
  source = 'saved',
}: StaleConfigBannerProps) {
  const { colors, sizes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const message =
    source === 'saved' ? 'Showing saved layout' : 'Showing default layout';

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <CloudOff size={sizes.iconMd} color={colors.warning} />
      <AppText variant="label" color="textPrimary" style={styles.message}>
        {message}
      </AppText>
      <PressableScale
        accessibilityLabel="Retry loading the latest layout"
        accessibilityState={{ busy: retrying }}
        disabled={retrying}
        onPress={onRetry}
        style={styles.retry}
      >
        {retrying ? (
          <ActivityIndicator color={colors.warning} />
        ) : (
          <AppText variant="label" color="warning">
            Retry
          </AppText>
        )}
      </PressableScale>
    </View>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  banner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    marginHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.warningSurface,
  },
  message: { flex: 1 },
  retry: {
    minHeight: sizes.minTouch,
    minWidth: sizes.minTouch,
    paddingHorizontal: spacing.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

export default StaleConfigBanner;
