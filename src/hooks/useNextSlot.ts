import { clinicDate } from '../commonutils/helpers';
import type { Slot } from '../networking/types/models';
import { useSlots } from './useSlots';

const firstAvailable = (slots: Slot[] | undefined) =>
  slots?.find(slot => slot.available);

/**
 * A doctor's earliest free slot today, or tomorrow if today is full. Tomorrow is only fetched when needed.
 */
export function useNextSlot(doctorId: string) {
  const now = Date.now();
  const today = useSlots(doctorId, clinicDate(now));
  const todaySlot = firstAvailable(today.data);
  const needTomorrow = today.isSuccess && !todaySlot;
  const tomorrow = useSlots(
    doctorId,
    needTomorrow ? clinicDate(now, 1) : undefined,
  );

  return {
    slot: todaySlot ?? firstAvailable(tomorrow.data),
    isLoading: today.isPending || (needTomorrow && tomorrow.isPending),
    isError: today.isError || tomorrow.isError,
  };
}
