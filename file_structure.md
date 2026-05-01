# TimeSphere — File Structure & Role Reference

> Legend: ⭐ = Crucial/most important file | 🔧 = Worked on in current session | 📦 = Build output (not edited manually)

---

## Root Configuration

| File | Role |
|------|------|
| `index.html` | HTML shell — single `<div id="root">` where React mounts. Vite injects the script bundle here. |
| `package.json` | Project manifest — lists all dependencies (React 19, Firebase, Tailwind, Vite) and npm scripts (`dev`, `build`, `preview`, `lint`). |
| `.env` | **Secret keys** — holds API keys for OpenWeatherMap and Firebase. Never committed to git. |
| `vite.config.ts` | Vite bundler config — enables the React plugin (JSX transform + HMR). |
| `tailwind.config.js` | Tailwind config — tells Tailwind which files to scan for utility classes and any theme extensions. |
| `postcss.config.js` | PostCSS config — wires up Tailwind and Autoprefixer into the CSS pipeline. |
| `tsconfig.json` | TypeScript root config — references the two sub-configs below. |
| `tsconfig.app.json` | TypeScript config for source code — ES2023 target, strict mode, JSX support. |
| `tsconfig.node.json` | TypeScript config for Vite config file specifically. |
| `eslint.config.js` | ESLint rules — enforces code quality, React Hooks rules, and React Refresh compatibility. |
| `.gitignore` | Tells Git to ignore `node_modules/`, `dist/`, `.env`, and editor configs. |

---

## Source Code — Entry

| File | Role |
|------|------|
| ⭐ `src/main.tsx` | App bootstrap — wraps `<App>` in React `StrictMode` and mounts it into `index.html`'s `#root` div. |

---

## Source Code — Core

| File | Role |
|------|------|
| ⭐🔧 `src/App.tsx` | **Heart of the app** — orchestrates everything: clock state, weather data, background image cycling, auth, all modal open/close flags, and the full page layout. Every feature passes through here. |
| `src/types.ts` | TypeScript type definitions — shared interfaces like `WeatherData`, `UserProfile`, `AppTheme`, `LanguageOption`. Used across the entire codebase for type safety. |

---

## Source Code — Styling

| File | Role |
|------|------|
| ⭐🔧 `src/index.css` | Global styles — Tailwind directives, Google Fonts import, `.bg-layer` background image CSS (the fullscreen fixed background system), clock face styles, and animation keyframes. |
| `src/App.css` | Component-level styles — additional styles specific to the App layout that Tailwind utilities don't cover. |

---

## Source Code — Custom Hooks

| File | Role |
|------|------|
| ⭐ `src/hooks/useClock.ts` | Clock engine — manages ticking time, play/pause, edit mode, manual time override, and reset. Core to the app's primary feature. |
| ⭐ `src/hooks/useWeather.ts` | Weather data — fetches from OpenWeatherMap API using GPS coordinates, auto-refreshes every 10 minutes. Drives the background image theme and sky condition. |
| `src/hooks/useGeolocation.ts` | GPS hook — requests browser location and exposes `lat`/`lon`. Falls back to Stockholm if denied. |
| `src/hooks/useAuth.ts` | Auth hook — handles Firebase Google login, SMS phone login, and user profile syncing with Firestore. |

---

## Source Code — Utilities

| File | Role |
|------|------|
| ⭐🔧 `src/utils/backgroundImages.ts` | **Background system** — fetches weather-matched photos from Unsplash API, NASA APOD images for space theme, and manages custom uploads. Fixed in this session to request portrait-oriented images on mobile screens so the background fills properly instead of cropping. |
| ⭐ `src/utils/timeUtils.ts` | Time language logic — converts a time (e.g., 9:27) into spoken phrases like "27 minutes past nine" in English and Swedish. Core to the language-learning feature. |
| `src/utils/languageUtils.ts` | Language options — defines all 20+ supported languages with flags, codes, and timezone mappings. Also wraps the Web Speech API for text-to-speech playback. |
| `src/utils/timezones.ts` | Timezone list — complete IANA timezone database with UTC offsets and country codes, used in the timezone selector. |
| `src/utils/weatherUtils.ts` | Weather helpers — utility functions for processing weather API responses (condition mapping, icon selection, etc.). |

---

## Source Code — Firebase

| File | Role |
|------|------|
| `src/firebase/config.ts` | Firebase setup — initialises the Firebase app, Auth service, and Firestore database using keys from `.env`. Required for login and profile saving. |

---

## Source Code — Components

| File | Role |
|------|------|
| ⭐ `src/components/AnalogClock.tsx` | The main visual — renders the animated analog clock face with hour, minute, and second hands. |
| ⭐ `src/components/DigitalClock.tsx` | Digital time display — shows local and home timezone times, with play/pause/edit/reset controls. |
| ⭐ `src/components/LanguageBox.tsx` | Language learning panel — shows the spoken time phrase in the selected language, with a speaker button to hear it via TTS. |
| `src/components/WeatherWidget.tsx` | Compact top-right weather badge — shows temperature and weather condition icon. |
| `src/components/WeatherApp.tsx` | Expanded weather modal — full forecast with hourly/daily data and location info. |
| `src/components/WeatherDetails.tsx` | Weather detail rows — humidity, wind speed, pressure sub-component inside the weather modal. |
| `src/components/HamburgerMenu.tsx` | Navigation drawer — hamburger icon that opens a side menu linking to Auth, Settings, Calendar, Time Diff Calculator, Weather, and Background Picker. |
| `src/components/Settings.tsx` | Settings modal — lets user change home timezone, temperature units, toggle weather widget, and toggle auto-refresh. |
| `src/components/AuthModal.tsx` | Login modal — Google sign-in button and SMS phone number + verification code form. |
| `src/components/Calendar.tsx` | Calendar modal — monthly calendar view with national holidays highlighted based on user's country. |
| `src/components/TimeDiffCalc.tsx` | Time diff calculator modal — lets user compare current time across multiple timezones simultaneously. |
| `src/components/BackgroundPicker.tsx` | Theme picker modal — choose between Auto, Dark, Space, or Custom background themes with preview thumbnails. |

---

## Public Assets

| File | Role |
|------|------|
| `public/favicon.svg` | Browser tab icon. |
| `public/icons.svg` | SVG sprite sheet — icon definitions used throughout the UI. |
| `src/assets/hero.png` | Hero image asset used in the UI. |

---

## Build Output (`dist/`) — Auto-generated, do not edit

| File | Role |
|------|------|
| 📦 `dist/index.html` | Production HTML with injected script/style references. Generated by `npm run build`. |
| 📦 `dist/assets/index-BC2mIyXA.js` | Minified JavaScript bundle — entire app compiled into one file with a hash suffix for cache busting. |
| 📦 `dist/assets/index-Drs9Lmpt.css` | Minified CSS bundle — all Tailwind utilities + global styles compiled and purged. |
| 📦 `dist/favicon.svg` | Copied from `public/` during build. |
| 📦 `dist/icons.svg` | Copied from `public/` during build. |

---

## Editor Config

| File | Role |
|------|------|
| `.vscode/settings.json` | VSCode workspace settings — auto-format on save, extension recommendations for this project. |

---

## Session Work Summary

Files touched in **this session**:

| File | What changed |
|------|--------------|
| `src/utils/backgroundImages.ts` | Added `orientation` parameter to `fetchUnsplashPhotos` so it can request portrait-oriented photos on mobile. Cache key now includes orientation. Fallback URL now uses `window.screen.width x window.screen.height` instead of hardcoded `1920x1080`. |
| `src/App.tsx` | Detects portrait vs landscape screen (`window.innerHeight > window.innerWidth`) and passes the correct orientation to `fetchUnsplashPhotos`, fixing background images cropping on small screens. |
| `src/index.css` | Read for reference — `.bg-layer` CSS was inspected to understand the fixed fullscreen background system. No changes needed here. |
