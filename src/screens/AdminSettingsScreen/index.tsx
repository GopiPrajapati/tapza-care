import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';

/** Placeholder: Config switch and mock network controls go here. */
function AdminSettingsScreen() {
  return (
    <ScreenContainer style={styles.center}>
      <Text accessibilityRole="header">Admin settings</Text>
      <Text>Config switch and mock network controls go here.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default AdminSettingsScreen;
