import { useQueries, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../commonutils/constants';
import { fetchSlots } from '../networking/repositories/slotRepository';

/** Slots for one doctor on one clinic-local date (YYYY-MM-DD). Disabled until both are known. */
export const useSlots = (
  doctorId: string | undefined,
  date: string | undefined,
) =>
  useQuery({
    queryKey: QUERY_KEYS.slots(doctorId ?? '', date ?? ''),
    queryFn: () => fetchSlots(doctorId!, date!),
    enabled: Boolean(doctorId && date),
    // Availability changes quickly; always refetch when the sheet opens again.
    staleTime: 0,
  });

/** Availability across the visible booking window, used to offer the next day with a free slot. */
export const useSlotsForDates = (
  doctorId: string | undefined,
  dates: string[],
) =>
  useQueries({
    queries: dates.map(date => ({
      queryKey: QUERY_KEYS.slots(doctorId ?? '', date),
      queryFn: () => fetchSlots(doctorId!, date),
      enabled: Boolean(doctorId),
      staleTime: 0,
    })),
  });
