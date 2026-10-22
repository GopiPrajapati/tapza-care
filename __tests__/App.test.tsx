import React from 'react';
import { render, screen } from '@testing-library/react-native';

import App from '../App';

test('opens on the Home tab with all four tabs', async () => {
  await render(<App />);
  expect(screen.getByText('Config-driven home with sections goes here.')).toBeTruthy();
  for (const label of ['Home', 'Bookings', 'Medicines', 'Profile']) {
    expect(screen.getByRole('button', { name: label })).toBeTruthy();
  }
});
