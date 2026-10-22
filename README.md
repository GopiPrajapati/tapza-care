# Tapza Care

Patient app for Tapza Clinic: a config-driven, Zepto-style home, doctor booking, and prescriptions with dose reminders.
React Native CLI + strict TypeScript, mocked backend.

> Work in progress. Sections marked _TBD_ are filled in as phases land.

## Demo
- Screenshots and a 2–3 minute video: [`/docs`](docs/) _TBD_
- APK: GitHub Release _TBD_

## Install the APK
_TBD_ (download link from the Release, enable "Install unknown apps", open the APK).

## Run locally
Requirements: Node >= 22.11, JDK 17, Android SDK (compileSdk 37), Xcode + CocoaPods for iOS.

```sh
npm install
npm start
npm run android   # or: npm run ios (after `cd ios && bundle exec pod install`)
```

Tests and checks:
```sh
npx tsc --noEmit
npm run lint
npm test
```

## Folder structure and why
_TBD_

## Architecture decisions
_TBD_ (config → zod validation → theme; TanStack Query + mock api client; Zustand persisted state; section registry).

## Mock backend and failure switch
_TBD_ (endpoints, latency/failure controls, where to toggle them in the app).

## What I cut and why
_TBD_

## Time spent (honest)
_TBD_

## AI usage
See [AI_LOG.md](AI_LOG.md).
