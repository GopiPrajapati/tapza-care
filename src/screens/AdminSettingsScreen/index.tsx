import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import ComponentGallery from './components/ComponentGallery';

/** Placeholder: config switch and mock network controls go here. Dev builds show the component gallery. */
function AdminSettingsScreen() {
  return (
    <ScreenContainer
      edges={['bottom', 'left', 'right']}
      style={__DEV__ ? undefined : styles.center}
    >
      {__DEV__ ? (
        <ComponentGallery />
      ) : (
        <>
          <Text accessibilityRole="header">Admin settings</Text>
          <Text>Config switch and mock network controls go here.</Text>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default AdminSettingsScreen;
