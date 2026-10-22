import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export interface LoadingProps {
  /** Read by screen readers. */
  accessibilityLabel?: string;
}

/** Generic spinner. Lists use shape-matched skeletons instead. */
function Loading({ accessibilityLabel = 'Loading' }: LoadingProps) {
  return (
    <View style={styles.center} accessibilityLabel={accessibilityLabel}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default Loading;
