import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type TabScreenProps } from '../../container/Routes';

/** Placeholder: prescription list and today's doses go here. */
function PrescriptionsScreen({ navigation }: TabScreenProps<typeof Routes.Prescriptions>) {
  return (
    <ScreenContainer edges={['top', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">Prescriptions</Text>
      <Text>Prescription list and today's doses go here.</Text>
      {/* TEMP(Phase 3): route test button. */}
      <Button
        label="Open prescription rx-1"
        onPress={() => navigation.navigate(Routes.PrescriptionDetails, { prescriptionId: 'rx-1' })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default PrescriptionsScreen;
