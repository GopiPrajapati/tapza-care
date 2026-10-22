import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useConfigStore } from '../src/store/configStore';
import {
  resetMockServer,
  setMockControls,
} from '../src/networking/mockData/mockServer';
import { useConfig } from '../src/hooks/useConfig';
import { useDoctors } from '../src/hooks/useDoctors';
import { useSlots } from '../src/hooks/useSlots';
import { useMyBookings } from '../src/hooks/useBookings';
import { usePrescriptions } from '../src/hooks/usePrescriptions';
import { clinicDate } from '../src/commonutils/helpers';

const today = clinicDate(Date.now());

function useListStates() {
  return {
    config: useConfig(),
    doctors: useDoctors(),
    slots: useSlots('doc-1', today),
    bookings: useMyBookings(),
    prescriptions: usePrescriptions(),
  };
}

describe('mock controls across screen data lists', () => {
  let client: QueryClient;

  beforeEach(() => {
    resetMockServer();
    setMockControls({ latencyMs: 0, failure: 'none', configVariant: 'normal' });
    useConfigStore.getState().setVariant('normal');
    useConfigStore.getState().setCustomConfigJson(null);
    useConfigStore.getState().clearLastGoodConfig();
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  afterEach(() => client.clear());

  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  it('keeps list queries pending during 3-second latency, then loads data', async () => {
    setMockControls({ latencyMs: 3000 });
    const { result, unmount } = await renderHook(useListStates, { wrapper });

    expect(result.current.doctors.isPending).toBe(true);
    expect(result.current.slots.isPending).toBe(true);
    expect(result.current.bookings.isPending).toBe(true);
    expect(result.current.prescriptions.isPending).toBe(true);
    await waitFor(
      () => expect(result.current.prescriptions.isSuccess).toBe(true),
      { timeout: 5000 },
    );
    expect(result.current.config.isLoading).toBe(false);
    unmount();
  }, 7000);

  it('uses the bundled layout on config failure while list requests still work', async () => {
    setMockControls({ failure: 'config' });
    const { result, unmount } = await renderHook(useListStates, { wrapper });

    await waitFor(() => {
      expect(result.current.config.isStale).toBe(true);
      expect(result.current.doctors.isSuccess).toBe(true);
      expect(result.current.prescriptions.isSuccess).toBe(true);
    });
    expect(result.current.config.source).toBe('bundled');
    expect(result.current.doctors.isSuccess).toBe(true);
    expect(result.current.prescriptions.isSuccess).toBe(true);
    unmount();
  });

  it('surfaces list errors when all requests fail, while config has its fallback', async () => {
    setMockControls({ failure: 'all' });
    const { result, unmount } = await renderHook(useListStates, { wrapper });

    await waitFor(() => {
      expect(result.current.doctors.isError).toBe(true);
      expect(result.current.slots.isError).toBe(true);
      expect(result.current.bookings.isError).toBe(true);
      expect(result.current.prescriptions.isError).toBe(true);
    });
    expect(result.current.config.isStale).toBe(true);
    unmount();
  });

  it('returns empty data for all mock list endpoints', async () => {
    setMockControls({ failure: 'empty' });
    const { result, unmount } = await renderHook(useListStates, { wrapper });

    await waitFor(() => {
      expect(result.current.doctors.isSuccess).toBe(true);
      expect(result.current.slots.isSuccess).toBe(true);
      expect(result.current.bookings.isSuccess).toBe(true);
      expect(result.current.prescriptions.isSuccess).toBe(true);
    });
    expect(result.current.doctors.data).toEqual([]);
    expect(result.current.slots.data).toEqual([]);
    expect(result.current.bookings.data).toEqual([]);
    expect(result.current.prescriptions.data).toEqual([]);
    unmount();
  });
});
