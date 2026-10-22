import { handleRequest, type HttpMethod } from '../mockData/mockServer';

/**
 * The single place requests leave the app. Today it calls the in-app mock server.
 *
 * To use a real backend, replace the body of `request` with fetch, e.g.:
 *
 *   const res = await fetch(`${BASE_URL}${path}`, {
 *     method,
 *     headers: { 'Content-Type': 'application/json' },
 *     body: body === undefined ? undefined : JSON.stringify(body),
 *   });
 *   if (!res.ok) throw new ApiError(res.status, await res.text());
 *   return (await res.json()) as T;
 *
 * Repositories, hooks and screens do not change.
 */
async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const response = await handleRequest(method, path, body);
  // Responses are trusted for typed models; the config is validated separately with zod.
  return response.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
};
