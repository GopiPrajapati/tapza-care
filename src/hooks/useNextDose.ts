import { useMemo } from 'react';

import { DOSE_TIMES } from '../commonutils/constants';
import { clinicDate, daysBetween } from '../commonutils/helpers';
import type {
  DoseTiming,
  Medicine,
  Prescription,
} from '../networking/types/models';
import { doseKey, useDoseLogStore, type DoseRef } from '../store/doseLogStore';
import { usePrescriptions } from './usePrescriptions';

export interface NextDose extends DoseRef {
  medicine: Medicine;
  /** Minutes from midnight when the dose is due. */
  dueAtMinutes: number;
}

const TIMINGS: DoseTiming[] = ['morning', 'afternoon', 'night'];

/** True while the course is running on `today` (issued date counts as day 1). */
export function isCourseActive(
  prescription: Prescription,
  medicine: Medicine,
  today: string,
) {
  const dayIndex = daysBetween(prescription.issuedAt.slice(0, 10), today);
  return dayIndex >= 0 && dayIndex < medicine.days;
}

/**
 * The earliest dose today that is not marked taken (overdue ones first, since they are earliest).
 * Pure, so it can be tested without React.
 */
export function findNextDose(
  prescriptions: Prescription[],
  taken: Record<string, string>,
  nowMs: number,
): NextDose | null {
  const today = clinicDate(nowMs);
  let next: NextDose | null = null;

  for (const prescription of prescriptions) {
    for (const medicine of prescription.medicines) {
      if (!isCourseActive(prescription, medicine, today)) {
        continue;
      }
      for (const timing of TIMINGS) {
        if (!medicine.timing.includes(timing)) {
          continue;
        }
        const dose: DoseRef = {
          date: today,
          prescriptionId: prescription.id,
          medicineId: medicine.id,
          timing,
        };
        const dueAtMinutes = DOSE_TIMES[timing];
        if (
          doseKey(dose) in taken ||
          (next && next.dueAtMinutes <= dueAtMinutes)
        ) {
          continue;
        }
        next = { ...dose, medicine, dueAtMinutes };
      }
    }
  }
  return next;
}

/** Next pending dose for the Home floating bar, or null when everything for today is taken. */
export function useNextDose(): NextDose | null {
  const { data } = usePrescriptions();
  const taken = useDoseLogStore(state => state.taken);
  return useMemo(
    () => (data ? findNextDose(data, taken, Date.now()) : null),
    [data, taken],
  );
}
