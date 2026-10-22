import React from 'react';
import { StyleSheet, Text } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { Routes, type RootStackScreenProps } from '../../container/Routes';
import { useTranslation } from 'react-i18next';

/** Placeholder: full list of clinic services goes here. */
function ServiceListScreen({
  // Retain the typed stack props while this optional screen is still a placeholder.
  ..._props
}: RootStackScreenProps<typeof Routes.ServiceList>) {
  const { t } = useTranslation();
  return (
    <ScreenContainer edges={['bottom', 'left', 'right']} style={styles.center}>
      <Text accessibilityRole="header">{t('serviceListTitle')}</Text>
      <Text>{t('serviceListPlaceholder')}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default ServiceListScreen;
