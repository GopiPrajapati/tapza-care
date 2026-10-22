import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type TabScreenProps } from '../../container/Routes';

/** Placeholder: config-driven home with sections goes here. */
function HomeScreen({ navigation }: TabScreenProps<typeof Routes.Home>) {
  return (
    <ScreenContainer edges={['top', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">Home</Text>
      <Text>Config-driven home with sections goes here.</Text>
      {/* TEMP(Phase 3): route test buttons, removed when the screen is designed. */}
      <Button label="Doctor list" onPress={() => navigation.navigate(Routes.DoctorList)} />
      <Button
        label="Consult chip → Doctor list (General Physician)"
        onPress={() => navigation.navigate(Routes.DoctorList, { specialty: 'General Physician' })}
      />
      <Button label="Service list" onPress={() => navigation.navigate(Routes.ServiceList)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default HomeScreen;
