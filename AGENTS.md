# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens/layouts; `index.tsx` is the Convex-powered landing view. Co-locate route-specific components here.
- `components/`: Reusable React Native UI pieces; prefer creating shared variants here when using NativeWind styling or React Native Reusables primitives.
- `lib/`: Cross-cutting helpers (`utils.ts` for `cn` merging, `theme.ts` for design tokens).
- `convex/`: Convex schema (`schema.ts`) and functions (`pins.ts`, `songs.ts`); keep args/types aligned with frontend usage.
- Styling config: `global.css` (theme tokens), `tailwind.config.js`, `nativewind-env.d.ts`, `babel.config.js`, and `metro.config.js` are required for NativeWind.
- Assets & data: `assets/images/` for icons/splash art; sample JSONL files for pins/songs at the repo root.

## Build, Test, and Development Commands
- Install: `npm install`.
- Run app: `npm start` (Expo Dev Server) then pick iOS, Android, or web; shortcuts: `npm run ios`, `npm run android`, `npm run web`.
- Lint: `npm run lint` (Expo + ESLint config).
- Reset starter: `npm run reset-project` to restore the example scaffold (overwrites `app/`).

## Styling, UI Kits & Naming
- Use NativeWind `className` on React Native components; tokens come from `global.css` and `tailwind.config.js` (content paths include `app/**/*` and `components/**/*`).
- Compose classes with `cn` from `lib/utils` when conditional styling is needed; rely on `tailwind-merge` to dedupe.
- Build shared UI with React Native Reusables primitives (e.g., portals via `@rn-primitives/portal`) inside `components/`, exporting from `components/ui` patterns when they emerge.
- Prefer 2-space indentation, PascalCase components, camelCase functions/vars, and keep route filenames aligned with Expo Router conventions (e.g., `app/(tabs)/map.tsx`, dynamic `[id].tsx`).

## Testing Guidelines
- No automated suite yet; run flows manually via `npm start` across platforms.
- When adding tests, mirror file names (`*.test.tsx`) and mock Convex/audio calls. Validate fetching pins/songs with `EXPO_PUBLIC_CONVEX_URL` set, and audio playback with `useAudioPlayer`.

## Commit & Pull Request Guidelines
- Commits: Imperative, present-tense summaries (e.g., “Add NativeWind song picker styles”); keep related changes together.
- PRs: Include a clear summary, linked issues, platforms tested, and screenshots/screen recordings for UI tweaks. Call out NativeWind or reusable component additions and any schema/env changes.
- Do not commit secrets; configure Convex URL via `.env` and reference with `EXPO_PUBLIC_CONVEX_URL`.
