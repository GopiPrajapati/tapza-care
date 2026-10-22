import React, { useMemo, useState } from 'react';
import { StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { buildTheme, ThemeProvider } from '../commonutils/theme';
import { ToastProvider } from '../components/Toast';
import { useConfig } from '../hooks/useConfig';
import { useStoresHydrated } from '../store/hydration';
import { useAppearanceStore } from '../store/appearanceStore';
import { createQueryClient } from './queryClient';

export interface AppProvidersProps {
  children: React.ReactNode;
}

/** Builds the theme from the current config, so switching config re-themes the whole app. */
function ConfigThemeProvider({ children }: AppProvidersProps) {
  const { config } = useConfig();
  const colorScheme = useColorScheme();
  const preference = useAppearanceStore(state => state.preference);
  const useDark =
    preference === 'dark' ||
    (preference === 'system' && colorScheme === 'dark');
  const theme = useMemo(
    () => buildTheme(config.theme, useDark),
    [config.theme, useDark],
  );

  return (
    <ThemeProvider theme={theme}>
      {/* Android draws edge-to-edge, so only the icon style is set. */}
      <StatusBar barStyle={theme.statusBarStyle} animated />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

/**
 * App-wide providers. BottomSheetModalProvider lives inside the NavigationContainer (RootNavigator) so sheet
 * content can use navigation.
 * Nothing renders until persisted stores load, so the first request uses the saved config variant.
 */
function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);
  const hydrated = useStoresHydrated();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {hydrated ? (
            <ConfigThemeProvider>{children}</ConfigThemeProvider>
          ) : (
            <View style={styles.root} />
          )}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default AppProviders;
