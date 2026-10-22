import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { QUERY_KEYS } from '../src/commonutils/constants';
import {
  handleRequest,
  resetMockServer,
  setMockControls,
} from '../src/networking/mockData/mockServer';
import type { Slot } from '../src/networking/types/models';
import { useCreateBooking } from '../src/hooks/useBookings';

const NOW = Date.parse('2026-10-22T08:00:00+05:30');
const DOCTOR_ID = 'doc-1';
const DATE = '2026-10-22';

describe('booking mutation state', () => {
  let queryClient: QueryClient;
  let slot: Slot;
  let unmountHook: (() => Promise<void>) | undefined;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(async () => {
    resetMockServer({ now: () => NOW });
    setMockControls({ latencyMs: 0, failure: 'none' });
    const response = await handleRequest(
      'GET',
      `/slots?doctorId=${DOCTOR_ID}&date=${DATE}`,
    );
    slot = (response.data as Slot[]).find(candidate => candidate.available)!;
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
    queryClient.setQueryData(QUERY_KEYS.slots(DOCTOR_ID, DATE), [slot]);
  });

  afterEach(async () => {
    await unmountHook?.();
    unmountHook = undefined;
    queryClient.clear();
  });

  it('inserts an optimistic pending booking and reconciles it to confirmed', async () => {
    setMockControls({ latencyMs: 800 });
    const { result, unmount } = await renderHook(() => useCreateBooking(), {
      wrapper,
    });
    unmountHook = unmount;
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => {
      result.current.mutateOnce({ doctorId: DOCTOR_ID, slot });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(QUERY_KEYS.bookings)).toEqual([
        expect.objectContaining({
          id: `pending-${slot.id}`,
          slotId: slot.id,
          status: 'pending',
        }),
      ]);
    });
    expect(
      queryClient.getQueryData<Slot[]>(QUERY_KEYS.slots(DOCTOR_ID, DATE))?.[0]
        .available,
    ).toBe(false);

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 5000,
    });
    expect(queryClient.getQueryData(QUERY_KEYS.bookings)).toEqual([
      expect.objectContaining({
        slotId: slot.id,
        status: 'confirmed',
        id: 'bk-1',
      }),
    ]);
  });

  it('rolls back a forced 409 and keeps the conflicting slot unavailable', async () => {
    setMockControls({ failure: 'booking409', latencyMs: 3000 });
    const { result, unmount } = await renderHook(() => useCreateBooking(), {
      wrapper,
    });
    unmountHook = unmount;
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => {
      result.current.mutateOnce({ doctorId: DOCTOR_ID, slot });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(QUERY_KEYS.bookings)).toEqual([
        expect.objectContaining({
          id: `pending-${slot.id}`,
          status: 'pending',
        }),
      ]);
    });
    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });
    expect(queryClient.getQueryData(QUERY_KEYS.bookings)).toEqual([]);
    expect(
      queryClient.getQueryData<Slot[]>(QUERY_KEYS.slots(DOCTOR_ID, DATE)),
    ).toEqual([{ ...slot, available: false }]);
    expect(result.current.isSlotTaken).toBe(true);
  });
});
