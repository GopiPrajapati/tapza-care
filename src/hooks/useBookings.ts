import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '../commonutils/constants';
import { isSlotTakenError } from '../networking/api/errors';
import { createBooking, fetchBookings } from '../networking/repositories/bookingRepository';
import type { Booking, Slot } from '../networking/types/models';

export const useMyBookings = () =>
  useQuery({ queryKey: QUERY_KEYS.bookings, queryFn: fetchBookings });

export interface CreateBookingVariables {
  doctorId: string;
  /** The slot as shown to the user; needed to build the optimistic booking and update its day's slots. */
  slot: Slot;
}

interface OptimisticContext {
  optimisticId: string;
  previousBookings: Booking[] | undefined;
  previousSlots: Slot[] | undefined;
  slotsKey: readonly string[];
}

/** Clinic-local date of a slot ("2026-10-22T09:30:00+05:30" → "2026-10-22"). */
const slotDate = (slot: Slot) => slot.startsAt.slice(0, 10);

/**
 * Optimistic booking:
 * 1. onMutate: a "pending" booking appears in My bookings at once and the slot shows as taken.
 * 2. onSuccess: the pending booking is replaced by the server's confirmed booking.
 * 3. onError: the booking is removed. On 409 the slot stays taken (someone else has it); on other errors the
 *    slot is restored. `isSlotTaken` tells the UI which case it was.
 * 4. onSettled: slots and bookings are refetched so the cache matches the server.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Booking, Error, CreateBookingVariables, OptimisticContext>({
    mutationFn: ({ doctorId, slot }) => createBooking({ doctorId, slotId: slot.id }),

    onMutate: async ({ doctorId, slot }) => {
      const slotsKey = QUERY_KEYS.slots(doctorId, slotDate(slot));
      await Promise.all([
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.bookings }),
        queryClient.cancelQueries({ queryKey: slotsKey }),
      ]);

      const previousBookings = queryClient.getQueryData<Booking[]>(QUERY_KEYS.bookings);
      const previousSlots = queryClient.getQueryData<Slot[]>(slotsKey);
      const optimisticId = `pending-${slot.id}`;

      const optimistic: Booking = {
        id: optimisticId,
        doctorId,
        slotId: slot.id,
        startsAt: slot.startsAt,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Booking[]>(QUERY_KEYS.bookings, (old = []) => [
        ...old.filter(booking => booking.id !== optimisticId),
        optimistic,
      ]);
      queryClient.setQueryData<Slot[]>(slotsKey, old =>
        old?.map(item => (item.id === slot.id ? { ...item, available: false } : item)),
      );

      return { optimisticId, previousBookings, previousSlots, slotsKey };
    },

    onSuccess: (booking, _variables, context) => {
      queryClient.setQueryData<Booking[]>(QUERY_KEYS.bookings, (old = []) =>
        old.map(item => (item.id === context.optimisticId ? booking : item)),
      );
    },

    onError: (error, _variables, context) => {
      if (!context) {
        return;
      }
      queryClient.setQueryData(QUERY_KEYS.bookings, context.previousBookings);
      if (!isSlotTakenError(error)) {
        queryClient.setQueryData(context.slotsKey, context.previousSlots);
      }
    },

    onSettled: (_data, _error, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.slotsForDoctor(doctorId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings });
    },
  });

  return { ...mutation, isSlotTaken: isSlotTakenError(mutation.error) };
}
