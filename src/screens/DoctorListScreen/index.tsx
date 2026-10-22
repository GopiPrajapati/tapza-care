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
import { useTranslation } from 'react-i18next';

const keyExtractor = (doctor: Doctor) => doctor.id;

/** All doctors with search and specialty filters; a doctor opens their booking screen. */
function DoctorListScreen({
  navigation,
  route,
}: RootStackScreenProps<typeof Routes.DoctorList>) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
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

  const results = filterDoctors(doctors ?? [], debouncedQuery, specialty);

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
          title={t('doctorsError')}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      );
    }
    if (doctors.length === 0) {
      return (
        <EmptyState
          illustration="generic"
          title={t('doctorsEmpty')}
          message={t('checkAgainLater')}
          actionLabel={t('refresh')}
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
              {results.length}{' '}
              {results.length === 1 ? t('doctor') : t('doctors')}
              {specialty ? ` · ${t(specialty)}` : ''}
            </AppText>
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState
            illustration="search"
            title={t('doctorsNoMatch')}
            message={t('doctorsSearchHint')}
            actionLabel={filtering ? t('clearFilters') : undefined}
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
          title={t('doctorsTitle')}
          subtitle={t('tapzaClinic')}
          onBackPress={navigation.goBack}
        />
        <View style={styles.search}>
          <SearchBar
            placeholder={t('doctorSearch')}
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
              label={t('all')}
              selected={specialty === null}
              onPress={() => setSpecialty(null)}
            />
            {specialties.map(item => (
              <Chip
                key={item}
                label={t(item)}
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
