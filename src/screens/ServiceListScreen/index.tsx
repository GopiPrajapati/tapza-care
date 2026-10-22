import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type RootStackScreenProps } from '../../container/Routes';

/** Placeholder: full list of clinic services goes here. */
function ServiceListScreen({ navigation }: RootStackScreenProps<typeof Routes.ServiceList>) {
  return (
    <ScreenContainer edges={['bottom', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">Services</Text>
      <Text>Full list of clinic services goes here.</Text>
      {/* TEMP(Phase 3): a service opens its doctor's booking with the serviceId. */}
      <Button
        label="Book service svc-1 (doctor doc-2)"
        onPress={() =>
          navigation.navigate(Routes.DoctorDetails, { doctorId: 'doc-2', serviceId: 'svc-1' })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default ServiceListScreen;
