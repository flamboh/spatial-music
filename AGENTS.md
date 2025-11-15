# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Active Expo Router screens and layouts; `index.tsx` is the landing view wired to Convex queries and Expo Audio.
- `convex/`: Convex schema (`schema.ts`) and serverless functions (`pins.ts`, `songs.ts`); keep data contracts in sync with frontend types.
- `assets/images/`: App icons and splash artwork.
- `app-example/`: Reference starter app and components for patterns; do not import from here in production builds.
- Root configs: `eslint.config.js`, `tsconfig.json`, and `package.json` scripts; sample data in `samplePins.jsonl` and `sampleSongs.jsonl`.

## Build, Test, and Development Commands
- Install: `npm install` (required once or after dependency changes).
- Run app: `npm start` (alias for `expo start`) then choose platform (iOS simulator, Android emulator, or web).
- Platform shortcuts: `npm run ios`, `npm run android`, `npm run web` for direct launches.
- Lint: `npm run lint` (Expo + ESLint rules).
- Reset starter: `npm run reset-project` to swap in the `app-example` baseline (destroys current `app/` content—use with caution).

## Coding Style & Naming Conventions
- Language: TypeScript with strict mode (`tsconfig.json`); prefer explicit types on public APIs and Convex arguments.
- Components: Functional React components with hooks; keep screen files co-located in `app/` by route.
- Formatting: 2-space indentation; run `npm run lint` before pushing. Follow Expo Router file-based naming (e.g., `app/(tabs)/map.tsx`, `[id].tsx` for dynamic routes).
- Convex: Define args with `v.*` validators and keep schema updates in `convex/schema.ts` before using new fields.

## Testing Guidelines
- No automated test suite is configured; rely on `npm start` for manual verification across platforms.
- When adding tests, align names with the file under test (e.g., `app/foo.test.tsx`); prefer lightweight React Native testing libraries and mock Convex/network calls.
- Manually sanity-check critical flows: Convex queries resolving with `EXPO_PUBLIC_CONVEX_URL` set, audio playback via `useAudioPlayer`, and navigation between routes.

## Commit & Pull Request Guidelines
- Commits: Use present-tense, imperative messages summarizing the change (e.g., “Add pin creation mutation”). Keep related changes together.
- Pull requests: Provide a concise summary, linked issue (if any), platform(s) tested, and screenshots/screen recordings for UI changes. Note any data or env requirements (Convex deployment URL, seed files).
- Avoid committing sensitive values; use `.env` with `EXPO_PUBLIC_CONVEX_URL` for frontend access to Convex.
