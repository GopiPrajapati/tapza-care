import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Button from '../../components/Button';
import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type TabScreenProps } from '../../container/Routes';
import { useConfig } from '../../hooks/useConfig';
import { useConfigStore } from '../../store/configStore';

/** Placeholder: patient details, family and settings go here. */
function ProfileScreen({ navigation }: TabScreenProps<typeof Routes.Profile>) {
  const variant = useConfigStore(state => state.variant);
  const setVariant = useConfigStore(state => state.setVariant);
  const { source, isStale, isRefetching } = useConfig();

  return (
    <ScreenContainer edges={['top', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">Profile</Text>
      <Text>Patient details, family and settings go here.</Text>
      {/* TEMP(Phase 3): route test button. */}
      <Button label="Admin settings" onPress={() => navigation.navigate(Routes.AdminSettings)} />
      {/* TEMP(Phase 5): proves runtime re-theming; replaced by AdminSettings controls. */}
      <Text>
        Config: {variant} · source: {source}
        {isStale ? ' · stale' : ''}
        {isRefetching ? ' · loading…' : ''}
      </Text>
      <Button
        label={variant === 'diwali' ? 'Switch to Normal' : 'Switch to Diwali'}
        onPress={() => setVariant(variant === 'diwali' ? 'normal' : 'diwali')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default ProfileScreen;
