import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../commonutils/constants';
import { fetchPrescriptions } from '../networking/repositories/prescriptionRepository';
import type { Prescription } from '../networking/types/models';

export const usePrescriptions = () =>
  useQuery({ queryKey: QUERY_KEYS.prescriptions, queryFn: fetchPrescriptions });

/** One prescription from the shared list. `isNotFound` is true when the list loaded without it. */
export function usePrescription(prescriptionId: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.prescriptions,
    queryFn: fetchPrescriptions,
    select: (list: Prescription[]) => list.find(item => item.id === prescriptionId) ?? null,
  });
  return {
    ...query,
    prescription: query.data ?? undefined,
    isNotFound: query.data === null,
  };
}
