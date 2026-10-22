import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type TabScreenProps } from '../../container/Routes';

/** Placeholder: patient details, family and settings go here. */
function ProfileScreen({ navigation }: TabScreenProps<typeof Routes.Profile>) {
  return (
    <ScreenContainer edges={['top', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">Profile</Text>
      <Text>Patient details, family and settings go here.</Text>
      {/* TEMP(Phase 3): route test button. */}
      <Button label="Admin settings" onPress={() => navigation.navigate(Routes.AdminSettings)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default ProfileScreen;
