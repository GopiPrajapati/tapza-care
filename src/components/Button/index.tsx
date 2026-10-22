import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { MIN_TAP_TARGET } from '../../commonutils/dimensions';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Defaults to the label. */
  accessibilityLabel?: string;
}

function Button({ label, onPress, disabled = false, accessibilityLabel }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.button}>
      <Text>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TAP_TARGET,
    minWidth: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
