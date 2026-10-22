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
