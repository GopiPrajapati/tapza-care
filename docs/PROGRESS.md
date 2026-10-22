# Tapza Care — progress handoff (Phases 0–13)

Use this file to continue in a new session. Give the new session this file plus `CLAUDE.md`,
`AI_LOG.md` and `docs/phase-prompts.md`, then paste the next phase prompt (Phase 14).

## User context and design preferences
- This is a React Native + strict TypeScript take-home assignment. Follow `CLAUDE.md` and the assignment PDF: mock backend/data only (no production backend), config-driven home/theme/tabs/sections, booking and prescriptions/reminders, resilience states, accessibility, and meaningful tests.
- Preserve the currently approved Figma-inspired color combination and visual direction. The assignment did not include a Figma file; a design direction was developed from the user's examples and already implemented. Do not change its colors unless explicitly requested.
- Aim for a Zepto/Blinkit-like fast commerce feel, especially in the home screen's distinct scrolling bands and responsive interactions, adapted to feel calm and trustworthy for clinic patients.
- Appropriate colors and content must be changeable at runtime through the existing config/mock-server/admin mechanisms without requiring an app release. Keep config-driven theme colors, festival banner/greeting, section order and items; do not add a real backend.
- Work one feature phase at a time on a dedicated `feat/<feature-name>` branch. Do not run Git mutations; the user performs branch/commit/push/merge commands. At phase end, give the concrete commands following the workflow below and report only checks actually run.

## Status
| Phase | What | State | Branch |
|---|---|---|---|
| 0 / 0.5 | CLAUDE.md, AI_LOG.md, README skeleton, folder rules | ✅ merged | main |
| 1 | Pinned dependencies, native setup, Jest mocks | ✅ merged | main |
| 2 | Folder structure, placeholder screens | ✅ merged | main |
| 3 | Typed navigation, tabs from config | ✅ merged | main |
| 4 | Types, zod config validation, mock server, repositories | ✅ merged | main |
| 5 | Zustand stores, TanStack Query hooks, theme from config | ✅ merged | feat/theme-and-data-hooks |
| 6 | Shared themed components + dev gallery | ✅ merged | feat/ui-components |
| 7 | Config-driven Home sections (bands) | ✅ merged | feat/home-sections |
| 8 | Home motion (collapsing header, parallax, back-to-top) | ✅ merged | feat/home-animations |
| 9 | Doctor list (search, filters, cards, states) | ✅ done, **commit/merge if not yet** | feat/doctor-list |
| 10 | Doctor details + date/slot selection UI | ✅ done, **commit/merge if not yet** | feat/booking-flow |
| 11 | Booking confirm, success, My Bookings | ✅ done, **commit/merge if not yet** | feat/booking-flow |
| 12 | Prescriptions list + today's adherence | ✅ done, **commit/merge if not yet** | feat/prescriptions-list |
| 13 | Prescription details + dose tracking | ✅ done, **commit/merge if not yet** | feat/prescription-details |
| 14–16 | Profile/admin, polish, bonus | ⏳ next | see docs/phase-prompts.md |

Last checks (Phase 13): `npx tsc --noEmit` ✅, `npm run lint` ✅, `npm test -- --runInBand` 98/98 ✅,
iOS simulator build + launch ✅ (iPhone 17 Pro Max). Android not run yet (planned in Phase 15).

## Working rules (keep these)
- iOS simulator only until ~80–90% done (Mac has limited disk/RAM). Keep Android code correct.
- Claude never runs git. Each phase ends with: branch name, commit message, merge commands.
- One phase per prompt, then stop. Report files changed, checks actually run, git commands.
- Exact versions in package.json (no `^`/`~`). No new dependency without asking.
- No hard-coded colours/spacing/sizes in components: everything comes from `useTheme()`.
- Data flow: screen → hook → repository → `apiClient` → `mockServer`. Screens never import JSON.
- Append every phase to `AI_LOG.md`.
- Run Prettier only on files you changed (a repo-wide run reformats ~30 old files).

## Environment
- Node 22.13 (`nvm use 22.13.0`, `.nvmrc`). RN 0.88, New Architecture, React 19.3, TypeScript 6.
- iOS: `pod install` (global CocoaPods; `bundle exec` fails on system Ruby 2.6). Simulator: iPhone 17 Pro Max.
- Android: SDK Platform 37 installed; not built yet.
- After changing `babel.config.js`: `npx react-native start --reset-cache`.
- Babel plugins: `@babel/plugin-transform-export-namespace-from` (zod 4) and `react-native-worklets/plugin` (last).
- Gesture Handler is pinned to 2.33.1 (v3 breaks `@gorhom/bottom-sheet` 5.2.14). Reanimated 4.7.1 + worklets 0.13.0.
- Jest uses `react-native-reanimated/jest/resolver` + `setUpTests()`; lucide mapped to its CJS build.

## Architecture (where things live)
```
src/
  App.tsx                      providers + RootNavigator
  assets/config/defaultConfig.json   bundled fallback layout
  assets/images/index.ts       getImage(key) → bundled require | {uri} | undefined
  commonutils/
    constants.ts               STORAGE_KEYS, QUERY_KEYS, DEFAULT_TABS, PATIENT, DOSE_TIMES, ETA
    helpers.ts                 IST dates (clinicDate, formatClinicDay/Time), formatInr, getInitials, hashString
    theme.ts                   buildTheme(config.theme), contrast helpers, ThemeProvider/useTheme,
                               useThemedStyles, toneOn/ToneProvider/SurfaceTone (readable text on bands)
    typography.ts, dimensions.ts
  components/                  AppText Avatar Badge BottomSheet Button Card Chip EmptyState(+Illustration)
                               ErrorState FloatingBar Header Icon Input ListRow Loading NextSlotBadge
                               PressableScale PriceText ScreenContainer SearchBar SectionHeader Skeleton
                               StaleConfigBanner StickyActionBar Toast(useToast)
  container/                   AppProviders, RootNavigator (native stack, BottomSheetModalProvider),
                               TabNavigator (resolveTabs from config.tabs), Routes.ts, queryClient.ts
  hooks/                       useConfig (network → cached → bundled), useDoctors/useDoctor, useSlots,
                               useNextSlot, usePrescriptions/usePrescription, useBookings
                               (useMyBookings, useCreateBooking optimistic + 409), useNextDose,
                               useSectionAction, useAppNavigation, useDebouncedValue
  networking/
    api/                       client.ts (swap point for fetch), endpoints.ts, errors.ts (ApiError, 409)
    repositories/              config, doctor, slot, booking, prescription
    types/                     layoutConfig.ts, models.ts, configSchema.ts (zod, parseConfig)
    mockData/                  config.normal.json, config.diwali.json, doctors.json, prescriptions.json,
                               slotGenerator.ts (deterministic, IST, 7 days), mockServer.ts (latency/failure)
  store/                       configStore, mockControlsStore, doseLogStore (persisted), hydration
  screens/
    HomeScreen/                index (FlatList + scroll animations), sections/ (6 renderers, registry,
                               SectionBackground, SectionBlock, HeroArt), components/ (StickyHomeHeader,
                               TopBand, EntryAnimated, BackToTop, NextDoseBar, HomeSkeleton, HomeScrollContext)
    DoctorListScreen/          index, filterDoctors.ts, components/ (DoctorRow, DoctorListSkeleton)
    DoctorDetailsScreen/       PLACEHOLDER (Phase 10)
    BookingSuccessScreen/      PLACEHOLDER modal (Phase 11)
    MyBookingsScreen/          PLACEHOLDER (Phase 11)
    PrescriptionsScreen/       PLACEHOLDER (Phase 12)
    PrescriptionDetailsScreen/ PLACEHOLDER (Phase 13)
    ProfileScreen/             PLACEHOLDER + TEMP Normal/Diwali toggle (Phase 14)
    AdminSettingsScreen/       TEMP component gallery in __DEV__ (Phase 14 replaces it)
    ServiceListScreen/         PLACEHOLDER (only if time)
__tests__/                     App, nativeMocks, tabs, configValidation, mockServer, theme, sections, doctorList
```

## Already available for the next phases
- **Booking (Phase 10–11):** `useSlots(doctorId, date)`, `useCreateBooking()` (optimistic insert as `pending`,
  confirmed on success, rollback on error, `isSlotTaken` for 409, slot kept taken on 409, no auto-retry),
  `useMyBookings()`. `BottomSheet` wrapper (ref `.present()/.dismiss()`), `StickyActionBar`, `Toast`.
  Slots: 9–12, 2–5, 6–8 IST; ~25% taken; past slots unavailable; some doctors off on Sundays.
  `POST /bookings` returns 201 or 409. Mock failure `booking409` forces 409.
- **Prescriptions (12–13):** `usePrescriptions`, `usePrescription(id)`, `useDoseLogStore` (markTaken/unmark/toggle,
  key `date|prescriptionId|medicineId|timing`), `useIsDoseTaken`, `findNextDose`, `isCourseActive`,
  `DOSE_TIMES` (8:00, 14:00, 21:00). Home `NextDoseBar` already marks doses with Undo.
- **Admin (14):** `useConfigStore` (variant normal|diwali|custom, customConfigJson, lastGoodConfig,
  clearLastGoodConfig), `useMockControlsStore` (latencyMs 0|800|3000, failure none|config|all|booking409|empty),
  `parseConfig()` for the live editor, `useDoseLogStore.reset()`. Mock server has `resetMockServer()`.

## Known issues / TODO carried forward
- Phase 10: StickyActionBar shows a background-coloured strip under it on stack screens (seen in the gallery);
  Toast overlaps StickyActionBar → add a bottom offset.
- Phase 14: remove every `TEMP(Phase 3)` / `TEMP(Phase 5)` button, the Profile theme toggle and the dev gallery;
  add the long-press Home ETA → AdminSettings entry.
- Bookings live only in mock-server memory (lost on app restart) — acceptable; mention in README.
- Not yet verified: 3s-latency skeletons, FPS profiling, Android build/back button, release APK.
- `getItemLayout` not used on Home (heights depend on config + font scale) — documented.

## Key decisions (short)
- Gesture Handler 2.x (not 3) for bottom-sheet compatibility.
- No Redux / no booking store: TanStack Query cache is the single source of server state.
- Two-level config validation: bad envelope rejects config; bad/unknown sections are dropped individually.
- Theme text colours auto-adjusted to WCAG AA; band "tone" keeps text readable on any config colour.
- Normal hero gradient changed to `#0F766E,#115E59` (old light end failed contrast).
- Home header floats over the list; all scroll effects from one `scrollY` shared value on the UI thread.
- Back-to-top threshold 0.6 screens (Home is ~2 screens tall).
- Doctor search is word-prefix ("paed" ≠ "Orthopaedics").

## Next step
1. If Phase 9 is not committed yet:
   ```
   git switch -c feat/doctor-list
   git add -A && git commit -m "feat: add doctor list with search and specialty filters"
   git push -u origin feat/doctor-list
   git switch main && git pull
   git merge --no-ff feat/doctor-list -m "Merge branch 'feat/doctor-list'"
   git push origin main
   ```
2. For Phase 10, use the `feat/booking-flow` branch (create it if needed; the screen/UI work is complete).
3. Continue with Phase 14 from `docs/phase-prompts.md` after committing/merging Phase 13.
