import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import bundledConfigJson from '../assets/config/defaultConfig.json';
import { QUERY_KEYS } from '../commonutils/constants';
import { fetchConfig } from '../networking/repositories/configRepository';
import { parseConfig, type ValidatedConfig } from '../networking/types/configSchema';
import { useConfigStore } from '../store/configStore';

/** Where the config on screen came from. */
export type ConfigSource = 'network' | 'cache' | 'bundled';

export interface UseConfigResult {
  /** Always present: the app is never without a layout. */
  config: ValidatedConfig;
  source: ConfigSource;
  /** True when showing a saved or bundled layout because the latest fetch failed. */
  isStale: boolean;
  /** True only on the very first load when nothing (not even a cached layout) can be shown yet. */
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

/** The layout shipped inside the app; used only when nothing has ever been fetched. */
const bundledConfig: ValidatedConfig = (() => {
  const result = parseConfig(bundledConfigJson);
  if (!result.ok) {
    throw new Error(`Bundled default config is invalid: ${result.error}`);
  }
  return result.config;
})();

/**
 * Remote config with fallbacks: fresh → last good (cached) → bundled default.
 * Successful fetches are saved as the last good config.
 */
export function useConfig(): UseConfigResult {
  const variant = useConfigStore(state => state.variant);
  const customConfigJson = useConfigStore(state => state.customConfigJson);
  const lastGoodConfig = useConfigStore(state => state.lastGoodConfig);

  const query = useQuery({
    queryKey: QUERY_KEYS.config(variant, variant === 'custom' ? customConfigJson : null),
    queryFn: async () => {
      const result = await fetchConfig();
      useConfigStore.getState().saveLastGoodConfig(result.config);
      return result.config;
    },
    // While switching variants, keep showing the current layout until the new one arrives.
    placeholderData: keepPreviousData,
  });

  // Re-validate the persisted copy: it may come from an older app version.
  const cachedConfig = useMemo(() => {
    if (!lastGoodConfig) {
      return null;
    }
    const result = parseConfig(lastGoodConfig);
    return result.ok ? result.config : null;
  }, [lastGoodConfig]);

  const { data, isError, isPending, isFetching, refetch } = query;

  return useMemo(() => {
    const base = {
      isRefetching: isFetching,
      refetch: () => {
        refetch();
      },
    };
    if (data) {
      return { ...base, config: data, source: 'network', isStale: false, isLoading: false };
    }
    const fallback: Pick<UseConfigResult, 'config' | 'source'> = cachedConfig
      ? { config: cachedConfig, source: 'cache' }
      : { config: bundledConfig, source: 'bundled' };
    return {
      ...base,
      ...fallback,
      isStale: isError,
      isLoading: isPending && !cachedConfig,
    };
  }, [data, isError, isPending, isFetching, refetch, cachedConfig]);
}
