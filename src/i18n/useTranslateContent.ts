import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Hook for config-provided copy: known default content is translated, custom text stays verbatim. */
export function useTranslateContent() {
  const { t } = useTranslation();
  return useCallback((value: string) => t(value, { defaultValue: value }), [t]);
}
