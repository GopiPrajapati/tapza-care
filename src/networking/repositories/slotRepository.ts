import { apiClient } from '../api/client';
import { Endpoints } from '../api/endpoints';
import type { Slot } from '../types/models';

/** `date` is a clinic-local YYYY-MM-DD. */
export const fetchSlots = (doctorId: string, date: string): Promise<Slot[]> =>
  apiClient.get<Slot[]>(Endpoints.slots(doctorId, date));
