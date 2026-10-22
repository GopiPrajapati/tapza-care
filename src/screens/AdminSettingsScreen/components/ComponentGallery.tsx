import React, { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Bell, CalendarPlus, Pill, User, Wallet } from 'lucide-react-native';

import { useTheme, useThemedStyles, type Theme } from '../../../commonutils/theme';
import AppText from '../../../components/AppText';
import Avatar from '../../../components/Avatar';
import Badge from '../../../components/Badge';
import BottomSheet, {
  type BottomSheetRef,
} from '../../../components/BottomSheet';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Chip from '../../../components/Chip';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import FloatingBar from '../../../components/FloatingBar';
import Header from '../../../components/Header';
import Icon from '../../../components/Icon';
import Input from '../../../components/Input';
import ListRow from '../../../components/ListRow';
import Loading from '../../../components/Loading';
import PriceText from '../../../components/PriceText';
import SearchBar from '../../../components/SearchBar';
import SectionHeader from '../../../components/SectionHeader';
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonGroup,
  SkeletonText,
} from '../../../components/Skeleton';
import StaleConfigBanner from '../../../components/StaleConfigBanner';
import StickyActionBar from '../../../components/StickyActionBar';
import { useToast } from '../../../components/Toast';
import { useConfigStore } from '../../../store/configStore';

const noop = () => {};
const CHIPS = ['Consult', 'Lab tests', 'Pharmacy', 'Vaccines'];

/**
 * TEMP(Phase 6), dev builds only: every shared component in the current theme. Switch the theme at the top to
 * check both configs. Removed when AdminSettings is built.
 */
function ComponentGallery() {
  const styles = useThemedStyles(createStyles);
  const { sizes } = useTheme();
  const toast = useToast();
  const sheetRef = useRef<BottomSheetRef>(null);
  const variant = useConfigStore(state => state.variant);
  const setVariant = useConfigStore(state => state.setVariant);
  const [search, setSearch] = useState('');
  const [selectedChip, setSelectedChip] = useState(CHIPS[0]);
  const [barVisible, setBarVisible] = useState(true);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Button
          label={
            variant === 'diwali'
              ? 'Switch to Normal theme'
              : 'Switch to Diwali theme'
          }
          variant="secondary"
          onPress={() => setVariant(variant === 'diwali' ? 'normal' : 'diwali')}
          fullWidth
        />

        <Section title="Typography">
          {(
            [
              'display',
              'title',
              'heading',
              'subheading',
              'body',
              'bodyStrong',
              'label',
              'caption',
            ] as const
          ).map(name => (
            <AppText key={name} variant={name}>
              {name}: Dr. Lakshmi Prasanna
            </AppText>
          ))}
          <AppText color="textSecondary">textSecondary on background</AppText>
        </Section>

        <Section title="Buttons">
          <Button
            label="Book a visit"
            onPress={noop}
            icon={CalendarPlus}
            fullWidth
            size="large"
          />
          <View style={styles.row}>
            <Button label="Secondary" variant="secondary" onPress={noop} />
            <Button label="Ghost" variant="ghost" onPress={noop} />
          </View>
          <View style={styles.row}>
            <Button label="Cancel booking" variant="danger" onPress={noop} />
            <Button label="Loading" onPress={noop} loading />
            <Button label="Disabled" onPress={noop} disabled />
          </View>
        </Section>

        <Section title="Inputs">
          <SearchBar
            placeholder='Search "Paediatrics"'
            value={search}
            onChangeText={setSearch}
          />
          <SearchBar
            placeholder='Search "fever"'
            onPress={() => toast.show({ message: 'Search opens here' })}
            rightSlot={
              <View style={styles.pill}>
                <Icon name="flask-conical" color="primaryText" />
                <AppText variant="label" color="primaryText">
                  Lab tests
                </AppText>
              </View>
            }
          />
          <Input label="Patient name" placeholder="e.g. Anjali Reddy" />
          <Input
            label="Phone"
            placeholder="10-digit mobile"
            error="Enter a 10-digit number"
          />
        </Section>

        <Section title="Headers">
          <Card flush>
            <Header
              title="Dr. Ramesh Reddy"
              subtitle="General Physician"
              onBackPress={noop}
            />
          </Card>
          <SectionHeader title="Explore" onSeeAll={noop} />
        </Section>

        <Section title="Cards, chips, badges, prices">
          <Card
            onPress={() => toast.show({ message: 'Card pressed' })}
            accessibilityLabel="General consultation"
          >
            <View style={styles.cardRow}>
              <Avatar name="Dr. Ramesh Reddy" />
              <View style={styles.flex}>
                <AppText variant="bodyStrong">General consultation</AppText>
                <AppText variant="caption" color="textSecondary">
                  Next: Today, 4:30 PM
                </AppText>
              </View>
              <PriceText amount={500} />
            </View>
            <Badge label="Most booked" />
          </Card>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {CHIPS.map(label => (
              <Chip
                key={label}
                label={label}
                selected={label === selectedChip}
                onPress={() => setSelectedChip(label)}
              />
            ))}
          </ScrollView>
          <View style={styles.row}>
            <Badge label="Festive offer" tone="accent" />
            <Badge label="Confirmed" tone="success" />
            <Badge label="Pending" tone="warning" />
            <Badge label="Failed" tone="danger" />
            <Badge label="Past" tone="neutral" />
          </View>
          <View style={styles.row}>
            <PriceText amount={999} mrp={1499} />
            <PriceText amount={120000} />
          </View>
          <View style={styles.row}>
            <Avatar name="Dr. Ayesha Siddiqui" size="sm" />
            <Avatar
              name="Dr. Srinivas Kandula"
              size="md"
              image="doctors/missing"
            />
            <Avatar name="Gopi" size="lg" />
          </View>
        </Section>

        <Section title="List rows">
          <Card flush>
            <ListRow
              title="My bookings"
              subtitle="2 upcoming"
              icon={CalendarPlus}
              onPress={noop}
              divider
            />
            <ListRow
              title="Reminders"
              icon={Bell}
              value="On"
              valueColor="success"
              onPress={noop}
              divider
            />
            <ListRow
              title="Family members"
              icon={User}
              value="3"
              onPress={noop}
              divider
            />
            <ListRow
              title="Tapza wallet"
              icon={Wallet}
              value="₹0"
              onPress={noop}
            />
          </Card>
        </Section>

        <Section title="Loading states">
          <SkeletonGroup style={styles.skeletonCard}>
            <View style={styles.cardRow}>
              <SkeletonCircle size={sizes.avatarMd} />
              <View style={styles.flex}>
                <SkeletonText lines={2} />
              </View>
            </View>
            <SkeletonBox height={sizes.illustration} />
          </SkeletonGroup>
          <View style={styles.fixedBox}>
            <Loading label="Finding doctors near you" />
          </View>
        </Section>

        <Section title="Empty, error, stale">
          <StaleConfigBanner
            onRetry={() => toast.show({ message: 'Retrying…' })}
          />
          <Card>
            <EmptyState
              illustration="bookings"
              title="No bookings yet"
              message="Book a visit and it will show up here."
              actionLabel="Book a doctor"
              onAction={noop}
            />
          </Card>
          <Card>
            <EmptyState
              illustration="prescriptions"
              title="No prescriptions yet"
            />
          </Card>
          <Card>
            <EmptyState
              illustration="search"
              title="No doctors match"
              message="Try another name or specialty."
            />
          </Card>
          <Card>
            <ErrorState onRetry={noop} />
          </Card>
        </Section>

        <Section title="Feedback and sheets">
          <View style={styles.row}>
            <Button
              label="Toast"
              variant="secondary"
              onPress={() =>
                toast.show({ message: 'Booking saved', tone: 'success' })
              }
            />
            <Button
              label="Toast + Undo"
              variant="secondary"
              onPress={() =>
                toast.show({
                  message: 'Metformin 500 mg marked taken',
                  actionLabel: 'Undo',
                  onAction: () => toast.show({ message: 'Undone' }),
                })
              }
            />
          </View>
          <Button
            label="Open bottom sheet"
            onPress={() => sheetRef.current?.present()}
          />
          <Button
            label={barVisible ? 'Hide floating bar' : 'Show floating bar'}
            variant="ghost"
            onPress={() => setBarVisible(visible => !visible)}
          />
          <FloatingBar
            visible={barVisible}
            icon={Pill}
            title="Next dose: Metformin 500 mg"
            subtitle="Today, 9:00 PM"
            onPress={noop}
            actionLabel="Mark taken"
            onAction={() =>
              toast.show({ message: 'Marked taken', tone: 'success' })
            }
          />
        </Section>
      </ScrollView>

      <StickyActionBar
        label="Consultation"
        amountInr={600}
        caption="Thu 23 Oct, 4:30 PM"
        buttonLabel="Confirm booking"
        onPress={() => toast.show({ message: 'Confirm pressed' })}
      />

      <BottomSheet
        ref={sheetRef}
        title="Pick a time"
        snapPoints={['50%', '85%']}
      >
        <AppText color="textSecondary">
          Drag the handle or swipe down to close.
        </AppText>
        <View style={styles.row}>
          {['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'].map(time => (
            <Chip
              key={time}
              label={time}
              onPress={() => sheetRef.current?.dismiss()}
            />
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const createStyles = ({ colors, spacing, radii, sizes }: Theme) => ({
  root: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  section: { gap: spacing.md },
  row: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
    alignItems: 'center' as const,
  },
  cardRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  flex: { flex: 1 },
  pill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: sizes.minTouch,
    borderRadius: radii.md,
    backgroundColor: colors.muted,
  },
  skeletonCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  fixedBox: { height: sizes.illustration },
});

export default ComponentGallery;
