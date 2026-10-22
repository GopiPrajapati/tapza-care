import { useCallback } from 'react';

import { useToast } from '../components/Toast';
import { Routes } from '../container/Routes';
import type { AppAction } from '../networking/types/configSchema';
import { useAppNavigation } from './useAppNavigation';

/** Turns a config action (chip, tile, banner CTA) into navigation. Unknown actions do nothing. */
export function useSectionAction() {
  const navigation = useAppNavigation();
  const toast = useToast();

  return useCallback(
    (action: AppAction | undefined) => {
      switch (action?.type) {
        case 'open_doctors':
          navigation.navigate(Routes.DoctorList, {
            specialty: action.specialty,
          });
          break;
        case 'open_services':
          navigation.navigate(Routes.ServiceList);
          break;
        case 'open_bookings':
          navigation.navigate(Routes.MainTabs, { screen: Routes.Bookings });
          break;
        case 'open_prescriptions':
        case 'open_reminders':
          navigation.navigate(Routes.MainTabs, {
            screen: Routes.Prescriptions,
          });
          break;
        case 'open_family':
          navigation.navigate(Routes.MainTabs, { screen: Routes.Profile });
          break;
        case 'coming_soon':
          toast.show({ message: 'Coming soon to Tapza Care' });
          break;
        default:
          break;
      }
    },
    [navigation, toast],
  );
}
