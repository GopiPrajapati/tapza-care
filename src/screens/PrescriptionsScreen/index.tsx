import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Prescription list and today's doses go here. */
function PrescriptionsScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Prescriptions</Text>
      <Text>Prescription list and today's doses go here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default PrescriptionsScreen;
