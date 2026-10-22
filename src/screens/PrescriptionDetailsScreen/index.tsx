import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type RootStackScreenProps } from '../../container/Routes';

/** Placeholder: morning, afternoon and night schedule goes here. */
function PrescriptionDetailsScreen({
  route,
}: RootStackScreenProps<typeof Routes.PrescriptionDetails>) {
  return (
    <ScreenContainer edges={['bottom', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">Prescription</Text>
      <Text>Morning, afternoon and night schedule goes here.</Text>
      <Text>prescriptionId: {route.params.prescriptionId}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default PrescriptionDetailsScreen;
