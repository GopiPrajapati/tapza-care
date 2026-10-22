import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Config-driven home with sections goes here. */
function HomeScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Home</Text>
      <Text>Config-driven home with sections goes here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default HomeScreen;
