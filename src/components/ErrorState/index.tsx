import React from 'react';
import { View } from 'react-native';
import { RotateCw } from 'lucide-react-native';

import { useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../AppText';
import Button from '../Button';
import Illustration from '../EmptyState/Illustration';
import { useTranslation } from 'react-i18next';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Shows a spinner on the Retry button while refetching. */
  retrying?: boolean;
}

function ErrorState({ title, message, onRetry, retrying }: ErrorStateProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <View style={styles.center} accessibilityRole="alert">
      <Illustration name="error" />
      <AppText variant="heading" align="center">
        {title ?? t('errorTitle')}
      </AppText>
      <AppText color="textSecondary" align="center">
        {message ?? t('errorMessage')}
      </AppText>
      {onRetry ? (
        <Button
          label={t('retry')}
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
