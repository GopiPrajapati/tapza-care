import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../commonutils/constants';
import { fetchDoctors } from '../networking/repositories/doctorRepository';
import type { Doctor } from '../networking/types/models';

export const useDoctors = () =>
  useQuery({ queryKey: QUERY_KEYS.doctors, queryFn: fetchDoctors });

/**
 * One doctor, read from the shared doctors list (no extra request when the list is cached).
 * `isNotFound` is true when the list loaded but has no such doctor.
 */
export function useDoctor(doctorId: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.doctors,
    queryFn: fetchDoctors,
    select: (doctors: Doctor[]) => doctors.find(doctor => doctor.id === doctorId) ?? null,
  });
  return { ...query, doctor: query.data ?? undefined, isNotFound: query.data === null };
}
