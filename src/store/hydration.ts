import { useEffect, useState } from 'react';

import { useConfigStore } from './configStore';
import { useDoseLogStore } from './doseLogStore';
import { useMockControlsStore } from './mockControlsStore';
import { useLanguageStore } from './languageStore';
import { useAppearanceStore } from './appearanceStore';

const PERSISTED_STORES = [
  useConfigStore,
  useMockControlsStore,
  useDoseLogStore,
  useLanguageStore,
  useAppearanceStore,
];

const allHydrated = () =>
  PERSISTED_STORES.every(store => store.persist.hasHydrated());

/**
 * True once every persisted store has loaded from AsyncStorage. The app waits for this so the first request
 * already uses the saved config variant and mock controls (no flash of the wrong theme).
 */
export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(allHydrated);

  useEffect(() => {
    if (hydrated) {
      return;
    }
    const check = () => {
      if (allHydrated()) {
        setHydrated(true);
      }
    };
    const unsubscribes = PERSISTED_STORES.map(store =>
      store.persist.onFinishHydration(check),
    );
    check();
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [hydrated]);

  return hydrated;
}
