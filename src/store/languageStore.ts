import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../commonutils/constants';
import i18n from '../i18n';
import type { AppLanguage } from '../i18n/resources';
import { persistStorage } from './persistStorage';

interface LanguageState {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    set => ({
      language: 'en',
      setLanguage: language => {
        set({ language });
        i18n.changeLanguage(language);
      },
    }),
    {
      name: STORAGE_KEYS.language,
      version: 1,
      storage: persistStorage,
      onRehydrateStorage: () => state => {
        if (state) i18n.changeLanguage(state.language);
      },
    },
  ),
);
