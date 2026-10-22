/** Path builders for every endpoint. Keep URLs here, never inline in repositories. */
export const Endpoints = {
  config: () => '/config',
  doctors: () => '/doctors',
  slots: (doctorId: string, date: string) =>
    `/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`,
  bookings: () => '/bookings',
  prescriptions: () => '/prescriptions',
} as const;
