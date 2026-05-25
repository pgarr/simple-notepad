# AI Agents Instructions (simple-notepad)

## Quick Safety Checklist (do not break invariants)

- Do not remove/skip the `migrateDbIfNeeded` hook from `SQLiteProvider` in `app/_layout.tsx`.
- Keep `NOTE_TYPE`/`LIST_TYPE` semantics consistent with `getListItemsById` and list update queries.
- Avoid direct SQL edits outside `lib/dataStorage.ts`.
- Do not change `journal_mode` away from `DELETE` — the Android widget requires it (see `NATIVE_CHANGES.md`).
- Do not run `expo prebuild --clean` — it will wipe the widget's native files.

## Native Code

The `android/` folder contains manual modifications on top of `expo prebuild` output — primarily an Android home-screen widget.

**See [`NATIVE_CHANGES.md`](./NATIVE_CHANGES.md) for the full list of native files, their purpose, AndroidManifest entries, schema dependencies, and upgrade notes.**

Key points for agents:

- Do **not** run `expo prebuild --clean` — use `expo prebuild` (no `--clean`) to preserve widget files.
- After any write operation in `lib/dataStorage.ts`, call `syncAndroidNoteListWidgetFromApp()` (already defined there) so the widget refreshes. All existing CRUD helpers already do this.

## Mission

This repo is a small Expo + React Native app (using Expo Router and NativeWind/Tailwind) for creating, listing, and editing "notes" and "checklist lists", persisted in a local SQLite database.

When you (or another AI agent) are asked to implement a change, prefer working through the existing route/components structure and the centralized SQLite data layer in `lib/dataStorage.ts`.

## Git Workflow (every change, no exceptions)

Every change — no matter how small — must follow this exact sequence:

0. **Pull the latest `master`** (`git checkout master && git pull`) before creating any branch — this ensures the version bump targets the correct base and avoids version conflicts in CI.
1. **Create a new branch** off `master` (never commit directly to `master`)
2. **Make your changes** and commit them to the branch
3. **Bump the version** (`npm run bump:patch/minor/major`) and commit the version files
4. **Push** the branch to remote
5. **Open a pull request** targeting `master`

Direct pushes to `master` are blocked by branch protection. CI enforces the version bump — a PR with the same version as `master` will fail.

**Agent rules:**

- **"Implement X" means make the code changes only.** Stop there and wait. Do not branch, commit, bump the version, push, or open a PR unless the developer explicitly says to (e.g. "commit this", "open a PR", "do the full workflow").
- **Before opening a PR, ask** whether the new work should go into an existing open branch/PR or a new one. Never assume a new branch.
- **Do not push** until the developer has tested the changes locally on a dev device and confirmed they are ready.

Choose the bump type based on the nature of the changes:

- **patch** (`npm run bump:patch`) — bug fixes, small tweaks, copy changes
- **minor** (`npm run bump:minor`) — new user-visible features, non-breaking additions
- **major** (`npm run bump:major`) — breaking changes, major UX overhauls

## When implementing a feature (agent playbook)

1. **Locate the route** to change/add under `app/`.
2. If the feature needs persistence, identify/extend the correct helper(s) in `lib/dataStorage.ts`.
3. For DB changes:
   - update the schema migration in `migrateDbIfNeeded`
   - bump `DATABASE_VERSION`
   - keep existing migrations compatible (older installs should migrate forward)
4. For UI:
   - reuse existing components in `components/` (especially `NoteForm`, `ListForm`, and `components/ui/*`)
   - use Tailwind/NW class names (via `className`)
5. Match existing loading/not-found patterns for numeric params and record-type checks.
6. If adding a new write operation in `lib/dataStorage.ts`, call `syncAndroidNoteListWidgetFromApp()` after the DB write (see existing helpers for the pattern).

## SQLite Database Model (most important invariants)

### Schema and versioning

@lib/dataStorage.ts

### How list content is stored

Lists store their items inside the `note` column as a JSON string:

- `stringifyListItems(items)` stores `{ checked, text }[]`
- `parseListItems(rawContent)` validates/filters parsed items

CRUD helpers to use:

- Notes:
  - `addNote`, `getNoteById`, `updateNote`, `deleteNote`
- Lists:
  - `addList`, `getListItemsById`, `updateList`, `updateListItems`

Important rule: updating list items uses `UPDATE content SET note = ? WHERE id = ? AND type = ?` (ensures you don't overwrite a note's data by accident).

## Repo Layout (where things live)

Routes under `app/`, reusable UI under `components/`, non-UI logic under `lib/`, custom hooks under `hooks/`.

@README.md

## Tech Stack (what to assume)

Expo ~54, Expo Router, NativeWind v4, expo-sqlite, TypeScript strict — see @package.json for exact versions.

## Routing / Screen patterns (Expo Router)

- Dynamic numeric route params use:
  - `useParsedNumericRouteParam('id')`
  - screens then guard with `isValidId` (invalid id -> not found / redirect behavior)
- For typed routing (`expo` config has `experiments.typedRoutes: true`):
  - when passing dynamic routes to `router.push`, existing code uses casts like `as never`.

## UI + UX conventions

- Note create/edit uses `components/NoteForm.tsx`, which calls `onSave(trimmedTitle, noteContent.trim())`.
- List create/edit uses `components/ListForm.tsx`.
- Screens typically return:
  - `ScreenLoadingState` while fetching
  - `ScreenNotFoundState` when `id` is invalid or the record type doesn't match the expected screen
- Hardware back navigation:
  - screens use `useHardwareBackHandler(() => router.replace('/'))` or redirect to a "backTarget".
- Use `useKeyboardOffset` for bottom padding on screens with inputs (handles Android accessory bar).
- Use `HeaderBackButton` from `components/navigation/HeaderBackButton.tsx` for screen header back arrows.

## Code Style / Quality Bar

- Use type narrowing (not !) for nullable fields and 'loading' states. Always unwrap numeric route params via useParsedNumericRouteParam — never cast useLocalSearchParams() output directly.
- Run `npx prettier --check .` before committing (single quotes, `printWidth: 100`, Tailwind plugin). CI enforces this.
- All SQL lives in lib/dataStorage.ts. No exceptions.

## Running the app (for humans/agents)

@README.md

Last scanned: 2026-05-18
