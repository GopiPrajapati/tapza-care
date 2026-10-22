/** Error thrown by the API client for any non-2xx response. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Checks by shape instead of `instanceof`, which is unreliable for transpiled subclasses of Error.
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    error.name === 'ApiError' &&
    typeof (error as Partial<ApiError>).status === 'number'
  );
}

/** 409: the slot was taken between showing it and confirming it. */
export const isSlotTakenError = (error: unknown): boolean =>
  isApiError(error) && error.status === 409;
