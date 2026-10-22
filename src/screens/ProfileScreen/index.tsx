import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Patient details, family and settings go here. */
function ProfileScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Profile</Text>
      <Text>Patient details, family and settings go here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default ProfileScreen;
