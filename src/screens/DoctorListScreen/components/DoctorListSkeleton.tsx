import React from 'react';
import { View } from 'react-native';

import {
  useTheme,
  useThemedStyles,
  type Theme,
} from '../../../commonutils/theme';
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonGroup,
  SkeletonText,
} from '../../../components/Skeleton';
import { useTranslation } from 'react-i18next';

const PLACEHOLDER_ROWS = 4;

/** Loading layout shaped like DoctorRow cards. */
function DoctorListSkeleton() {
  const styles = useThemedStyles(createStyles);
  const { sizes, radii } = useTheme();
  const { t } = useTranslation();
  return (
    <SkeletonGroup accessibilityLabel={t('loadingDoctors')} style={styles.list}>
      {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.top}>
            <SkeletonCircle size={sizes.avatarLg} />
            <View style={styles.flex}>
              <SkeletonText lines={3} lastLineWidth="50%" />
            </View>
          </View>
          <View style={styles.bottom}>
            <View style={styles.flex}>
              <SkeletonText lines={2} lastLineWidth="70%" />
            </View>
            <SkeletonBox
              width={sizes.carouselCard / 3}
              height={sizes.control}
              radius={radii.pill}
            />
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}

const createStyles = ({ colors, spacing, radii }: Theme) => ({
  list: { gap: spacing.md, padding: spacing.lg },
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  top: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  bottom: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
  },
  flex: { flex: 1 },
});

export default DoctorListSkeleton;
