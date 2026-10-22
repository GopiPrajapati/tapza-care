import React from 'react';
import { View } from 'react-native';

import { useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import Button from '../Button';
import Illustration, { type IllustrationName } from './Illustration';

export interface EmptyStateProps {
  title: string;
  message?: string;
  illustration?: IllustrationName;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({
  title,
  message,
  illustration = 'generic',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.center}>
      <Illustration name={illustration} />
      <AppText variant="heading" align="center" accessibilityRole="header">
        {title}
      </AppText>
      {message ? (
        <AppText color="textSecondary" align="center">
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
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
  action: { marginTop: spacing.sm },
});

export default EmptyState;
