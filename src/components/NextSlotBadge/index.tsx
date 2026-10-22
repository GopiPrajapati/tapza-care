import React from 'react';

import { formatClinicDay, formatClinicTime } from '../../commonutils/helpers';
import { useTheme } from '../../commonutils/theme';
import { useNextSlot } from '../../hooks/useNextSlot';
import Badge from '../Badge';
import { SkeletonBox } from '../Skeleton';
import { useTranslation } from 'react-i18next';

/** "Today, 4:30 PM" style badge with a doctor's next free slot (today, else tomorrow). */
function NextSlotBadge({ doctorId }: { doctorId: string }) {
  const { typography } = useTheme();
  const { t } = useTranslation();
  const { slot, isLoading } = useNextSlot(doctorId);

  if (isLoading) {
    return <SkeletonBox width="45%" height={typography.caption.lineHeight} />;
  }
  if (!slot) {
    return <Badge label={t('fullyBooked')} tone="neutral" />;
  }
  const day = formatClinicDay(slot.startsAt.slice(0, 10), Date.now());
  return (
    <Badge
      label={`${day}, ${formatClinicTime(slot.startsAt)}`}
      tone="success"
    />
  );
}

export default NextSlotBadge;
