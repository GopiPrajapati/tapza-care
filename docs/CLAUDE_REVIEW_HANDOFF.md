# Tapza Care — Complete Claude Review Handoff

This is the current handoff for a full implementation and UI review. Give Claude this file with the repository. Ask it to inspect and verify the real implementation, improve concrete UI issues, and add assignment-required functionality that is genuinely missing. Do not rely on this summary instead of reviewing the source.

## Request to Claude

Please audit Tapza Care against the original assignment, the agreed product direction, and the implementation in this repository. Inspect every screen and important flow. Improve visual quality where a specific issue is visible, and implement missing functionality when it is required by the assignment or an already approved phase. Keep working through the audit until it is complete, then report exactly what changed and what was actually run.

Before editing:

1. Read `CLAUDE.md`, the assignment PDF at `/Users/gopiprajapati/Documents/Tapza Care — React Native Assignment.pdf`, `README.md`, `AI_LOG.md`, `docs/PROGRESS.md`, `docs/CHECKLIST.md`, and `docs/phase-prompts.md`.
2. Treat the PDF as assignment requirements and the user's notes below as product/workflow preferences. Do not present a user preference as a PDF requirement.
3. Inspect the current code and app state. Some claims in older progress notes predate icon and splash work; this handoff calls out the latest known status and limitations.
4. Review all screens, navigation, accessibility, loading/empty/error states, Normal/Diwali config, Light/Dark appearance, localization, and booking/dose flows.
5. Fix confirmed defects directly. Do not add speculative features, backend services, payments, accounts, or libraries. Do not ask before making routine, reversible code fixes. Ask before adding a dependency or requiring an external service.

At the end, report: files changed, user-visible behavior changed, checks actually run and results, native/device checks that remain unverified, and a suggested commit message. Do not run Git commands or mutate branches; the user owns Git workflow.

## Product, assignment, and user preferences

### Assignment context

- React Native app implemented in strict TypeScript.
- Mock data and an in-process mock server; no production backend is required or expected.
- Config-driven UI/theme/tabs/sections, resilient data states, booking and prescription flows, accessibility, and meaningful tests are part of the assignment.
- The assignment did not provide a Figma design. The implemented visual system was developed from the user's examples.
- The patient audience is Indian patients and families, including older patients and Hindi/Telugu speakers.

### User's product preferences

- Preserve the approved Figma-inspired color combination and established design. Do not recolor existing Normal or Diwali palettes unless the user explicitly asks. Dark appearance is an additional config palette; it must not overwrite Light colors.
- Keep the fast, polished Zepto/Blinkit-inspired layout and interaction feel, especially on Home, while retaining a calm healthcare tone.
- Use local mock controls/config for runtime changes. Do not add a real backend.
- Keep branch/commit/push/merge operations for the user. Do not run Git mutations.
- The user supplied the honest time-spent answer **under 24 hours**; an exact hour count was not provided. Do not invent one.
- Android builds/device checks have been deferred because the user reported insufficient local storage. Do not start a large Android build without checking with the user first.

## Project stack and architecture

- React Native CLI 0.88, New Architecture, React 19.3, strict TypeScript 6, Node 22.13.
- React Navigation native stack and bottom tabs; Reanimated + Gesture Handler; `@gorhom/bottom-sheet`.
- TanStack Query for server state and optimistic booking; Zustand + AsyncStorage for persisted app choices/dose logs.
- Zod validates runtime config; `i18next`/`react-i18next` provide English, Hindi, and Telugu.
- Jest + React Native Testing Library.
- Exact dependency versions are pinned. Do not add dependencies without asking.
- Main flow: `config/mock API → Zod validation → cached/bundled fallback → theme and config-driven navigation`; feature flow: `screen → hook → repository → apiClient → in-process mockServer`.
- No screen should import fixture JSON or bypass its hook/repository layer.

### Important source locations

```text
src/
  App.tsx                         App root
  assets/config/defaultConfig.json bundled config fallback
  commonutils/                    theme, dates/INR, dimensions, app icon sync
  components/                     themed shared UI components
  container/                      AppProviders, StartupSplash, navigation, query client
  hooks/                          TanStack Query and feature hooks
  i18n/                           English, Hindi, Telugu resources and setup
  networking/api/                 API boundary, endpoints, errors
  networking/repositories/        config, doctors, slots, bookings, prescriptions
  networking/mockData/            Normal/Diwali fixtures, generated slots, mock controls
  networking/types/               domain types and Zod config schema
  screens/                        app screens listed below
  store/                          persisted config, appearance, language, dose, mock controls
__tests__/                         unit, hook, navigation, config and state tests
android/                           Android manifest, resources and Kotlin icon bridge
ios/TapzaCare/                     iOS assets, launch storyboard and native icon bridge
assets/branding/                   SVG and PNG app-icon sources
scripts/generate-app-icons.py      stdlib-only native icon raster generator
docs/                              progress, checklist, phase prompts and handoff
```

## Implemented screens and features

The current screen folders are:

- `HomeScreen`: config-driven Zepto-style home, six configurable section types, collapsing header, search, parallax/entry motion, back-to-top, next-dose bar.
- `DoctorListScreen`: search, specialty filters, doctor cards, next slot and loading/empty/error/no-results states.
- `DoctorDetailsScreen`: doctor/service summary, seven-day date strip, bottom-sheet slot picker grouped by time, unavailable slots, selection state and sticky confirm bar.
- `BookingSuccessScreen`: success modal, doctor/time/clinic/fee/status, routes to bookings or Home.
- `MyBookingsScreen`: upcoming/past segmented list, pending/confirmed status and loading/empty/error states.
- `PrescriptionsScreen`: adherence summary and prescription list with loading/empty/error states.
- `PrescriptionDetailsScreen`: medicine schedule, mark taken/undo, persisted dose log and shared adherence state on Home.
- `ServiceListScreen`: service listing navigation; verify it against the assignment and ensure it has correct query states.
- `ProfileScreen`: mock patient header, bookings/prescriptions/family tiles, grouped rows, language and appearance controls, developer settings; unavailable actions use “Coming soon” rather than fake flows.
- `AdminSettingsScreen`: Normal/Diwali/Custom config controls, latency/failure/empty controls, cache/data resets and Zod-validated live config editor. Home has the long-press logo/ETA shortcut.

### Data behavior and controls

- Config loads from the mock server, validates with Zod, falls back to the last good cached config, then to bundled default config.
- Normal and Diwali have distinct theme/content; config controls tabs, home section order/content, colors and festival messaging. Custom JSON can be validated/applied.
- Mock latency: 0 / 800 ms / 3 s. Failure controls: none / config fails / all fail / force booking 409 / empty lists.
- Booking uses optimistic insertion as pending, reconciles to confirmed, blocks double-submit, and rolls back on error. A 409 marks the slot unavailable and returns the patient to the same date/slot-selection flow.
- Dose log persists using date + prescription + medicine + timing keys. Undo updates the shared summary state.
- Language options persist English/Hindi/Telugu. Appearance options persist System/Light/Dark; Dark uses `theme.dark` when present and Light retains the original palette.

### Phase history

- **Phases 0–8:** project rules/foundation, navigation, config schema/mock data, stores/query hooks/theme, shared components, config-driven Home sections and Home motion.
- **Phase 9:** doctor list/search/filters.
- **Phase 10:** doctor details/date/slot selection.
- **Phase 11:** booking confirmation, optimistic flow, success and bookings list, 409 handling.
- **Phases 12–13:** prescriptions, adherence and dose tracking.
- **Phase 14:** Profile and Admin settings/config editor.
- **Phase 15:** visual/accessibility/resilience audit and submission docs/checklist/demo script.
- **Phase 16a:** Hindi/Telugu localization and persisted language selection.
- **Phase 16c:** config-driven dark appearance with System/Light/Dark preference.
- **Branding follow-up:** custom green Tapza Care launcher icon, red Diwali icon, display name, transparent Android notification glyph, dynamic launcher selection code, and native splash branding.

### Phase 16 items not implemented

The user selected only Hindi/Telugu localization and config-driven dark appearance from the Phase 16 options. These other optional features are not implemented and must not be reported as present: local notifications/reminders, deep links, shared-element transitions, offline booking queue, and Maestro E2E flow. A transparent Android notification icon resource exists, but there is no notification library or working notification feature.

## Launcher icons and splash screens — read carefully

- The green icon is the default Normal/Custom launcher icon. The red Diwali icon is the Diwali launcher icon.
- Launcher switching is wired to the persisted config variant: iOS uses `UIApplication.setAlternateIconName`; Android uses Normal/Diwali launcher activity aliases. The user reported that switching was not appearing in the installed app. The native icon changes were **not successfully built/reinstalled or verified**, so treat launcher switching as unresolved until tested on a fresh native build. Metro reload alone cannot add these native changes to an already installed binary.
- The user's latest explicit splash request supersedes the earlier dynamic splash request: the splash is now **static Diwali red on a warm cream background**, regardless of selected config. The Normal/Custom/Diwali launcher icon logic remains separate.
- iOS native launch storyboard, Android launch window/Android 12+ splash, and the React Native hydration screen all use the red Diwali artwork. Native launch assets are static and appear before the persisted JavaScript config is available.
- The notification icon remains a separate white glyph on a transparent background at `@drawable/ic_notification`, registered as the Firebase default notification icon. This registration does not mean notifications are implemented.
- Branding source: `assets/branding/tapza-care-app-icon.svg`, `assets/branding/tapza-care-app-icon.png`, and `assets/branding/tapza-care-app-icon-diwali.png`. Run `python3 scripts/generate-app-icons.py` to regenerate raster sizes and platform assets.

## Verification status and known gaps

### Checks known to have run

- `npx tsc --noEmit` passed after the latest static splash changes.
- Latest splash storyboard/Android resource XML parsed; the iOS Xcode project file parsed with `plutil`; splash image assets exist.
- `npm run lint` passed during Phase 16c, but was **not rerun** after later icon/splash edits.
- `npm test` last passed in Phase 15: 11 suites / 102 tests. It was **not rerun** after Phase 16 or icon/splash changes.
- The last successful iOS simulator build/launch occurred during Phase 16c, **before** the later native launcher and splash changes. Do not claim the current native icon/splash changes have been built or launched.
- A later native iOS build attempt exited 65 during ReactCodegen; another attempt encountered a locked Xcode DerivedData database when builds overlapped and was interrupted (exit 75). No successful build of the icon/splash work is recorded.
- No Android Gradle build, device, or emulator verification has been completed. No APK has been confirmed.

### Remaining audit work

- Review and test all current screens and data states; older tests do not verify the newest changes.
- Rerun TypeScript, lint, and Jest against current sources. Use the project’s normal Jest command and report results, not assumptions.
- Verify launcher icon behavior after a native rebuild/reinstall on iOS and, when storage allows, Android. Inspect Android alias enable/disable behavior and confirm exactly one launcher entry is visible.
- Visually inspect splash layout on both platforms, especially icon scale, cream background, app-name alignment and transition into Home.
- Verify Android navigation/hardware back, Home motion and booking if/when the user allows Android build/device work.
- Review maximum OS font scale, screen-reader labels/focus, safe areas, keyboard handling, contrast, touch targets, loading skeletons, empty states and errors.
- `docs/CHECKLIST.md` contains a screenshot matrix and a 2–3 minute demo script; screenshots and video still need to be captured.
- Bookings currently live in mock-server memory and do not survive app restart. Keep that limitation honest in the README.
- Confirm README’s APK/install instructions are clearly marked pending until an APK is actually produced and shared.

## Claude's editing guardrails

- Preserve Normal/Diwali colors and established layout except where the user explicitly requested a change. The static red Diwali splash and its cream background are explicitly requested.
- TypeScript-only app code; no production backend; no real authentication/payment; no new dependency without asking.
- Keep screens on the hook → repository → API client → mock server path.
- Respect font scaling, contrast, 44pt/44dp touch targets, safe areas and accessibility labels.
- Follow `CLAUDE.md` and append material implementation/review work to `AI_LOG.md`; update this handoff, `docs/PROGRESS.md`, README and checklist if claims/status change.
- Do not run Git commands. The user handles branch, commit, push and merge.
- Android builds are deferred due to the user's storage constraint. Ask before a large Android build/device run.
- Report only checks actually completed. A source/resource parse is not a native build, and an icon asset existing is not proof that the installed app changes its icon.

## Useful commands

From repository root, using Node 22.13 from `.nvmrc`:

```sh
nvm use 22.13.0
npx tsc --noEmit
npm run lint
npm test -- --runInBand
npm run ios -- --simulator "iPhone 17 Pro Max"
```

Do not run Android release/device commands until the user confirms storage and device-build constraints are clear.

## Expected close-out

Summarize the specific UI/functionality issues found, what was fixed, files changed, checks that actually ran, and unresolved device/native verification. Provide a suggested commit message. Do not stage, commit, push, merge, or create branches.
