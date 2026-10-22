import { apiClient } from '../api/client';
import { Endpoints } from '../api/endpoints';
import { ApiError } from '../api/errors';
import { parseConfig, type ParseConfigResult } from '../types/configSchema';

export type ValidConfigResult = Extract<ParseConfigResult, { ok: true }>;

/**
 * Fetches and validates the layout config. Rejects with ApiError on network failure, or ApiError 422 when the
 * config is unusable (invalid envelope). Unknown/invalid sections are already dropped in the result.
 */
export async function fetchConfig(): Promise<ValidConfigResult> {
  const raw = await apiClient.get<unknown>(Endpoints.config());
  const result = parseConfig(raw);
  if (!result.ok) {
    throw new ApiError(422, `Invalid config: ${result.error}`);
  }
  return result;
}
