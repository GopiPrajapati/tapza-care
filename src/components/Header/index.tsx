import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../Button';

export interface HeaderProps {
  title: string;
  /** Shows a back button when provided. */
  onBackPress?: () => void;
}

function Header({ title, onBackPress }: HeaderProps) {
  return (
    <View style={styles.row}>
      {onBackPress ? (
        <Button label="Back" accessibilityLabel="Go back" onPress={onBackPress} />
      ) : null}
      <Text accessibilityRole="header">{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});

export default Header;
