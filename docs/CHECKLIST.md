# Submission checklist

## Screenshots

Capture each screen in both Normal and Diwali themes. Keep the device frame, text size, and status bar consistent; name files `screen-state-theme.png` and place final captures in `docs/screenshots/`.

| Screen / state                                 | Normal | Diwali |
| ---------------------------------------------- | ------ | ------ |
| Home, top and scrolled sections                | [ ]    | [ ]    |
| Doctor list, results and filtered results      | [ ]    | [ ]    |
| Doctor details, date strip and slot sheet      | [ ]    | [ ]    |
| Booking success                                | [ ]    | [ ]    |
| My bookings, upcoming and past                 | [ ]    | [ ]    |
| Prescriptions and adherence                    | [ ]    | [ ]    |
| Prescription details, schedule and taken state | [ ]    | [ ]    |
| Profile                                        | [ ]    | [ ]    |
| Developer settings and custom editor           | [ ]    | [ ]    |

Capture resilience states with Developer settings and label the control used in the filename:

| Surface                                         | Loading skeleton (latency 3 sec) | Empty list | Error / retry |
| ----------------------------------------------- | -------------------------------- | ---------- | ------------- |
| Home config (config fails; cached layout shown) | [ ]                              | N/A        | [ ]           |
| Doctor list (all fail / empty lists)            | [ ]                              | [ ]        | [ ]           |
| Doctor details slot sheet (all fail / no slots) | [ ]                              | [ ]        | [ ]           |
| My bookings (all fail / empty lists)            | [ ]                              | [ ]        | [ ]           |
| Prescriptions (all fail / empty lists)          | [ ]                              | [ ]        | [ ]           |

Also capture the booking conflict recovery with `failure=booking409`, then success with `failure=none`. Restore developer controls to Normal, 800 ms, and None after capturing.

## Accessibility and device QA

- [ ] Verify text at the largest practical OS font scale on Home, Doctor details, and Prescriptions.
- [ ] Confirm screen-reader labels for date, slot, search, booking, and dose controls.
- [ ] Confirm touch controls remain at least 44 pt and safe-area insets do not cover content.
- [ ] On Android when device storage permits: verify tabs, navigation, hardware back, Home motion, and booking success/conflict recovery.
- [ ] Build and install the Android release APK; attach it to the GitHub Release.

## 2–3 minute demo video script

| Time      | Action and narration                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00–0:20 | Open Home in Normal. Show the fast clinic header, search, service bands, and doctor carousel. Mention that the layout and colors come from config.                 |
| 0:20–0:35 | Open Profile → Developer settings, switch to Diwali, return Home, and show the live banner/theme change.                                                           |
| 0:35–0:55 | Open a doctor, choose a date and a free time. In Developer settings set failure to Force 409 and return to confirm.                                                |
| 0:55–1:15 | Show the pending success screen, then the conflict recovery: same date, slot disabled, and the clear “slot was just taken” message.                                |
| 1:15–1:35 | Set failure to None, choose another time, confirm, and show the success screen and confirmed booking in My bookings.                                               |
| 1:35–1:55 | Open Prescriptions, show today’s adherence, open a prescription, mark a dose taken, and use Undo once.                                                             |
| 1:55–2:25 | Set latency to 3 seconds and failure to Config fails. Return Home, show the loading skeleton then cached layout banner. Briefly show the config editor validation. |
| 2:25–2:40 | Close with the mock-only architecture and point out that controls can be reset for another demo.                                                                   |

Before recording, confirm the settings requested by the script and restore defaults afterward. Keep the final recording between two and three minutes.
