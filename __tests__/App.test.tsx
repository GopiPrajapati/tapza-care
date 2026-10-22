import React from 'react';
import { render, screen } from '@testing-library/react-native';

import App from '../App';

test('renders the Home placeholder', async () => {
  await render(<App />);
  expect(screen.getByText('Home')).toBeTruthy();
});
