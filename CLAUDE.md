# Tapza Care — project memory

Patient app for Tapza Clinic (prescriptions, reminders, bookings, Zepto-style ordering of clinic services).
Source of truth: `Tapza Care — React Native Assignment.pdf` (48-hour take-home). Everything below is from it unless marked **[ours]**.

Audience: Indian patients and families on mid-range Android phones, many older, many prefer Hindi or Telugu.
Judged on: UI/UX feel, speed with understanding (must explain every file live), detail (animations, spacing,
designed loading/empty states), clean structure, strict TS, no hard-coded colours.
"A polished three-screen app beats an unfinished six-screen one." Say what we cut.

## Stack [ours]
- React Native CLI 0.88, New Architecture on, TypeScript strict (`@react-native/typescript-config`). Node >= 22.11 (`nvm use 22.13.0`).
- React Navigation (native-stack + bottom-tabs), Reanimated + Gesture Handler, `@gorhom/bottom-sheet`.
- TanStack Query (server data, optimistic mutations), Zustand + AsyncStorage (app state, persisted).
- zod (config validation), react-native-linear-gradient, lottie-react-native (success).
- Jest + React Native Testing Library.
- Babel: `@babel/plugin-transform-export-namespace-from` (needed for zod 4 in Metro) + worklets plugin (last).
- After changing `babel.config.js`, restart Metro with `--reset-cache`.

## Folder structure (mandatory) [ours]
Use `.ts`/`.tsx` everywhere.
```
src/
  App.tsx                      (root component; /App.tsx at repo root just re-exports it)
  assets/
    fonts/
    images/{logo,home,doctors,services,empty-states}/
    animations/                (Lottie JSON only)
  commonutils/
    constants.ts               (app constants, query keys, storage keys)
    dimensions.ts              (screen size helpers, hit-slop, min tap target 44)
    helpers.ts                 (date/₹ formatting, id helpers)
    theme.ts                   (buildTheme(config.theme) → tokens; ThemeProvider; useTheme)
    typography.ts              (type scale; respects OS font scaling)
  components/                  (shared UI, one folder per component, index.tsx + styles inside)
    Button/ Input/ Header/ ScreenContainer/ Loading/ EmptyState/ ErrorState/ BottomSheet/
    (later: AppText/ Card/ Chip/ Badge/ PriceText/ Avatar/ SectionHeader/ Skeleton/ Toast/ StaleConfigBanner/ FloatingBar/)
  container/
    RootNavigator.tsx          (root native stack)
    TabNavigator.tsx           (bottom tabs built from config.tabs)
    Routes.ts                  (route name constants + typed param lists)
    AppProviders.tsx           (GestureHandlerRootView, SafeArea, QueryClient, Theme, BottomSheetModalProvider)
  screens/                     (one folder per screen: index.tsx + components/ for screen-only pieces)
    HomeScreen/                (sections/ subfolder holds the 6 section renderers + registry)
    DoctorListScreen/
    DoctorDetailsScreen/       (doctor summary + date strip + slot bottom sheet + confirm bar)
    ServiceListScreen/         (only if time: full list behind service_grid "See all")
    BookingSuccessScreen/      (modal)
    MyBookingsScreen/
    PrescriptionsScreen/
    PrescriptionDetailsScreen/
    ProfileScreen/
    AdminSettingsScreen/       (config switch, latency/failure toggles, cache reset, live config editor)
  hooks/                       (TanStack Query hooks + small UI hooks)
  networking/
    api/                       (client.ts get/post by path, endpoints.ts, errors.ts)
    repositories/              (configRepository, doctorRepository, slotRepository, bookingRepository, prescriptionRepository)
    types/                     (domain types from the PDF + zod schemas)
    mockData/                  (JSON fixtures + mockServer.ts router, latency/failure controls)
  store/                       (Zustand stores, persisted to AsyncStorage; replaces redux/)
  i18n/                        (en + hi strings; added in bonus phase)
__tests__/                     (jest tests)
docs/                          (screenshots, demo video)
```

## Screen inventory (exactly this) [ours]
Screens are exactly the folders under `src/screens/` above. Do not add others.
Cut, and why:
- `BookingDateTimeScreen`, `BookingConfirmationScreen` → merged into `DoctorDetailsScreen` (date strip + slot bottom
  sheet + sticky confirm bar). The PDF puts slot picking in a bottom sheet.
- `ServiceDetailsScreen` → a service tap goes straight to its doctor's booking (`DoctorDetails` with `serviceId`).
- `BookingDetailsScreen` → the bookings list card shows everything needed.

Tabs come from `config.tabs`; `screen` is only `home | bookings | prescriptions | profile`.

## Dependency rule [ours]
- `package.json` versions are pinned exactly: no `^` or `~`, for dependencies and devDependencies.
- No new dependency without asking.

## Data rule [ours]
- Screens and components never import mock JSON.
- Flow: screen → hook → repository → api client → mockServer.

## Visual reference [ours]
Zepto screenshots/video. Copy:
- Coloured top band with rounded bottom corners.
- Collapsing ETA + address header; sticky search bar with a pill on the right.
- 3-column tiles inside the band.
- Section headers with a dashed rule; ₹ badges; full-width "See All" button.
- Floating bar above the tabs ("Next dose …").
- Sticky bottom action bar ("Consultation ₹600 | Confirm booking").
- Profile layout: header card, 3 tiles, grouped rows with chevrons, app version at the bottom.
Calmer than Zepto for older patients: larger text, generous spacing, high contrast.

## Images [ours]
- Bundled local assets resolved by key via an asset resolver, with a drawn (SVG) or initials fallback.
- No remote image URLs required for the app to look complete.

## Functional requirements

### 1. Home — config-driven, Zepto-style
- Fetch `GET /config` and render what it describes: theme colours, tabs, ordered sections.
- Every section has its own `background` (`color` | `gradient` | `image`), so home reads as distinct bands.
- Sections animate in as they enter the viewport. Header shrinks/changes on scroll (collapse address/ETA, sticky
  search, header colour follows band beneath) [ours: Zepto details]. Hero has parallax. "Back to top" pill [ours].
- Section types (all six required):
  - `hero_banner` — full-width image or gradient, greeting (+ festival greeting), parallax.
  - `category_chips` — horizontal chips (Consult, Lab tests, Pharmacy, Vaccines…).
  - `quick_actions` — icon tiles: Book, Prescriptions, Reminders, Family.
  - `service_grid` — 2 or 3 columns; image, name, ₹ price, optional badge.
  - `doctor_carousel` — horizontal cards: photo, specialty, next available slot.
  - `offer_strip` — thin coloured band with a message.
- Two configs: normal day + festival (Diwali). Runtime switch. Switching changes colours, banner, section ORDER
  and items with no code change.
- Unknown section type → renders nothing, never crashes. Invalid section → dropped with dev warning [ours].
- Tabs come from `config.tabs`; `screen` is only `home | bookings | prescriptions | profile`. Doctor list is a stack screen.

### 2. Booking flow
- From a doctor or a service: pick date → pick slot in a **gesture-driven bottom sheet** → confirm → success animation.
- Loading, empty and error states.
- Confirm feels instant: optimistic update, then reconcile with mock. On `409` (slot taken) or failure: roll back,
  mark slot taken, return user to the sheet with a clear message, keep their date [ours]. No double submit.

### 3. Prescriptions and reminders
- List prescriptions → open one → medicines as morning / afternoon / night schedule → mark a dose taken (+ undo [ours]).
- Dose log keyed by date + medicineId + timing, persisted [ours].

### 4. Resilience and states
- Mock has a switch for latency and failure (latency 0 / 800ms / 3s; failure none / config fails / all fail /
  force 409 / empty lists) [ours: values].
- Slow network, failed config fetch, empty list must all leave the app usable.
- Cache the last good config (AsyncStorage). Fallback order: fresh → cached (show "showing saved layout") → bundled default.
- Skeleton loaders match the shape of real content.

## Mock backend — exact endpoints and shapes
```
GET  /config                               → LayoutConfig
GET  /doctors                              → Doctor[]
GET  /slots?doctorId=&date=YYYY-MM-DD      → Slot[]
POST /bookings {doctorId, slotId}          → Booking (201) · 409 if slot taken
GET  /prescriptions                        → Prescription[]

LayoutConfig = {
  version: number
  theme: { primary, secondary, background, surface, textPrimary, textSecondary, accent: string,
           festival?: { name, greeting, bannerImageUrl: string } }
  tabs: { id, label, icon, screen: 'home'|'bookings'|'prescriptions'|'profile' }[]
  sections: { id: string, type: string,
              background: { kind: 'color'|'gradient'|'image', value: string },
              title?: string, items: unknown[] }[]   // unknown type → skip
}
Doctor       = { id, name, specialty, photoUrl, feeInr, languages: string[] }
Slot         = { id, doctorId, startsAt, endsAt, available: boolean }
Prescription = { id, issuedAt, doctorName, clinicName,
                 medicines: { id, name, dose, days, timing: ('morning'|'afternoon'|'night')[] }[] }
```
- The api client exposes get/post by path so it can be swapped for `fetch` with no screen changes [ours].
- Content: realistic Indian names, a Hyderabad or Vijayawada clinic, prices in ₹. No Bengaluru, no hard-coded dates
  (slots generated relative to today).

## Tech rules
- TypeScript strict. No `any` without a comment explaining why.
- Colours, spacing, radii and type sizes come from a theme built from `config.theme`. Nothing hard-coded in components.
- Animations on the UI thread (Reanimated); smooth on mid-range Android. Lists must not stutter
  (virtualised, memoised sections, stable keys, no JS-thread scroll handlers).
- Accessibility: respect OS font scaling, tap targets ≥ 44pt, readable contrast in both themes, accessibility labels.
- Tests (required): config validation, one section renderer, booking state.

## Bonus (only if time, in this order) [ours: order]
Hindi/Telugu via i18n · local notifications for reminders · haptics · dark mode from config · in-app admin config
editor · deep links to doctor/prescription · Lottie success · shared-element transition · offline booking queue ·
Detox/Maestro e2e.

## Deliverables
- GitHub repo with meaningful commit history across the 48 hours (user commits after each phase).
- README: how to run, folder structure and why, architecture decisions, what was cut and why, honest time spent,
  APK download + install steps.
- `/docs`: screenshots + 2–3 min demo video (both themes, booking with forced failure, reminders; real Android device if possible).
- APK attached to a GitHub Release.
- `AI_LOG.md`: prompts that shaped the code and what was rejected.

## Engineering rules for Claude [ours]
- TypeScript only. Mock data only, no real network.
- Never run git commands (no commit, branch, push, reset). The user handles git.
- One phase per prompt, then stop.
- Every phase report lists: files changed, checks actually run (with result), and a suggested commit message.
- Never claim a check passed without running it. If something was skipped, say so.
- Append each phase prompt and anything rejected to `AI_LOG.md`.
- Ask before scaffolding anything new or adding a dependency not listed in Stack.
