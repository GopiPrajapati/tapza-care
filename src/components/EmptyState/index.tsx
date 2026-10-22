import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../Button';

export interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.center}>
      <Text accessibilityRole="header">{title}</Text>
      {message ? <Text>{message}</Text> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default EmptyState;
