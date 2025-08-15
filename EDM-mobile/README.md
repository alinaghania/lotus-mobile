# Lotus Health (EDM-mobile) – Developer Knowledge Base

## Tech stack
- React Native (Expo SDK 53, React 19, React Native 0.79)
- Navigation: `@react-navigation/native` (stack + tabs)
- State/contexts: custom `AuthContext`, `DateContext`
- Styling: inline RN styles + some `nativewind` wrappers (no Tailwind runtime)
- i18n: `react-i18next` with `expo-localization`
- Storage: AsyncStorage (local-only persistence for auth, tracking, images, profiles)
- Images: `expo-image-picker`, `expo-file-system`
- Notifications: `expo-notifications`
- PDFs: `expo-print` + `expo-sharing`
- Icons: `@expo/vector-icons/Ionicons`
- Avatars: DiceBear Avataaars (`@dicebear/core`, `@dicebear/collection`)
- Router starter in `app/` exists (Expo Router sample), but the app uses classic React Navigation via `App.tsx`

## App entry and navigation
- Entry: `index.js` → `App.tsx`
- `App.tsx` wraps with `SafeAreaProvider`, `DateProvider`, `AuthProvider`, sets up a native stack:
  - Onboarding → Login/Register → `MainTabs` (Home, Tracking, Analytics, Profile)
  - Additional screens: `CharacterCustomization`, `DigestiveScreen`, `Levels`
- `src/navigation/AppNavigator.tsx` is an alternative navigator (not actively used in `App.tsx`)

## Contexts
- `src/contexts/AuthContext.tsx`
  - Manages `user` and `loading`, persists current user id in AsyncStorage
  - Uses `authService` (local-only) for login/register/logout/update
- `src/contexts/DateContext.tsx`
  - Tracks `selectedDate` and exposes `triggerRefresh()` to prompt screens to reload day data

## Data model (types)
- `src/types/tracking.ts` – central `DailyRecord` with sections: sleep, meals, activity, symptoms, period, hydration, nutrition
- `src/types/profile.ts` – `UserProfile` (personal info, cycle settings, weights, goals, routines)
- `src/types/auth.ts` – `User`, credentials, `AuthState`
- `src/types/character.ts` – avatar customization model

## Persistence and services
- Local storage (AsyncStorage) used for all critical data:
  - Auth: `src/services/authService.ts`
    - Hashes password with salt using `expo-crypto`; persists users under keys `user_<id>` and `currentUser`
  - Tracking: `src/services/trackingService.ts`
    - Per-day `DailyRecord` under keys like `tracking_<userId>_<YYYY-MM-DD>`; CRUD helpers and list by user
  - Profile: `src/services/profileService.ts`
    - Upserts per-user profile under key `profile_<userId>` (weights history, cycle settings, etc.)
  - Images: `src/services/imageService.ts`
    - Copies photo to app sandbox and saves only file URI in AsyncStorage under `image_<userId>_<date>_<type>`
  - Analytics: `src/services/analyticsService.ts`
    - Computes derived series from tracking data: calories, top foods, food-symptom matrix, digestive trend, period correlation, simple cycle prediction (uses profile cycle settings), health score utilities
  - Calories: `src/services/caloriesService.ts`
    - Offline estimates via small map; supports quantity and per-meal overrides
  - AI meal vision: `src/services/aiService.ts`
    - Calls OpenAI Responses API (`model: gpt-4o-mini`) with an image; requires `OPENAI_API_KEY`; returns parsed items, optional quantities, calories
  - Notifications: `src/services/notificationService.ts`
    - Schedules local notifications; includes placeholders to save tokens to MongoDB (no mobile Mongo client implemented). Treat Mongo usage here as TODO/example only
  - `src/services/userService.ts` references `../config/mongodb` (not present). Consider this a non-used server-side stub. The mobile app does not have a MongoDB driver in dependencies
  - HTTP client: `src/services/apiClient.ts` for optional backend calls using `API_BASE_URL` (unused by default)

Important: Despite some Mongo references, the mobile app currently runs fully offline using AsyncStorage. There is no working in-app MongoDB connection.

## Configuration and env
- `app.json` and `app.config.ts` expose `extra` fields used by `src/config/config.ts`:
  - `OPENAI_API_KEY`, `MONGODB_URI`, `API_BASE_URL`, `PROJECT_ID`
- Set env via `.env` for local builds; `app.config.ts` reads `process.env.*` into `extra`.
- i18n loads `en`, `fr`, `es`, `de`; default language is device locale with fallback to `en`.

## Screens and main features
- Home (`src/screens/HomeScreen.tsx`)
  - Greets user, date selector + calendar modal
  - Loads `DailyRecord` for `selectedDate`, computes progress across sleep, meals, sport, cycle, symptoms
  - “Collect +1 Endolot” reward on completed tasks; persists to saved character
  - Monthly weight prompt on 10th; saves to `profileService` weights
  - Quick actions to Tracking and Digestive
  - Avatar preview via `DetailedCharacter`
- Tracking (`src/screens/TrackingScreen.tsx`)
  - Tabs: Sleep, Meals, Sport, Cycle, Symptoms
  - Sleep: simple time fields; duration auto-calculated; routine manager to define weekly templates
  - Meals: per-meal items with optional fasting, quantities, AI photo analysis to detect foods, per-meal calorie override, daily total
  - Drinks: multi-select with per-type quantities
  - Sport: select activities + minutes; routine manager similar to sleep
  - Cycle: simple period toggle for the day
  - Symptoms: multi-select (allow custom)
  - Saves to `trackingService` by date; updates progress and triggers Home refresh
- Analytics (`src/screens/AnalyticsScreen.tsx`)
  - Range filters (Last 3 Days/Week/Month/Custom), granularity (Daily/Weekly/Monthly) for calories chart
  - KPIs: avg sleep, sport, symptoms, calories; top symptoms; food correlation and matrix; digestive issues trend
  - Cycle prediction section based on recorded period days and profile cycle settings
  - Export PDF report via `pdfService`
- Profile (`src/screens/ProfileScreen.tsx`)
  - Wizard: personal info, health basics, conditions/medications/allergies, goals
  - Persists to `profileService`; links to Levels and Digestive screens
- Character customization (`src/screens/CharacterCustomizationScreen.tsx`)
  - Step-based customization using official Avataaars options; some options gated as “premium” (Endolots)
  - Saves to AsyncStorage under `savedCharacter`
- Digestive screens (`src/screens/DigestiveScreen.tsx`, `src/screens/DigestiveIssuesScreen.tsx`)
  - Two UIs for belly/body photos; both persist locally; grid/feed views, likes/comments in UI
- Levels (`src/screens/LevelsScreen.tsx`)
  - Simple display of level and Endolots

## Components
- `DetailedCharacter` renders a DiceBear Avataaars SVG from `Character`, via `utils/diceBearUtils.ts`
- `MultiSelect` modal component with search, add custom options (saved to AsyncStorage)
- `ImageCapture` helper to pick/take images and pass URI up

## Styling
- Most screens use plain `StyleSheet.create` files under `src/styles/`
- `src/components/styled.tsx` exposes `nativewind`-styled wrappers, but Tailwind classes are not actively used in this app

## Internationalization
- Strings mostly inline in English. `src/i18n/index.ts` is initialized at app start (`import './src/i18n'` in `App.tsx`)
- Locales found in `src/locales/{en,fr,es,de}.json`

## Building and running
- Install deps inside `EDM-mobile/`:
  ```bash
  npm install
  ```
- Start in dev:
  ```bash
  npx expo start
  ```
- iOS simulator:
  ```bash
  npm run ios
  ```
- Android emulator:
  ```bash
  npm run android
  ```
- Web preview:
  ```bash
  npm run web
  ```
- Bare builds (prebuild first):
  - Android: `npm run build:android`
  - iOS: `npm run build:ios` (requires Xcode & CocoaPods)

Notes
- Provide `OPENAI_API_KEY` in env to enable AI meal analysis. Without it, the analysis modal will error.
- No backend is required to run; all data stays on-device. The `apiClient` and Mongo stubs are optional/unused.
- AsyncStorage keys: users `user_*`, current `currentUser`, profile `profile_*`, tracking `tracking_<uid>_<date>`, images `image_<uid>_<date>_<type>`.

## Project structure highlights
- Entry/navigation: `App.tsx`, `index.js`
- Contexts: `src/contexts/`
- Screens: `src/screens/`
- Services: `src/services/`
- Types: `src/types/`
- Styles: `src/styles/`
- Assets: `assets/`

## Common flows
- Authentication
  - Register → `authService.register()` writes a user locally, logs in, pre-creates profile via `profileService.upsertProfile`
  - Login → `authService.login()` looks up by email, verifies salted SHA-256
- Tracking save
  - `TrackingScreen` composes partial updates and calls `trackingService.updateTracking(userId, date, data)`
  - `HomeScreen` reads per-day record to compute progress and tasks
- Analytics
  - `analyticsService.getAnalytics(userId, start, end)` aggregates AsyncStorage tracking data into charts/insights
- AI meal analysis
  - `TrackingScreen` opens image, calls `analyzeMealImage(uri)`; merged items feed calories calculator; per-meal overrides supported

## Adding a backend later (optional)
- `apiClient` is ready for `API_BASE_URL`
- MongoDB references in `userService`/`notificationService` assume a server environment; move them server-side
- If syncing is added, keep AsyncStorage as an offline cache and implement a reconciler

## Known gaps / TODOs
- Remove or gate `src/services/userService.ts` and `src/services/notificationService.ts` Mongo writes for mobile builds
- Harden parsing in `aiService.ts` when OpenAI response formats vary
- More robust validation and error banners across screens
- Tests (no Jest setup currently used)

## Quick troubleshooting
- Blank screen at start: ensure `onboarding_complete` is set or navigate Onboarding → Login → Main
- AI analysis fails: check `OPENAI_API_KEY` in `app.config.ts` extras
- Images not persisting: verify camera/library permissions and `expo-file-system` sandbox path
- Progress not updating on Home: `DateContext.triggerRefresh()` is called after saves; ensure selected date is correct
