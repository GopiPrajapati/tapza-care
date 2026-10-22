import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Doctor search and specialty filters go here. */
function DoctorListScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Doctors</Text>
      <Text>Doctor search and specialty filters go here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default DoctorListScreen;
