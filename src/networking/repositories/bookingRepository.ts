import { apiClient } from '../api/client';
import { Endpoints } from '../api/endpoints';
import type { Booking, CreateBookingRequest } from '../types/models';

/** Rejects with ApiError 409 when the slot is taken. */
export const createBooking = (request: CreateBookingRequest): Promise<Booking> =>
  apiClient.post<Booking>(Endpoints.bookings(), request);

export const fetchBookings = (): Promise<Booking[]> =>
  apiClient.get<Booking[]>(Endpoints.bookings());
