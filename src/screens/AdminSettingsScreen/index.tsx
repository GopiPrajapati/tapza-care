import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../commonutils/constants';
import { useTheme, useThemedStyles, type Theme } from '../../commonutils/theme';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import ScreenContainer from '../../components/ScreenContainer';
import { useToast } from '../../components/Toast';
import { useConfig } from '../../hooks/useConfig';
import { resetMockBookings } from '../../networking/mockData/mockServer';
import {
  parseConfig,
  type ValidatedConfig,
} from '../../networking/types/configSchema';
import { useConfigStore } from '../../store/configStore';
import { useDoseLogStore } from '../../store/doseLogStore';
import { useMockControlsStore } from '../../store/mockControlsStore';
import { useTranslation } from 'react-i18next';

const VARIANTS = [
  { value: 'normal', labelKey: 'normal' },
  { value: 'diwali', labelKey: 'diwali' },
  { value: 'custom', labelKey: 'custom' },
] as const;
const LATENCIES = [
  { value: 0, labelKey: 'latencyZero' },
  { value: 800, labelKey: 'latency800' },
  { value: 3000, labelKey: 'latency3000' },
] as const;
const FAILURES = [
  { value: 'none', labelKey: 'none' },
  { value: 'config', labelKey: 'configFails' },
  { value: 'all', labelKey: 'allFail' },
  { value: 'booking409', labelKey: 'force409' },
  { value: 'empty', labelKey: 'emptyLists' },
] as const;

type Validation = { json: string; errors: string[]; config?: ValidatedConfig };

function validationFor(json: string, invalidJsonText: string): Validation {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (error) {
    return {
      json,
      errors: [
        `(json): ${error instanceof Error ? error.message : invalidJsonText}`,
      ],
    };
  }
  const result = parseConfig(raw);
  if (!result.ok) {
    return { json, errors: result.error.split('; ') };
  }
  const errors = result.droppedSections.map(section => {
    const path = `sections[${section.index}]`;
    if (section.details) return `${path}.${section.details}`;
    return `${path}.type: unsupported section type "${
      section.type ?? 'unknown'
    }"`;
  });
  return errors.length
    ? { json, errors }
    : { json, errors: [], config: result.config };
}

function AdminSettingsScreen() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { config } = useConfig();
  const queryClient = useQueryClient();
  const toast = useToast();
  const variant = useConfigStore(state => state.variant);
  const setVariant = useConfigStore(state => state.setVariant);
  const setCustomConfigJson = useConfigStore(
    state => state.setCustomConfigJson,
  );
  const clearLastGoodConfig = useConfigStore(
    state => state.clearLastGoodConfig,
  );
  const latencyMs = useMockControlsStore(state => state.latencyMs);
  const setLatency = useMockControlsStore(state => state.setLatency);
  const failure = useMockControlsStore(state => state.failure);
  const setFailure = useMockControlsStore(state => state.setFailure);
  const resetDoseLog = useDoseLogStore(state => state.reset);
  const [draft, setDraft] = useState(() => JSON.stringify(config, null, 2));
  const [dirty, setDirty] = useState(false);
  const [validation, setValidation] = useState<Validation | null>(null);
  const isValidated =
    validation?.json === draft && validation.errors.length === 0;

  useEffect(() => {
    if (!dirty) setDraft(JSON.stringify(config, null, 2));
  }, [config, dirty]);

  const validationResult = useMemo(
    () => (validation?.json === draft ? validation : null),
    [draft, validation],
  );

  const validate = () => {
    const result = validationFor(draft, t('invalidJson'));
    setValidation(result);
    toast.show({
      message: result.errors.length
        ? t('foundConfigIssues', { count: result.errors.length })
        : t('configValid'),
      tone: result.errors.length ? 'error' : 'success',
    });
  };

  const apply = () => {
    if (!isValidated) return;
    setCustomConfigJson(draft);
    setVariant('custom');
    setDirty(false);
    toast.show({ message: t('customConfigApplied'), tone: 'success' });
  };

  const clearCache = () => {
    clearLastGoodConfig();
    queryClient.invalidateQueries({ queryKey: ['config'] });
    toast.show({ message: t('cachedConfigCleared'), tone: 'success' });
  };

  const resetBookings = () => {
    resetMockBookings();
    queryClient.setQueryData(QUERY_KEYS.bookings, []);
    queryClient.invalidateQueries({ queryKey: ['slots'] });
    toast.show({
      message: t('bookingsReset'),
      tone: 'success',
    });
  };

  return (
    <ScreenContainer edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardFrame}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <AppText variant="title" accessibilityRole="header">
            {t('adminTitle')}
          </AppText>

          <SettingsSection
            title={t('appConfig')}
            description={t('appConfigDescription')}
          >
            <ChoiceGroup
              options={VARIANTS.map(option => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              selected={variant}
              onSelect={value => setVariant(value)}
            />
          </SettingsSection>

          <SettingsSection
            title={t('mockNetwork')}
            description={t('mockNetworkDescription')}
          >
            <AppText variant="label">{t('latency')}</AppText>
            <ChoiceGroup
              options={LATENCIES.map(option => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              selected={latencyMs}
              onSelect={value => setLatency(value)}
            />
            <AppText variant="label">{t('failureMode')}</AppText>
            <ChoiceGroup
              options={FAILURES.map(option => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              selected={failure}
              onSelect={value => setFailure(value)}
            />
          </SettingsSection>

          <SettingsSection
            title={t('localData')}
            description={t('localDataDescription')}
          >
            <Button
              label={t('clearConfig')}
              variant="secondary"
              onPress={clearCache}
            />
            <Button
              label={t('resetDoseLog')}
              variant="secondary"
              onPress={() => {
                resetDoseLog();
                toast.show({ message: t('doseLogReset'), tone: 'success' });
              }}
            />
            <Button
              label={t('resetBookings')}
              variant="secondary"
              onPress={resetBookings}
            />
          </SettingsSection>

          <SettingsSection
            title={t('liveConfigEditor')}
            description={t('configEditorDescription')}
          >
            <TextInput
              accessibilityLabel={t('configJsonEditor')}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textAlignVertical="top"
              value={draft}
              onChangeText={value => {
                setDraft(value);
                setDirty(true);
                setValidation(null);
              }}
              style={[
                styles.editor,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            />
            <View style={styles.editorActions}>
              <Button
                label={t('validate')}
                variant="secondary"
                onPress={validate}
              />
              <Button
                label={t('apply')}
                onPress={apply}
                disabled={!isValidated}
              />
            </View>
            {validationResult ? (
              <Card
                elevated={false}
                style={
                  validationResult.errors.length
                    ? styles.validationError
                    : styles.validationSuccess
                }
              >
                {validationResult.errors.length ? (
                  <>
                    <AppText variant="bodyStrong" color="danger">
                      {t('configIssue', {
                        count: validationResult.errors.length,
                      })}
                    </AppText>
                    {validationResult.errors.map((error, index) => (
                      <AppText
                        key={`${index}-${error}`}
                        variant="caption"
                        color="danger"
                      >
                        • {error}
                      </AppText>
                    ))}
                  </>
                ) : (
                  <AppText variant="bodyStrong" color="success">
                    {t('configReady')}
                  </AppText>
                )}
              </Card>
            ) : null}
          </SettingsSection>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="caption" color="textSecondary">
          {description}
        </AppText>
      </View>
      <Card style={styles.sectionBody}>{children}</Card>
    </View>
  );
}

function ChoiceGroup<T extends string | number>({
  options,
  selected,
  onSelect,
}: {
  options: readonly { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.choices}
    >
      {options.map(option => (
        <Chip
          key={String(option.value)}
          label={option.label}
          selected={option.value === selected}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </ScrollView>
  );
}

const createStyles = ({
  colors,
  spacing,
  radii,
  sizes,
  typography,
}: Theme) => ({
  keyboardFrame: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: { gap: spacing.sm },
  sectionHeader: { gap: spacing.xxs },
  sectionBody: { gap: spacing.md },
  choices: { gap: spacing.sm, paddingVertical: spacing.xxs },
  editor: {
    minHeight: sizes.heroArt * 2,
    maxHeight: sizes.heroArt * 4,
    borderWidth: sizes.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontFamily: 'Menlo',
    fontSize: typography.caption.fontSize,
  },
  editorActions: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    gap: spacing.sm,
  },
  validationError: { gap: spacing.xs, backgroundColor: colors.dangerSurface },
  validationSuccess: { backgroundColor: colors.successSurface },
});

export default AdminSettingsScreen;
