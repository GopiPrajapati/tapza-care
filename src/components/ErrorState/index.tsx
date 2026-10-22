import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../Button';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.center} accessibilityRole="alert">
      <Text>{message}</Text>
      {onRetry ? <Button label="Retry" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default ErrorState;
