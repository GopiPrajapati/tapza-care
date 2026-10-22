import { useCallback } from 'react';

import { useToast } from '../components/Toast';
import { Routes } from '../container/Routes';
import type { AppAction } from '../networking/types/configSchema';
import { useAppNavigation } from './useAppNavigation';
import { useTranslation } from 'react-i18next';

/** Turns a config action (chip, tile, banner CTA) into navigation. Unknown actions do nothing. */
export function useSectionAction() {
  const navigation = useAppNavigation();
  const toast = useToast();
  const { t } = useTranslation();

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
          toast.show({ message: t('comingSoonTapza') });
          break;
        default:
          break;
      }
    },
    [navigation, toast, t],
  );
}
