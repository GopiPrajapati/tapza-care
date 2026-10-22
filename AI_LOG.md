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
