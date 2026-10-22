import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '../networking/api/errors';

const MAX_RETRIES = 2;

/** Retry network/server errors (5xx) a couple of times; client errors (4xx) will not fix themselves. */
const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < MAX_RETRIES && !(isApiError(error) && error.status < 500);

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: 60_000,
      },
      mutations: {
        // A booking must never be submitted twice by an automatic retry.
        retry: false,
      },
    },
  });
