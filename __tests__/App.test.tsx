import React from 'react';
import { render, screen } from '@testing-library/react-native';

import App from '../App';
import { useMockControlsStore } from '../src/store/mockControlsStore';

// No cache-cleanup timers in tests, so Jest can exit as soon as the test ends.
jest.mock('../src/container/queryClient', () => {
  const { QueryClient } = jest.requireActual('@tanstack/react-query');
  return {
    createQueryClient: () =>
      new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } }),
  };
});

beforeEach(() => {
  useMockControlsStore.setState({ latencyMs: 0, failure: 'none' });
});

test('opens on the Home tab with the tabs from config', async () => {
  const { unmount } = await render(<App />);

  expect(
    await screen.findByText('Config-driven home with sections goes here.'),
  ).toBeTruthy();
  for (const label of ['Home', 'Bookings', 'Medicines', 'Profile']) {
    expect(screen.getByRole('button', { name: label })).toBeTruthy();
  }
  unmount();
});
