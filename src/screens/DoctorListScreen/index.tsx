import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type RootStackScreenProps } from '../../container/Routes';

/** Placeholder: doctor search and specialty filters go here. */
function DoctorListScreen({ navigation, route }: RootStackScreenProps<typeof Routes.DoctorList>) {
  return (
    <ScreenContainer edges={['bottom', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">Doctors</Text>
      <Text>Doctor search and specialty filters go here.</Text>
      <Text>specialty: {route.params?.specialty ?? '—'}</Text>
      {/* TEMP(Phase 3): route test button. */}
      <Button
        label="Open doctor doc-1"
        onPress={() => navigation.navigate(Routes.DoctorDetails, { doctorId: 'doc-1' })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default DoctorListScreen;
