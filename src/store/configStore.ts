import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../commonutils/constants';
import { setMockControls, type ConfigVariant } from '../networking/mockData/mockServer';
import type { ValidatedConfig } from '../networking/types/configSchema';
import { persistStorage } from './persistStorage';

interface ConfigState {
  /** Which config the (mock) server should serve. */
  variant: ConfigVariant;
  /** Raw JSON from the admin config editor, served when variant is "custom". */
  customConfigJson: string | null;
  /** Last config that fetched and validated successfully; the fallback when GET /config fails. */
  lastGoodConfig: ValidatedConfig | null;
  setVariant: (variant: ConfigVariant) => void;
  setCustomConfigJson: (json: string | null) => void;
  saveLastGoodConfig: (config: ValidatedConfig) => void;
  clearLastGoodConfig: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    set => ({
      variant: 'normal',
      customConfigJson: null,
      lastGoodConfig: null,
      setVariant: variant => set({ variant }),
      setCustomConfigJson: customConfigJson => set({ customConfigJson }),
      saveLastGoodConfig: lastGoodConfig => set({ lastGoodConfig }),
      clearLastGoodConfig: () => set({ lastGoodConfig: null }),
    }),
    { name: STORAGE_KEYS.config, version: 1, storage: persistStorage },
  ),
);

const parseJson = (json: string | null): unknown => {
  if (json === null) {
    return null;
  }
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Keeps the mock server serving the selected config (runs on hydration and every change). */
const syncToMockServer = ({ variant, customConfigJson }: ConfigState) =>
  setMockControls({ configVariant: variant, customConfig: parseJson(customConfigJson) });

syncToMockServer(useConfigStore.getState());
useConfigStore.subscribe(syncToMockServer);
