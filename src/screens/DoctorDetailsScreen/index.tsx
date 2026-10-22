import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Doctor summary, date strip and slot sheet go here. */
function DoctorDetailsScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Doctor details</Text>
      <Text>Doctor summary, date strip and slot sheet go here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default DoctorDetailsScreen;
