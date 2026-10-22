import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../commonutils/constants';
import { persistStorage } from './persistStorage';

export type AppearancePreference = 'system' | 'light' | 'dark';

interface AppearanceState {
  preference: AppearancePreference;
  setPreference: (preference: AppearancePreference) => void;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    set => ({
      preference: 'system',
      setPreference: preference => set({ preference }),
    }),
    {
      name: STORAGE_KEYS.appearance,
      version: 1,
      storage: persistStorage,
    },
  ),
);
