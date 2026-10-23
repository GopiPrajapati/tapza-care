# AI Log

Tools: ChatGPT (initial planning prompts), Claude Code (planning review + implementation).
Each phase records the prompt that shaped the code and what was rejected or changed.

## Phase −1 — Planning review (Claude Code reviewing ChatGPT's plan against the PDF)

**Input:** assignment PDF, 4 Stitch HTML mockups, Zepto screenshots, a 38s Zepto screen recording, and a set of
ChatGPT-generated phase prompts.

**Kept from Zepto:** collapsing address/ETA header with sticky search, top band colour behind the header,
"Back to top" pill, floating bar above the tab bar, shape-matched skeletons, per-band backgrounds.

**Rejected from the ChatGPT plan, and why:**
| Idea | Why rejected |
|---|---|
| Redux | Too heavy for the slice. TanStack Query gives loading/error/retry/cache/optimistic rollback; Zustand covers the little app state left. |
| A "Doctors" tab | PDF restricts tab screens to `home \| bookings \| prescriptions \| profile`, and tabs come from config. Doctor list is a stack screen. |
| Separate BookingDateTime / Confirmation / ServiceDetails / BookingDetails screens | PDF wants slot picking in a gesture-driven bottom sheet; fewer, polished screens beat more unfinished ones. |
| `home-intro.mp4` video asset | Extra native dependency, no user value. |
| "Don't treat optimistic display as success" / no optimistic UI | PDF requires optimistic confirm, then reconcile; we roll back on 409. |
| "Don't add storage" | PDF requires caching the last good config → AsyncStorage. |
| Generic `CareApi` | PDF fixes the endpoints and shapes; the client mirrors them exactly. |
| Bengaluru/Indiranagar content, hard-coded "October 2024" | PDF asks for Hyderabad or Vijayawada; dates must be relative to today. |
| Digital token, Rx upload, directions (from Stitch) | Out of scope. |

**Gaps the ChatGPT plan missed (added):** latency/failure mock switch, zod config validation with unknown-type skip,
header/parallax/viewport animations, theme built from config, accessibility basics, required tests, AI_LOG, README
sections, `/docs` media, APK release.

## Phase 0 — Rules, project memory, environment check

**Prompt:** inspect project without installing; write CLAUDE.md (all PDF requirements + engineering rules),
AI_LOG.md, README skeleton. Stop and report.
**Rejected:** nothing.

## Phase 0.5 — Permanent rules in CLAUDE.md

**Prompt:** docs only. Add to CLAUDE.md: mandatory folder structure (user's ChatGPT structure adapted for TS and
the PDF), exact screen inventory, exact-version dependency rule, data-flow rule (screen → hook → repository → api
client → mockServer), Zepto visual reference, local image assets with fallback.
**Kept from ChatGPT:** folder layout (`assets`, `commonutils`, `components`, `container`, `screens`, `hooks`,
`networking/{api,repositories,types,mockData}`), phase order (structure → navigation → state → components → screens),
typed routes passing IDs only, API-ready repositories, third-party bottom sheet.
**Rejected:**
| ChatGPT idea | Why rejected |
|---|---|
| `redux/` folder | Zustand in `store/`; TanStack Query covers server state, little app state remains. |
| `BookingDateTimeScreen`, `BookingConfirmationScreen` | PDF wants slot picking in a bottom sheet; merged into `DoctorDetailsScreen`. |
| `ServiceDetailsScreen`, `BookingDetailsScreen` | Not required; fewer, polished screens. |
| `videos/home-intro.mp4` | Native dependency, no user value. |
| "No optimistic display as success" | PDF requires optimistic confirm, then reconcile; rollback on 409. |
| "Don't add storage" | PDF requires caching the last good config (AsyncStorage). |
| Generic `CareApi` | PDF fixes endpoints and shapes; client mirrors them exactly. |

## Phase 1 — Dependencies and native setup

**Prompt:** install all packages in one go, latest versions that support RN 0.88 + New Arch + React 19, pin every
version exactly (no `^`/`~`), worklets Babel plugin, pods, Android setup, Jest mocks.
**Decisions:**

- `react-native-gesture-handler` pinned to **2.33.1** (npm `legacy` tag), not 3.4.0 (`latest`). GH 3 removed/renamed
  exports that `@gorhom/bottom-sheet@5.2.14` imports (`GestureDetector` is the new v3 detector, `SimultaneousGesture`
  and the old `PanGesture` type are gone). GH 2.33.1 supports RN 0.84+.
- Reanimated **4.7.1** + worklets **0.13.0**: Reanimated's `compatibility.json` lists 4.7.x ↔ RN 0.86–0.88 ↔ worklets 0.13.x.
- `test-renderer@1.3.1` added as a devDependency: it is a required peer of `@testing-library/react-native@14`.
- Jest: Reanimated's own resolver (`react-native-reanimated/jest/resolver`) + `setUpTests()`; the plain
  `jest.mock('react-native-reanimated', …/mock)` crashes under Reanimated 4. lucide mapped to its CommonJS build.
- Android `MainActivity.onCreate` sets `RNScreensFragmentFactory`, as react-native-screens documents.
  **Rejected:** `npm audit fix --force` for the toolchain vulnerability warnings (would break pinned RN tooling).

## Phase 2 — Folder structure and placeholder screens

**Prompt:** create the CLAUDE.md folder structure, 10 placeholder screens, typed stubs for 8 shared components,
move root to `src/App.tsx`, `AppProviders` with GestureHandlerRootView + SafeAreaProvider, remove
`@react-native/new-app-screen`, no navigation/data/store yet.
**Decisions:** `RootNavigator` renders `HomeScreen` directly until the navigation phase; `TabNavigator.tsx`,
`Routes.ts`, `helpers.ts`, `theme.ts`, `typography.ts` are documented empty modules filled in later phases.
`MIN_TAP_TARGET = 44` lives in `commonutils/dimensions.ts` and is used by Button and Input.
**Rejected:** nothing.

## Phase 3 — Typed navigation

**Prompt:** `Routes.ts` with route constants + typed param lists (IDs only), root native stack with `MainTabs` as
the explicit initial route, `BookingSuccess` as a modal without swipe-back, tabs generated from a config-shaped
array with screen and icon maps, temporary route-test buttons, Android back handled.
**Decisions:**

- `resolveTabs()` (in `TabNavigator.tsx`) skips unknown and duplicate tab screens and falls back to
  `DEFAULT_TABS` when nothing usable is left, so a bad config can never leave the app without a tab bar. Tested.
- `TabConfig` type placed in `networking/types/layoutConfig.ts`; the data-layer phase extends it into the full
  `LayoutConfig`.
- `BookingSuccess` uses `fullScreenModal` + `gestureEnabled: false`; its buttons use `popTo(MainTabs, …)` so the
  booking screens are cleared. Android hardware back on that screen also goes Home (BackHandler), instead of
  returning to the booking screen.
- Stack back button is chevron-only (`headerBackButtonDisplayMode: 'minimal'`): the default showed "MainTabs".
- `useAppNavigation` lives in `src/hooks/` (hooks folder rule) rather than `Routes.ts`.
- Tab screen components are typed `React.ComponentType<any>` in the screen map, with a comment: the route is
  chosen at runtime from config, so TS cannot pair each component with its route props there.
- Verified on the iOS simulator only (user's choice: limited disk/RAM; Android checked later).
  **Rejected:** nothing.

## Phase 4 — Data layer

**Prompt:** exact PDF types, zod schemas with per-section validation and `parseConfig`, two configs (normal +
Diwali) each with an unknown section type, doctors/prescriptions fixtures, deterministic slots, a mock server
router with latency/failure controls and 409, an api client that can swap to fetch, repositories, image resolver,
config validation tests.
**Decisions:**

- Two-level validation: an invalid envelope (version/theme/tabs) rejects the config; each section is then
  validated alone, so one bad or unknown section is dropped without affecting the rest. Duplicate section ids
  are dropped too (they are list keys).
- Theme and background colours must be hex; gradients are comma-separated hex. The theme builder can rely on it.
- Unknown `action.type` values become `"none"` (zod `.catch`) instead of invalidating the item, so a newer config
  never breaks an older app.
- Section types are inferred from the zod schemas (`z.infer`) so types and validation cannot drift apart.
- Additions to the PDF shapes, all marked in code: `Doctor.clinicName`, `service_grid.columns` (2|3, default 2),
  `GET /bookings` (Bookings tab list). `GET /doctors/:id` and `/prescriptions/:id` are not in the contract, so
  repositories filter the list.
- Clinic time is IST (+05:30) everywhere, independent of the device time zone. Prescription `issuedAt` is stored as
  `issuedDaysAgo` in the fixture so the data never goes stale.
- Slots: seeded by an FNV-1a hash of doctor/date/time: 15/20/30-minute slots by doctor, about 25% taken, past
  slots unavailable, some doctors off on Sundays (exercises the empty-day state), today + 6 days only.
- `isApiError()` checks by shape, not `instanceof`, which is unreliable for transpiled Error subclasses.
- Added `__tests__/mockServer.test.ts` (deterministic slots, booking window, 201 then 409, failure switch,
  config variant) on top of the requested config validation tests.
  **Rejected:** a generic `CareApi` interface (the endpoints are fixed by the PDF; the client mirrors them).

## Phase 5 — State, data hooks and theme

**Prompt:** persisted Zustand stores (config variant + last good config, mock controls, dose log), TanStack Query
hooks with an optimistic booking mutation, `useConfig` with fresh → cached → bundled fallback, `buildTheme()` with
contrast-checked derived colours, ThemeProvider, tabs from `config.tabs`, a temporary Normal/Diwali toggle,
a theme contrast test.
**Decisions:**

- No `useBookingStore`: bookings are server state, so TanStack Query's cache (with optimistic updates) is the
  single source of truth. A second store would need syncing and could disagree with the cache.
- Stores sync into the mock server via `subscribe`, so the admin switches change what the "server" returns.
- The app renders nothing until persisted stores hydrate, so the first request already uses the saved variant
  (verified: a cold start after choosing Diwali opens straight into Diwali, no flash of the normal theme).
- `useConfig` always returns a config. Switching variant keeps the old layout until the new one arrives
  (`keepPreviousData`). The persisted last-good config is re-validated on read.
- Bundled fallback layout lives in `src/assets/config/defaultConfig.json` (a shipped asset, separate from mock
  fixtures, so the data rule holds).
- On a 409 the booking is rolled back but the slot stays marked taken; on other errors the slot is restored.
  Mutations never auto-retry (no double booking).
- Contrast: `ensureContrast()` nudges text colours towards black/white until WCAG AA 4.5:1 against both
  background and surface; tested on both configs plus a deliberately low-contrast and a dark config.
- `theme.ts` stays `.ts` (agreed structure) by using `createElement` for the provider.
- Added `@babel/plugin-transform-export-namespace-from` (pinned 7.29.7, already installed via preset-env):
  zod 4 uses `export * as ns`, which made Metro fail to bundle the app. Jest did not catch it; found by running
  the app. Exception to "no new dependency without asking", flagged to the user.
- RN 0.88 removed `StatusBar.backgroundColor` (Android is edge-to-edge); only the bar style is themed.
  **Rejected:** a Redux/Zustand booking store (duplicates server state).

## Phase 6 — Shared components

**Prompt:** shared UI components reading `useTheme()` only (no hard-coded colours/spacing/sizes), Zepto visual
language but calmer for older users, accessibility labels on every touchable, SVG empty-state illustrations,
a temporary dev-only gallery on AdminSettings.
**Built:** AppText, Icon (config icon names → lucide, unknown → fallback), PressableScale, Button, Card, Input,
SearchBar (editable or tap-to-open, right pill slot), Header (round back), SectionHeader (SVG dashed rule,
See all), Chip, Badge, PriceText, Avatar (image → initials), Skeleton (Group/Box/Circle/Text), Loading,
EmptyState (+ Illustration), ErrorState, StaleConfigBanner, Toast (provider + `useToast`), FloatingBar,
StickyActionBar, BottomSheet, ListRow.
**Decisions:**

- Theme gained `sizes` (touch target 44, control heights, icons, avatars) and `motion` (durations) so components
  hard-code no dimensions; plus `inverseSurface`/`onInverse` for the dark floating bar and toast.
- `useThemedStyles(factory)` memoises a StyleSheet per theme; factories are module-level.
- `Card` and `PressableScale` make `accessibilityLabel` required by type when pressable.
- Skeletons share one pulse per `SkeletonGroup` (one animation per screen, not per block); reduced motion stops it.
- Section header dash is drawn with SVG: single-side dashed borders render solid on iOS.
- `formatInr` does Indian grouping (₹1,20,000) itself instead of relying on Intl in Hermes. Tested.
- `BottomSheetModalProvider` sits inside the NavigationContainer so sheet content can navigate; Toast sits at the
  app root above the tab bar.
- Tab icons now reuse the shared Icon map.
- Verified on iOS in both themes: all components, sheet open + swipe-to-close, toast with Undo, theme switch.
  **Known issue (temp gallery only):** a background-coloured strip shows under StickyActionBar on the
  native-stack screen; not a double safe-area inset (fixed that, strip remains). Investigate in Phase 10 where the
  bar is used for real. Toast overlaps a StickyActionBar; add a bottom offset option then.
  **Rejected:** a gradient-sweep shimmer (heavier; opacity pulse reads as loading and is cheaper on mid-range Android).

## Phase 7 — Home sections (static, no scroll motion)

**Prompt:** section registry (unknown type → null), SectionBackground (color/gradient/image with fallback), the six
section renderers, Zepto-style header + search on a rounded top band coloured by the first section, FlatList of
memoised sections keyed by id, a "Next dose" floating bar from prescriptions + dose log, shape-matched skeleton,
error and stale states, both configs distinct. Tests for ServiceGrid and unknown types.
**Decisions:**

- **Band tone:** config colours are arbitrary, so `toneOn(stops)` picks text colours that reach WCAG AA on every
  gradient stop of a band; `AppText` uses it automatically inside a band. Cards, chips, search and the sticky bar
  reset to normal theme colours (`SurfaceTone`), so a white card on a dark band still reads correctly.
- The first section shares the top band with the header and search (Zepto); every other section is its own band.
- `react-native-linear-gradient` is a legacy interop view on the New Architecture and does not grow with its
  children, so it is drawn as an absolute background layer behind normal content.
- Normal hero gradient changed from `#0F766E,#14B8A6` to `#0F766E,#115E59`: no text colour reached AA on the light
  teal end (caught by the tone check; a dev warning now flags such configs).
- Quick actions: 4 items → 2×2 large tiles (easier for older users than Zepto's 3-column), 3/6 items → 3 columns.
- Doctor cards show each doctor's next free slot (`useNextSlot`: today, else tomorrow); slot queries are per
  doctor and cached, so the carousel costs at most 2 small requests per visible doctor.
- `findNextDose` is pure and tested; the floating bar's "Mark taken" writes the persisted dose log with an Undo
  toast.
- Drawn hero art (care badge / diya) is used when the config's image key is not bundled, so both configs look
  finished without stock photos.
- Verified on the iOS simulator in both configs (Normal: teal, hero → tiles → chips → doctors → 3-col grid → offer;
  Diwali: maroon, festival greeting + diya, gradient offer strip, 2-col festive packages with badges, different order).
  **Rejected:** formatting unrelated files — a repo-wide Prettier run touched ~30 files outside this phase; those
  were restored to keep the commit focused.
  **Known gaps (later phases):** search bar opens the doctor list (no search screen yet); "See all" for services
  and the Book pill both go to the doctor list.

## Phase 8 — Home motion (Zepto feel)

**Prompt:** collapsing header with pinned search and band-coloured background, hero parallax, one-time section
entry, back-to-top pill, floating bar hide/show, cross-fade on config switch, reduce-motion support, all on the
UI thread. The user also shared a Zepto screen recording; frames were extracted and studied.
**What the Zepto video shows (and we copied):** the address/ETA row slides up and fades; the search bar rises and
pins under the status bar; the band colour stays behind the search bar while collapsing, then the header and the
status-bar strip turn white once pinned (that is the "safe area comes back" effect); scrolling back to the top
reverses it.
**Decisions:**

- `StickyHomeHeader` floats over the list (absolute). Its height, background (`interpolateColor` band → surface),
  ETA fade/scale and the pin all derive from one `scrollY` shared value (`useAnimatedScrollHandler`), so no JS runs
  per frame. The top band reserves the measured header height as padding.
- Status-bar icons switch between band style and theme style via a focused `<StatusBar>` element, flipped once
  when crossing the pin point (`useAnimatedReaction` → `scheduleOnRN`), not per frame.
- Hero parallax (0.35× rate, fade) and overscroll stretch; an `OverscrollFill` paints the band colour above the
  list during iOS bounce.
- Section entry: `onViewableItemsChanged` marks ids in a shared map; `EntryAnimated` fades/slides 14pt once.
  Seen sections stay visible on scroll-back and after list recycling.
- Back-to-top: prompt said ~1.5 screens, but home is ~2 screens tall so it could never show; uses 0.6 screens.
  First version mounted with a layout `entering` animation and never appeared on iOS; replaced with a pill whose
  opacity/offset follow `scrollY` on the UI thread (state only toggles touchability).
- Dose bar hides on scroll down past the header and returns on scroll up or at the top (6pt jitter threshold).
- Config switch remounts the home content (keyed by version + theme + section ids) with a 320ms fade.
- Reduce Motion (`useReducedMotion`) disables parallax, entry animation, content fade and scroll-to-top animation.
- Bugs found and fixed while testing: a JS helper (`withAlpha`) called inside a worklet crashed on the UI thread
  (colours now computed on JS first); the list was gated on header measurement, which never happens in Jest.
  **Not done (honest):** Perf Monitor FPS profiling and the Android release build were not run (iOS-only testing
  for now, per the user's disk/RAM limits). `getItemLayout` not used: section heights depend on config and font
  scale, so fixed heights would be wrong.
  **Rejected:** a JS `onScroll` listener for the header (would run per frame on the JS thread).

## Phase 9 — Doctor list

**Prompt:** DoctorListScreen with debounced search (name/specialty/language), specialty chips, doctor cards with
fee and next slot, skeleton/empty/no-results/error states, opened from carousel "See all", Book quick action,
Consult chip (pre-selected specialty) and the Home search bar (focused search).
**Decisions:**

- Search is word-prefix based: each query word must start a word in the doctor's name, specialty, languages or
  clinic. A plain substring match was tried first and "paed" matched "Orthopaedics" (caught on the simulator).
  Multi-word queries narrow ("telugu paed" → Telugu-speaking paediatricians). Tested.
- `filterDoctors` is a pure function next to the screen, so it is unit-tested without React.
- Next-slot badge extracted into a shared `NextSlotBadge` component (carousel and list both use it).
- `DoctorList` route gained `focusSearch`; the Home search bar passes it, the Book pill does not. The Consult chip
  in all configs now pre-selects "General Physician".
- The screen uses an in-screen header (back + title + search + chips) instead of the native header.
- Specialty chips come from the data; a pre-selected specialty with no doctors still shows as a chip so the user
  can clear it.
- Debounce 250ms (`useDebouncedValue`); search field has autocorrect and autocapitalise off.
  **Verified on iOS:** opened from the search bar with focus, typed "telugu paed" → 2 doctors, added Gynaecology
  filter → "No doctors match" + Clear filters → back to 10, Book → DoctorDetails(doc-1).
  **Not verified:** the 3s latency skeleton (covered in Phase 14 once the mock controls UI exists).

## Phase 10 — Doctor details and appointment selection

**Prompt:** Doctor summary (including optional selected service), animated 7-day date strip, gesture-driven slot
sheet with availability/error/empty states, persisted selection while the screen remains mounted, Zepto-style
sticky action bar, fix the sticky bar safe-area strip and toast overlap. Confirm is intentionally a no-op.
**Decisions:**

- Used the existing doctor and slot repositories/query hooks. The booking window queries all 7 dates so the
  empty-day action can jump to the next day that actually has an available slot.
- Added an optional scrollable mode to the shared BottomSheet wrapper, using Gorhom's coordinated scroll view;
  the date and slot selection live in DoctorDetailsScreen state, so dismissing/reopening the sheet and switching
  tabs preserves the choice. Picking a different date clears the chosen slot and reopens the sheet.
- Service name and price come from the matching `service_grid` item in active config. Otherwise the doctor fee is
  used. Doctor clinic name and area are split from the existing fixture's clinic string.
- Stack screen omits bottom SafeAreaView padding because StickyActionBar already owns the bottom inset; this
  removes the exposed background strip. Toast now clears the tab-bar and sticky-action-bar height.
- Unavailable slots use disabled themed Chips and cannot be pressed. The selected state is animated with
  Reanimated and respects Reduce Motion.
  **Verified:** `npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand` (8 suites, 94 tests), and
  `npm run ios -- --simulator "iPhone 17 Pro Max" --no-packager` (built and launched successfully).
  **Rejected:** confirmation/navigation and booking mutation remain out of this phase; Phase 11 owns them.

## Phase 11 — Booking confirmation and bookings list

**Prompt:** Confirm optimistically inserts a pending booking and opens BookingSuccess immediately; reconcile the
POST response live, recover a failed/409 slot selection, prevent duplicate submissions, and implement My Bookings
with upcoming/past, loading, empty, and retry states. Add booking-state tests; verify with 3s latency and forced 409.
**Decisions:**

- TanStack Query remains the booking source of truth. `useCreateBooking` inserts a pending item immediately,
  reconciles it to the returned confirmed booking, and removes it on failure. A 409 keeps that selected slot
  unavailable in the cache; the optimistic booking disappears.
- An in-flight guard prevents rapid duplicate submits, in addition to disabling the action while pending. The
  success screen receives IDs and resolves live query state, so the pending → confirmed status updates in place.
- BookingSuccess uses the small local Lottie asset, with a Reanimated checkmark fallback if Lottie fails or
  Reduce Motion is enabled. Success/error haptics match the mutation outcome.
- Failed booking returns to DoctorDetails with the original date, sheet open, chosen slot cleared, and a visible
  conflict/retry message. The 409 test uses the mock control's `booking409` failure and asserts the slot is taken.
- My Bookings groups by upcoming/past and uses existing shared theme components for status, loading, empty, and
  error states. No new dependencies or backend were added.
  **Verified:** `npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand` (9 suites, 96 tests), and
  `npm run ios -- --simulator "iPhone 17 Pro Max" --no-packager` (build + launch). On iPhone 17 Pro Max with
  `failure=booking409` and `latency=3000`, confirmed pending success UI followed by rollback to the same date,
  sheet reopened, unavailable slot disabled, and exact conflict toast. Mock controls were restored to defaults.

## Phase 12 — Prescriptions list and today's adherence

**Prompt:** Implement the Prescriptions tab with today's adherence summary and progress ring, prescription cards
showing doctor, clinic, issued date, medicine count and Active/Completed status, plus loading, empty and retry states.
**Decisions:**

- The screen reads prescription data through `usePrescriptions` and the persisted dose log through
  `useDoseLogStore`; it does not import fixture data. Today's total includes only medicines whose course is active
  on the clinic-local date, and each scheduled timing counts as one dose.
- Course status checks the longest medicine duration against `issuedAt`, while an active course remains Active.
  The list sorts newest issue dates first and opens the typed PrescriptionDetails route on card press.
- The summary ring uses the already installed `react-native-svg`, and all screen styling uses theme tokens.
  No new dependencies were added. PrescriptionDetails remains for Phase 13.
  **Verified:** `npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand` (9 suites, 96 tests), and
  `npm run ios -- --simulator "iPhone 17 Pro Max" --no-packager` (built and launched on iPhone 17 Pro Max).

## Phase 13 — Prescription details and dose tracking

**Prompt:** Show prescription metadata and Day X of N, grouped medicine schedule with suggested times, mark-taken
controls with animation/haptic/Undo toast, persisted per-day dose state, historical-course read-only behavior,
missing/error/loading states, and a dose-key/toggle test.
**Decisions:**

- The detail screen reads the selected prescription using `usePrescription`; dose state remains in the persisted
  Zustand `useDoseLogStore`, keyed by clinic date, prescription, medicine, and timing. Existing Home NextDoseBar
  and Phase 12 adherence subscribe to this same store.
- A medicine can be marked only while its course is active today. That permits marking a later scheduled timing
  early by patient choice, while prescriptions outside their issued date + duration are read-only.
- Successful marks animate the check, trigger a light haptic, and show an Undo toast. Pressing a completed dose
  again also clears it. The screen groups medicines by the existing 8 AM / 2 PM / 9 PM timing constants.
- Added direct tests for dose-key dimensions and store toggle behavior; no dependency was added.
  **Verified:** `npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand` (10 suites, 98 tests), and
  `npm run ios -- --simulator "iPhone 17 Pro Max" --no-packager` (built and launched on iPhone 17 Pro Max).

## Phase 14 — Profile and Admin settings

**Prompt:** Build the Zepto-style Profile and Developer settings screens; expose runtime config and mock network
controls, local reset actions, a zod-backed live JSON editor, and a discreet long-press Home ETA entry point. Remove
the temporary component gallery and phase test buttons.
**Decisions:**

- Profile uses the fictional patient fixture and mock family/clinic summaries. Only bookings and prescriptions
  tiles navigate to implemented features; other rows and Family show a Coming soon toast without fake flows.
- Admin settings bind directly to persisted config/mock-control stores. Config selection triggers the existing
  query/re-theme path; latency and failures map to the mock server's supported values.
- The live editor starts from the active validated config. Envelope and dropped-section Zod issues are displayed
  with paths; Apply stays disabled until the current draft validates without dropped sections, then selects Custom.
- Added a mock-server helper to reset bookings/reserved slots without clearing the selected network controls.
  Dose reset uses the persisted dose-log store, and config clearing removes the last-good fallback then refetches.
- The ETA affordance opens Admin settings on long press. README documents the hidden entry point. Removed the
  temporary ComponentGallery and the leftover TEMP route button from ServiceList.
  **Verified:** `npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand` (10 suites, 98 tests), and
  `npm run ios -- --simulator "iPhone 17 Pro Max" --no-packager` (built and launched on iPhone 17 Pro Max).

## Phase 15 — Polish and submission preparation

**Prompt:** audit theme tokens, contrast, accessibility, safe areas, keyboard behavior, resilience states, dead code,
and docs; verify TypeScript, lint, Jest, iOS and Android. The user later clarified that local storage is too limited
for Android work and asked to defer Android until iOS changes are complete.
**Decisions and changes:**

- Audited screen/component styling for literal color values and numeric spacing/type values. No literal colors were
  found in those directories; replaced the remaining hard-coded Admin editor font size with the caption token.
  Zero-valued layout resets and absolute-position coordinates remain intentional.
- Kept the existing Normal/Diwali palette and theme contrast adjustment. Added keyboard avoidance to doctor search
  and the multiline config editor. Existing shared text and controls retain font scaling, labels, and minimum target
  sizing; largest OS font scale and Android hardware back still need device verification.
- Added resilience hook tests covering 3-second loading then success, config-only failure with fallback, all-fail
  behavior, and empty list responses across doctors, slots, bookings, and prescriptions. These validate data states;
  screen-by-screen screenshot review of skeleton/empty/error presentation remains in the checklist.
- Removed unused `i18next` and `react-i18next` package declarations/lock entries. No other dependencies were added.
- Updated README with setup, architecture, mock controls, folder rationale, cuts, APK instructions, screenshots table,
  and developer-reported time spent (under 24 hours; exact count not tracked). Added the screenshot matrix and demo
  script to `docs/CHECKLIST.md`.
- iOS simulator build and launch completed on iPhone 17 Pro Max. Home rendered in Diwali config. Android was not
  verified or built, per the user's storage constraint. A release build was started then interrupted before
  completion; no APK was produced.

  **Verified:** `npx tsc --noEmit` ✅, `npm run lint` ✅, `npm test` ✅ (11 suites, 102 tests), and
  `npm run ios -- --simulator "iPhone 17 Pro Max" --no-packager` ✅ (build + launch). Android release build:
  incomplete; no APK. Largest-font-scale and interactive screen-reader checks remain manual.

## Phase 16a — Hindi and Telugu localization

**Prompt:** Move UI copy into `src/i18n`, add Hindi (and Telugu if feasible) through i18next, provide a Profile
language switch, and persist the selected language.
**Decisions and changes:**

- Added pinned `i18next@26.5.6` and `react-i18next@17.1.3`; their declared peers accept this project's React 19 and
  TypeScript 6 versions. The translation resources are bundled, so switching languages does not make a request.
- Added English, Hindi, and Telugu dictionaries for screen copy, accessibility labels, navigation titles, loading,
  error and empty states, date/time labels, booking/dose feedback, and developer controls. Home copy that comes from
  the two bundled runtime configs is translated by matching known source strings. Unknown custom config copy remains
  unchanged so the live editor can still supply custom content.
- Added a persisted Zustand language store using AsyncStorage and included it in the startup hydration barrier to
  restore the chosen language before the app renders. Profile presents English, हिन्दी, and తెలుగు options.
- Localized dates/times and doctor specialties/language names. Doctor search now accepts the displayed Hindi/Telugu
  specialty and language terms as well as the fixture's English terms.
- Preserved config-derived theme colors and all other screen styling. No backend or platform-native dependency was
  added.

  **Verified:** `npx tsc --noEmit` ✅, `npm run lint` ✅, `npm run ios -- --simulator "iPhone 17 Pro Max"` ✅
  (iOS simulator build and launch; Home was visible in the accessibility tree). Jest was not run for this item.
  Android remains deferred under the user's storage constraint.

## Phase 16c — Config-driven dark appearance

**Prompt:** Add dark mode driven by an optional `theme.dark` config block.
**Decisions and changes:**

- Added an optional, fully validated dark palette to the config type and Zod schema. Bundled default, Normal, and
  Diwali configs each include a dark palette; custom configs may supply their own or omit it.
- The app follows the operating system color scheme. It uses `theme.dark` when available and retains the current
  light palette when the config has no dark block. Status bar styling follows the active palette.
- Profile exposes persisted System / Light / Dark preferences, so patients can keep the original light appearance
  even when their device is set to dark mode.
- Configured Home color and gradient bands are shaded toward the dark background in dark appearance. Existing
  light palettes and colors remain unchanged.
- No dependencies were added. Android verification remains deferred under the user's storage constraint.

  **Verified:** `npx tsc --noEmit` ✅, `npm run lint` ✅, and
  `npm run ios -- --simulator "iPhone 17 Pro Max"` ✅ (simulator build and launch). Jest was not run.

## App icon and display name

**Prompt:** Create a Tapza Care app icon using the existing theme, set the native app name, and include a separate
transparent Android notification icon.
**Decisions and changes:**

- Created a teal, cream, and amber medical cross / pulse mark with reusable SVG source and a standard-library Python
  renderer for native image sizes.
- Populated the iOS AppIcon asset catalog for iPhone, iPad, and App Store sizes. Added Android legacy density and
  adaptive launcher assets.
- Added a white-only transparent Android notification glyph and registered it as the Firebase default small icon.
  The app still has no notification library or notification feature installed.
- Changed the visible app name to “Tapza Care” on Android and iOS, including the iOS launch screen label. Native
  module and bundle identifiers remain unchanged.

  **Verified:** `python3 scripts/generate-app-icons.py` ✅; iOS asset catalog filenames and pixel dimensions ✅;
  Android XML resources parsed ✅; `ios/TapzaCare/Info.plist` lint ✅; Python generator syntax ✅. A generic iOS
  device build was attempted but exited 65 during ReactCodegen. The simulator build could not be completed because
  CoreSimulatorService became unavailable; a subsequent attempt also encountered a locked DerivedData build
  database while builds overlapped. The overlapping build was interrupted and exited 75. No successful native build
  or simulator launch verified the icon assets. Android Gradle build was not run due the user's storage constraint.
  Do not claim local notifications are implemented or that a successful native build consumed these assets.

## Config-driven Diwali launcher icon

**Prompt:** Use a festive launcher icon when the Diwali config is selected and the original Tapza Care icon otherwise.
**Decisions and changes:**

- Added a Diwali variant of the app mark using the app's Diwali palette, with a small diya flame detail. The icon
  generator now creates both variants for iOS and Android density sizes.
- On iOS, registered `AppIconDiwali` as an alternate asset catalog icon and added a small native bridge using
  `UIApplication.setAlternateIconName`. iOS displays its system alert when an app requests an alternate icon.
- On Android, added Normal and Diwali launcher activity aliases and a native module that enables the selected alias.
  The separate transparent notification glyph is unchanged.
- The persisted config variant drives launcher icon synchronization at app runtime. Normal and Custom select the
  original brand icon; Diwali selects the festive variant.
- Updated README icon documentation. No new dependency was added.

  **Verified:** `python3 scripts/generate-app-icons.py` ✅. Native build, simulator, and device verification were
  not run in this phase because the previous iOS build had a DerivedData database lock and the user previously
  deferred Android builds due storage constraints.

## Native splash screen branding

**Prompt:** Show the Tapza Care app icon on the native splash screen, using the static Diwali icon and matching background.
**Decisions and changes:**

- Replaced the splash artwork with the static red Diwali icon on a warm cream background in the iOS launch
  storyboard, Android launch window, Android 12+ system splash, and React Native hydration screen.
- Enlarged the splash artwork and styled the app name to match the Diwali palette; removed the React Native
  development label.
- The launcher icon still follows the selected config independently; splash artwork is deliberately static.

  **Verified:** `npx tsc --noEmit` ✅; storyboard and Android XML parse; launch icon assets exist; Xcode project file
  parses. iOS and Android builds were not run.

## Review pass — splash, icons and checks (Claude)
**Prompt:** audit the app against the PDF; the splash should follow Normal/Diwali like the launcher icon and look
better than a square icon.
**Findings and fixes:**
- iOS launch screen showed black with no artwork. Two bugs: the storyboard background colour had no `alpha`
  (defaults to transparent → black), and the image view's width/height constraints were declared on the parent
  without a second item, so the image drew at zero size. Verified with a recorded cold launch.
- A native launch screen cannot follow the saved config (it is shown before JavaScript and baked into the app).
  Decision: native splash is neutral (white + "Tapza Care"); Android 12+ drops the forced icon so the system
  shows the active launcher alias icon (Normal or Diwali); a new animated `BrandSplash` reads the saved variant
  and theme and shows a round mark with halo rings, tagline and festival greeting, then cross-fades into Home.
  Copy added in English, Hindi and Telugu.
- Removed a black flash between the native splash and React Native: the window and root view now use the same
  white as the launch screen (`SceneDelegate.swift`, `LAUNCH_COLORS`).
- Icon switching: iOS and Android modules now skip the change when the requested icon is already active (iOS
  otherwise shows its "icon changed" alert on every launch).
- Developer settings showed its title twice (native header + in-screen heading); removed the in-screen one.
- Lint error (unused import) fixed.
**Verified:** `tsc` ✅, `eslint` ✅, `jest --runInBand` 102/102 ✅; iOS simulator debug build ✅; recorded cold
launches show white native splash → Diwali splash (red mark, festival pill) and → Normal splash (green mark),
both cross-fading into Home. Android not built (deferred by the user to the next session).
