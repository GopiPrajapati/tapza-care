import { NativeModules, Platform } from 'react-native';

type AppIconManagerNative = {
  setVariant: (variant: 'normal' | 'diwali' | 'custom') => Promise<void>;
};

const appIconManager = NativeModules.AppIconManager as
  | AppIconManagerNative
  | undefined;

/** Keep the home-screen icon aligned with the persisted mock config variant. */
export async function syncAppIcon(
  variant: 'normal' | 'diwali' | 'custom',
): Promise<void> {
  if (!appIconManager) return;
  try {
    await appIconManager.setVariant(variant);
  } catch (error) {
    // Some launchers restrict dynamic icon changes; the app theme remains usable.
    if (__DEV__) {
      console.warn(`[${Platform.OS}] Unable to update launcher icon`, error);
    }
  }
}
