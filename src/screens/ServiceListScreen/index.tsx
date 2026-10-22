import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type RootStackScreenProps } from '../../container/Routes';

/** Placeholder: full list of clinic services goes here. */
function ServiceListScreen({
  // Retain the typed stack props while this optional screen is still a placeholder.
  ..._props
}: RootStackScreenProps<typeof Routes.ServiceList>) {
  return (
    <ScreenContainer edges={['bottom', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">Services</Text>
      <Text>Full list of clinic services goes here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default ServiceListScreen;
