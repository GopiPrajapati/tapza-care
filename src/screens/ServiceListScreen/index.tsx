import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Full list of clinic services goes here. */
function ServiceListScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Services</Text>
      <Text>Full list of clinic services goes here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default ServiceListScreen;
