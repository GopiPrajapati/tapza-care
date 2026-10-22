import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { MIN_TAP_TARGET } from '../../commonutils/dimensions';

export interface InputProps extends TextInputProps {
  /** Visible label; also used as the accessibility label. */
  label?: string;
}

function Input({ label, accessibilityLabel, ...rest }: InputProps) {
  return (
    <View>
      {label ? <Text>{label}</Text> : null}
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: MIN_TAP_TARGET },
});

export default Input;
