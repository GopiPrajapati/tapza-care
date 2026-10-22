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
