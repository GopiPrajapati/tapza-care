# Tapza Care

Tapza Care is a React Native patient app for a fictional clinic. It provides a config-driven, Zepto-inspired home screen, doctor search and appointment booking, prescriptions, dose tracking, and local developer controls. The backend is an in-process mock server; no production backend or account is required.

## Run locally

Requirements: Node 22.13 (see `.nvmrc`), JDK 17, Android SDK (compile SDK 37), Xcode and CocoaPods for iOS.

```sh
nvm use
npm install
npm start
```

In another terminal, launch a platform:

```sh
npm run ios
npm run android
```

For iOS, install pods first when needed (`cd ios && pod install`). TypeScript, lint, and Jest checks:

```sh
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

## APK download and install

When published, download the APK from the repository’s GitHub **Releases** page. On Android, allow installation from the browser or file manager that opened the downloaded APK, then open the APK and follow Android’s install prompt. You can also install a locally built release from the project root:

```sh
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

The current submission APK has not been built. The path above is where `cd android && ./gradlew assembleRelease` writes it.

## Screenshots and demo

The requested screenshots and a 2–3 minute demo recording are not captured yet. Use [docs/CHECKLIST.md](docs/CHECKLIST.md) for the Normal/Diwali screenshot matrix, resilience states, and recording script.

| Screen                   | Normal     | Diwali     |
| ------------------------ | ---------- | ---------- |
| Home                     | To capture | To capture |
| Doctor list              | To capture | To capture |
| Doctor details and slots | To capture | To capture |
| Booking success          | To capture | To capture |
| My bookings              | To capture | To capture |
| Prescriptions            | To capture | To capture |
| Prescription details     | To capture | To capture |
| Profile                  | To capture | To capture |
| Developer settings       | To capture | To capture |

## Folder structure and why

```text
src/
  assets/          Bundled config, local images, and animation assets
  commonutils/     Theme tokens, typography, dates, money, and app constants
  components/      Reusable accessible, themed UI and state components
  container/       Providers, typed navigation, tabs, and query client
  hooks/           Screen-facing query and app-state hooks
  i18n/            Bundled English, Hindi, and Telugu UI translations
  networking/
    api/           Request boundary and endpoint/error definitions
    repositories/  Typed data access; screens do not call the mock server directly
    types/         Domain types and Zod config validation
    mockData/      Fixtures, slot generation, and in-process mock server
  screens/         Feature screens; each owns its screen-specific UI
  store/           Persisted config, mock controls, language, and dose log
__tests__/         Jest tests for domain logic, data behavior, and key interactions
docs/              Phase prompts, progress handoff, and submission checklist
```

## Architecture

- **Config and theme:** mock `GET /config` → Zod `parseConfig` → validated layout and `buildTheme` → live themed screens. The app falls back from network to cached config and then bundled config. Normal and Diwali config variants are included.
- **Screen data:** screen → TanStack Query hook → repository → `apiClient` → in-process `mockServer`. The request boundary is isolated so a real API could replace the mock later; adding a backend is outside this assignment.
- **Booking:** `useCreateBooking` inserts a pending booking and marks the slot unavailable in the query cache immediately. The mock POST reconciles it to confirmed, or rolls it back on failure. A 409 keeps the slot unavailable and returns the patient to choose another time.
- **Dose tracking:** a persisted Zustand store keys each mark by clinic-local date, prescription, medicine, and timing. The prescription summary and Home next-dose bar read the same state.
- **Motion and accessibility:** Reanimated handles Home scroll motion and selection feedback. Theme colors are adjusted for contrast, text uses OS font scaling, and controls use accessible labels and minimum touch sizes.
- **Languages:** i18next uses bundled English, Hindi, and Telugu resources, so translations work without a network. Choose a language in Profile; the selection is stored on device and restored at startup. Known copy from the bundled Home configs is translated, while custom config text stays as authored.
- **Appearance:** choose System, Light, or Dark in Profile. The preference is stored on device. System follows the OS; Dark uses the active config's optional, Zod-validated `theme.dark` palette when present; Light preserves the original palette. Configured Home bands adapt to the selected palette.

## Mock backend and developer controls

The app includes fictional doctors, clinics, prescriptions, deterministic appointment slots, and mock bookings. Open **Profile → Developer settings** to switch Normal, Diwali, or Custom config; set latency to 0, 800 ms, or 3 seconds; and set failures to None, Config fails, All fail, Force 409, or Empty lists. The JSON editor validates the active config before applying Custom. The local data actions clear cached config, dose marks, or bookings.

There is also a discreet shortcut: long-press the **Clinic visit in 20 min** Home header/ETA to open Developer settings. These controls are for local demos and QA. Mock bookings are held in memory and clear when the app process restarts.

## What was cut

- Production authentication, backend services, and payment processing: the assignment specifies mock data and no backend.
- Notification preferences, family management, and saved-clinic flows: the UI shows Coming soon rather than suggesting those actions work.
- A full Service List, prescription refill flow, offline booking queue, and Android release APK: outside the implemented core flow or deferred to final device/storage availability.
- Local notifications: not implemented; they were not part of the selected Phase 16 item.

## Time spent

**Under 24 hours**, as estimated by the developer; an exact hour count was not tracked.

## AI usage

See [AI_LOG.md](AI_LOG.md) for phase-by-phase prompts, implementation decisions, and verification notes.
