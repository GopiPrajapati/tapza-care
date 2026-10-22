import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../commonutils/constants';
import {
  setMockControls,
  type MockFailure,
  type MockLatency,
} from '../networking/mockData/mockServer';
import { persistStorage } from './persistStorage';

interface MockControlsState {
  latencyMs: MockLatency;
  failure: MockFailure;
  setLatency: (latencyMs: MockLatency) => void;
  setFailure: (failure: MockFailure) => void;
}

/** Network simulation switches for the admin screen, persisted so a demo setup survives restarts. */
export const useMockControlsStore = create<MockControlsState>()(
  persist(
    set => ({
      latencyMs: 800,
      failure: 'none',
      setLatency: latencyMs => set({ latencyMs }),
      setFailure: failure => set({ failure }),
    }),
    { name: STORAGE_KEYS.mockControls, version: 1, storage: persistStorage },
  ),
);

const syncToMockServer = ({ latencyMs, failure }: MockControlsState) =>
  setMockControls({ latencyMs, failure });

syncToMockServer(useMockControlsStore.getState());
useMockControlsStore.subscribe(syncToMockServer);
