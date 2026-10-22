import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../commonutils/constants';
import type { DoseTiming } from '../networking/types/models';
import { persistStorage } from './persistStorage';

export interface DoseRef {
  /** Clinic-local YYYY-MM-DD. */
  date: string;
  prescriptionId: string;
  medicineId: string;
  timing: DoseTiming;
}

export const doseKey = ({ date, prescriptionId, medicineId, timing }: DoseRef): string =>
  `${date}|${prescriptionId}|${medicineId}|${timing}`;

interface DoseLogState {
  /** doseKey → ISO time it was marked taken. */
  taken: Record<string, string>;
  markTaken: (dose: DoseRef) => void;
  /** Undo a "taken" mark. */
  unmark: (dose: DoseRef) => void;
  toggle: (dose: DoseRef) => void;
  reset: () => void;
}

export const useDoseLogStore = create<DoseLogState>()(
  persist(
    (set, get) => ({
      taken: {},
      markTaken: dose =>
        set(state => ({ taken: { ...state.taken, [doseKey(dose)]: new Date().toISOString() } })),
      unmark: dose =>
        set(state => {
          const taken = { ...state.taken };
          delete taken[doseKey(dose)];
          return { taken };
        }),
      toggle: dose =>
        doseKey(dose) in get().taken ? get().unmark(dose) : get().markTaken(dose),
      reset: () => set({ taken: {} }),
    }),
    { name: STORAGE_KEYS.doseLog, version: 1, storage: persistStorage },
  ),
);

/** Subscribes to one dose so only that row re-renders when it changes. */
export const useIsDoseTaken = (dose: DoseRef): boolean =>
  useDoseLogStore(state => doseKey(dose) in state.taken);
