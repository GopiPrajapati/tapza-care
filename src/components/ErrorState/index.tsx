import React from 'react';
import { View } from 'react-native';
import { RotateCw } from 'lucide-react-native';

import { useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import Button from '../Button';
import Illustration from '../EmptyState/Illustration';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Shows a spinner on the Retry button while refetching. */
  retrying?: boolean;
}

function ErrorState({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  onRetry,
  retrying,
}: ErrorStateProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.center} accessibilityRole="alert">
      <Illustration name="error" />
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText color="textSecondary" align="center">
        {message}
      </AppText>
      {onRetry ? (
        <Button
          label="Try again"
          icon={RotateCw}
          onPress={onRetry}
          loading={retrying}
          style={styles.action}
        />
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

export default ErrorState;
