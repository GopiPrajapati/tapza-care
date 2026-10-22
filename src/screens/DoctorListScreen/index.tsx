import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ListRenderItem,
} from 'react-native';

import { useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../../components/AppText';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Header from '../../components/Header';
import ScreenContainer from '../../components/ScreenContainer';
import SearchBar from '../../components/SearchBar';
import { Routes, type RootStackScreenProps } from '../../container/Routes';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useDoctors } from '../../hooks/useDoctors';
import type { Doctor } from '../../networking/types/models';
import DoctorListSkeleton from './components/DoctorListSkeleton';
import DoctorRow from './components/DoctorRow';
import { filterDoctors, specialtiesOf } from './filterDoctors';

const keyExtractor = (doctor: Doctor) => doctor.id;

/** All doctors with search and specialty filters; a doctor opens their booking screen. */
function DoctorListScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof Routes.DoctorList>) {
  const styles = useThemedStyles(createStyles);
  const {
    data: doctors,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useDoctors();
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState<string | null>(
    route.params?.specialty ?? null,
  );
  const debouncedQuery = useDebouncedValue(query);

  const specialties = useMemo(() => {
    const list = specialtiesOf(doctors ?? []);
    // Keep a pre-selected specialty visible even if no doctor has it.
    return specialty && !list.includes(specialty) ? [specialty, ...list] : list;
  }, [doctors, specialty]);

  const results = useMemo(
    () => filterDoctors(doctors ?? [], debouncedQuery, specialty),
    [doctors, debouncedQuery, specialty],
  );

  const openDoctor = useCallback(
    (doctorId: string) =>
      navigation.navigate(Routes.DoctorDetails, {
        doctorId,
        serviceId: route.params?.serviceId,
      }),
    [navigation, route.params?.serviceId],
  );

  const renderItem = useCallback<ListRenderItem<Doctor>>(
    ({ item }) => <DoctorRow doctor={item} onOpen={openDoctor} />,
    [openDoctor],
  );

  const clearFilters = useCallback(() => {
    setQuery('');
    setSpecialty(null);
  }, []);

  const filtering = debouncedQuery.trim() !== '' || specialty !== null;

  const body = () => {
    if (isPending) {
      return <DoctorListSkeleton />;
    }
    if (isError) {
      return (
        <ErrorState
          title="Could not load doctors"
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      );
    }
    if (doctors.length === 0) {
      return (
        <EmptyState
          illustration="generic"
          title="No doctors available"
          message="Please check again later."
          actionLabel="Refresh"
          onAction={() => refetch()}
        />
      );
    }
    return (
      <FlatList
        data={results}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={results.length ? styles.list : styles.emptyList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          results.length ? (
            <AppText variant="label" color="textSecondary">
              {results.length} {results.length === 1 ? 'doctor' : 'doctors'}
              {specialty ? ` · ${specialty}` : ''}
            </AppText>
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState
            illustration="search"
            title="No doctors match"
            message="Try another name, specialty or language."
            actionLabel={filtering ? 'Clear filters' : undefined}
            onAction={filtering ? clearFilters : undefined}
          />
        }
        initialNumToRender={5}
        windowSize={7}
      />
    );
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardFrame}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header
          title="Doctors"
          subtitle="Tapza Clinic"
          onBackPress={navigation.goBack}
        />
        <View style={styles.search}>
          <SearchBar
            placeholder='Search "skin", "Telugu", "Dr. Reddy"'
            value={query}
            onChangeText={setQuery}
            autoFocus={route.params?.focusSearch}
          />
        </View>
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.chips}
          >
            <Chip
              label="All"
              selected={specialty === null}
              onPress={() => setSpecialty(null)}
            />
            {specialties.map(item => (
              <Chip
                key={item}
                label={item}
                selected={specialty === item}
                onPress={() =>
                  setSpecialty(current => (current === item ? null : item))
                }
              />
            ))}
          </ScrollView>
        </View>
        {body()}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const createStyles = ({ spacing }: Theme) => ({
  keyboardFrame: { flex: 1 },
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  chips: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  emptyList: { flexGrow: 1 },
});

export default DoctorListScreen;
