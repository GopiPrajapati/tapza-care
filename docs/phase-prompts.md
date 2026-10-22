# Tapza Care — remaining phase prompts (9–16)

Phases 0–8 are done (see AI_LOG.md). Paste one phase at a time. Testing is iOS-only until ~80–90% done.

---

## Phase 9 — DoctorListScreen (branch: feat/doctor-list)

```
Phase 9. DoctorListScreen only.
- Opened from: "See all" on the carousel, Book quick action, Consult chip (pre-selects a specialty filter via route param), and the Home search bar / Book pill (search input auto-focused when opened from search).
- Header with back + SearchBar (debounced, matches name/specialty/language), horizontal specialty Chips (All + specialties derived from data).
- Doctor cards: photo/initials, name, specialty, languages, ₹ fee, next available slot, "Book" button → DoctorDetails.
- States: skeleton list matching card shape, empty (no doctors), no search results (with "Clear filters"), error + Retry, works under 3s latency.
- Memoised FlatList rows, stable keys.
Run tsc + lint + jest + launch on iOS. Stop.
```

## Phase 10 — DoctorDetailsScreen: date strip + slot bottom sheet (branch: feat/booking-flow)

```
Phase 10. DoctorDetailsScreen: selection UI only, no confirm logic yet.
- Doctor summary card (photo/initials, name, specialty, languages, clinic name + area, ₹ fee). If opened with serviceId, show the selected service and its ₹ price.
- Horizontal date strip: next 7 days from today (Today, Tomorrow, then weekday + date), selected state animated.
- Slot picking in a gesture-driven @gorhom bottom sheet (snap points ~45% / 90%, pan-down to close, backdrop): slots grouped Morning / Afternoon / Evening, unavailable slots visibly disabled and not pressable, selected slot highlighted. Opens automatically after picking a date and with a "Choose time" button.
- Selection (date + slot) survives closing and reopening the sheet and changing tabs; changing the date clears the slot.
- StickyActionBar (Zepto "To Pay | Pay Now" style): "Consultation ₹600 · Thu 23 Oct, 4:30 PM" + "Confirm booking" (disabled until a slot is selected). Confirm does nothing yet.
- Fix the known StickyActionBar issue from Phase 6 (background-coloured strip under the bar on stack screens) and give Toast a bottom offset so it never covers the bar.
- States: skeleton for doctor + slots, empty day ("No slots on this day, try tomorrow" + jump to the next day with slots), error + Retry inside the sheet, missing doctor id → EmptyState with back.
Run tsc + lint + jest + launch on iOS. Stop.
```

## Phase 11 — Optimistic confirm, success, MyBookings (same branch: feat/booking-flow)

```
Phase 11. Booking confirmation and bookings list.
- Confirm uses useCreateBooking: booking appears instantly (pending) and we navigate to BookingSuccess immediately; POST /bookings reconciles in the background.
- BookingSuccessScreen (modal): Lottie success animation from assets/animations/booking-success.json (create a small lightweight one or a Reanimated checkmark fallback if Lottie fails), doctor, date/time, clinic, fee, status chip that moves pending → confirmed live. Buttons: "View my bookings" and "Back to home". Haptic success on confirm.
- On 409 or failure while on success/details: roll back, mark the slot taken in the cache, close the success modal, return to DoctorDetails with the same date selected, the sheet open, and a clear message ("That slot was just taken. Please pick another time."). Error haptic.
- Prevent double submit (button disabled + mutation guard). Back from success never creates a second booking.
- MyBookingsScreen (Bookings tab): Upcoming / Past segmented control, cards with status (pending/confirmed), doctor, date/time, ₹; skeleton, empty ("No bookings yet" + "Book a doctor"), error + Retry.
- Tests: __tests__/bookingState.test.ts: optimistic insert, success reconcile to confirmed, 409 rollback removes the booking and marks the slot unavailable. Use forced booking409 from mock controls.
Run tsc + lint + jest + iOS with failure=booking409 and latency 3s. Stop.
```

## Phase 12 — PrescriptionsScreen (branch: feat/prescriptions)

```
Phase 12. PrescriptionsScreen (tab) only.
- Today's adherence summary card at the top (e.g. "3 of 5 doses taken today", progress ring).
- Prescription cards: doctor name, clinic, issued date, medicine count, "Active/Completed" from days + issuedAt. Tap → PrescriptionDetails.
- Skeleton matching cards, empty ("No prescriptions yet. Your doctor's prescriptions will appear here after a visit."), error + Retry.
Run tsc + lint + jest + launch on iOS. Stop.
```

## Phase 13 — PrescriptionDetails and dose tracking (same branch: feat/prescriptions)

```
Phase 13. PrescriptionDetailsScreen and dose tracking.
- Header with doctor, clinic, issued date, "Day X of N".
- Schedule grouped Morning / Afternoon / Night (with suggested times 8 AM / 2 PM / 9 PM and icons); each medicine row shows name, dose, and a "Mark taken" control.
- Mark taken: animated check, light haptic, Toast with Undo; persisted in useDoseLogStore keyed by date + prescriptionId + medicineId + timing. Same state on PrescriptionsScreen summary and Home FloatingBar.
- Doses for future timings today can be marked (patient's choice) but past days are read-only.
- Missing id → EmptyState + back; error + Retry; skeleton.
- Add a test for the dose log key/toggle logic. Run tsc + lint + jest + iOS. Stop.
```

## Phase 14 — Profile + AdminSettings (branch: feat/profile-admin)

```
Phase 14. ProfileScreen + AdminSettingsScreen.
Profile (Zepto profile layout): header card with avatar, mock patient name + phone, 3 tiles (My bookings, Prescriptions, Family), grouped ListRows: Family members (mock list), Saved clinics, Language (placeholder until i18n), Notifications, Help & support, Developer settings → AdminSettings. App version at the bottom. Rows without a real feature show a "Coming soon" toast; no fake flows.
AdminSettings:
- Config: Normal / Diwali / Custom segmented control (live re-theme).
- Mock network: latency 0 / 800ms / 3s; failure none / config fails / all fail / force 409 / empty lists.
- Clear cached config; reset dose log; reset bookings.
- Live config editor (bonus): multiline JSON editor prefilled with the active config → "Validate" runs zod and lists errors with paths → "Apply" sets custom variant.
- Remove the temporary component gallery and every TEMP(Phase 3/5) button from earlier phases.
Discreet entry point: long-press the Home header logo/ETA opens AdminSettings (mention it in README).
Run tsc + lint + jest + iOS. Stop.
```

## Phase 15 — Polish, checks, submission files (branch: chore/polish-and-docs)

```
Phase 15. Polish and submission prep. No new features.
Audit against CLAUDE.md and fix:
- grep for hard-coded colours (#, rgb), numbers used as spacing/font sizes in components/screens; move them to the theme.
- Contrast in both configs; OS font scale at max on Home, DoctorDetails, Prescriptions; ≥44pt targets; accessibility labels; Android back everywhere; safe areas; keyboard handling on search and the config editor.
- Every list: loading skeleton, empty, error tested with mock controls (latency 3s, config fails, all fail, empty).
- Dead code, unused deps/imports, any `any`.
- Now test on Android too (emulator or device): navigation, hardware back, home animations, booking flow.
Run and report only what actually ran: npx tsc --noEmit, npm run lint, npm test, Android release build (`cd android && ./gradlew assembleRelease`) and where the APK is.
Docs:
- README: how to run, APK download + install steps, folder structure and why, architecture (config → zod → theme; screen → hook → repository → api → mockServer; optimistic booking), mock controls and the AdminSettings entry, what was cut and why, honest time spent (ask me for numbers), screenshots table.
- AI_LOG.md complete.
- docs/CHECKLIST.md: screenshots to take (both themes for every screen, skeletons, error, empty) and a 2–3 min demo video script: normal → switch to Diwali → book with forced 409 → retry → success → mark a dose → slow network + failed config showing cached layout.
Stop.
```

## Phase 16 — Bonus, only if time (one item per prompt; branch: feat/<item>)

```
Phase 16. Bonus, one item per prompt, stop after each:
a) Hindi (and Telugu if time) via i18next: move all UI strings to src/i18n, language switch in Profile, persisted.
b) Local notifications for dose reminders (ask me before adding a notification library; check RN 0.88 support).
c) Dark mode driven by config (theme.dark block in config).
d) Deep links: tapzacare://doctor/:id and tapzacare://prescription/:id.
e) Shared-element/hero transition doctor card → DoctorDetails (only if Reanimated's shared transitions are stable on 0.88).
f) Offline booking queue.
g) Maestro e2e flow for booking.
```
