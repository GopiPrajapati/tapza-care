import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type RootStackScreenProps } from '../../container/Routes';

/** Placeholder: doctor summary, date strip and slot sheet go here. */
function DoctorDetailsScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof Routes.DoctorDetails>) {
  const { doctorId, serviceId } = route.params;

  return (
    <ScreenContainer edges={['bottom', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">Doctor details</Text>
      <Text>Doctor summary, date strip and slot sheet go here.</Text>
      <Text>doctorId: {doctorId}</Text>
      <Text>serviceId: {serviceId ?? '—'}</Text>
      {/* TEMP(Phase 3): stands in for the confirm action. */}
      <Button
        label="Confirm booking"
        onPress={() => navigation.navigate(Routes.BookingSuccess, { bookingId: 'bk-temp-1' })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default DoctorDetailsScreen;
