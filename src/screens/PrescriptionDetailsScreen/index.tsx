import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Morning, afternoon and night schedule goes here. */
function PrescriptionDetailsScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Prescription</Text>
      <Text>Morning, afternoon and night schedule goes here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default PrescriptionDetailsScreen;
