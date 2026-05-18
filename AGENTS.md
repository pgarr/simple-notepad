# AI Agents Instructions (simple-notepad)

## Mission
This repo is a small Expo + React Native app (using Expo Router and NativeWind/Tailwind) for creating, listing, and editing "notes" and "checklist lists", persisted in a local SQLite database.

When you (or another AI agent) are asked to implement a change, prefer working through the existing route/components structure and the centralized SQLite data layer in `lib/dataStorage.ts`.

## Tech Stack (what to assume)
- **Runtime**: React Native + Expo (~54)
- **Routing**: **Expo Router** (file-based routes under `app/`)
- **Styling**: NativeWind + Tailwind (`global.css`, `tailwind.config.js`, Tailwind classes in JSX)
- **Storage**: `expo-sqlite` with migrations handled in `app/_layout.tsx` via `migrateDbIfNeeded`
- **TypeScript**: `strict: true`

## Repo Layout (where things live)
- `app/`: screens/routes (Expo Router)
  - `app/index.tsx`: notes list screen
  - `app/add-note.tsx`: create note
  - `app/edit-note/[id].tsx`: edit note by numeric id
  - `app/note/[id].tsx`: view note by numeric id
  - `app/add-list.tsx`: create list
  - `app/edit-list/[id].tsx`: edit list by numeric id
  - `app/list/[id].tsx`: view list by numeric id
- `components/`: reusable UI pieces
  - `components/NoteForm.tsx`: shared note create/edit form
  - `components/ListForm.tsx`: shared list create/edit form
  - `components/AddContentDropdown.tsx`: "add note or list" UI
  - `components/navigation/HeaderBackButton.tsx`: back arrow button for screen headers
  - `components/state/`: `ScreenLoadingState` and `ScreenNotFoundState`
  - `components/ui/`: primitive UI components — `button`, `card`, `icon`, `input`, `textarea`, `text`
- `lib/`: non-UI logic
  - `lib/dataStorage.ts`: SQLite schema, migrations, and CRUD helpers
  - `lib/theme.ts`: navigation theme colors
  - `lib/utils.ts`: `cn()` utility for className merging
- `hooks/`: small hooks used by screens
  - `useParsedNumericRouteParam`: parses numeric `[id]` params safely
  - `useHardwareBackHandler`: handles Android back navigation
  - `useKeyboardOffset`: tracks keyboard visibility on Android to compute bottom padding

## Native Code
The `android/` folder contains manual modifications on top of `expo prebuild` output — primarily an Android home-screen widget.

**See [`NATIVE_CHANGES.md`](./NATIVE_CHANGES.md) for the full list of native files, their purpose, AndroidManifest entries, schema dependencies, and upgrade notes.**

Key points for agents:
- Do **not** run `expo prebuild --clean` — use `expo prebuild` (no `--clean`) to preserve widget files.
- After any write operation in `lib/dataStorage.ts`, call `syncAndroidNoteListWidgetFromApp()` (already defined there) so the widget refreshes. All existing CRUD helpers already do this.

## Running the app (for humans/agents)
Common scripts from `package.json`:
- Dev server: `npm run dev` (runs `expo start`)
- Platform-specific:
  - `npm run ios`
  - `npm run android`
  - `npm run web`
- Tests: `npm run test-ci` (CI, non-interactive) or `npm run test-watch` (interactive watch)
- Prebuild: `npm run prebuild` (runs `expo prebuild` — no `--clean`)
- Version bump: `npm run bump:patch / bump:minor / bump:major`
- Clean: `npm run clean` (removes `.expo` and `node_modules`)

## Routing / Screen patterns (Expo Router)
- Routes are defined by filenames under `app/`.
- Dynamic numeric route params use:
  - `useParsedNumericRouteParam('id')`
  - screens then guard with `isValidId` (invalid id -> not found / redirect behavior)
- For typed routing (`expo` config has `experiments.typedRoutes: true`):
  - when passing dynamic routes to `router.push`, existing code uses casts like `as never`.

## SQLite Database Model (most important invariants)
### Where the DB is initialized
`app/_layout.tsx` wraps the router with:
- `<SQLiteProvider databaseName="notes.db" onInit={migrateDbIfNeeded}>`

So the migration function in `lib/dataStorage.ts` is responsible for keeping schema compatible across app updates.

### Schema and versioning
In `lib/dataStorage.ts`:
- `DATABASE_VERSION = 3`
- `SQLITE_DATABASE_NAME = 'notes.db'` (exported constant — use this everywhere instead of a hardcoded string)
- `content` table columns:
  - `id INTEGER PRIMARY KEY NOT NULL`
  - `title TEXT NOT NULL`
  - `note TEXT NOT NULL`
  - `type INTEGER NOT NULL` (added in migration v2; semantic types below)
- `type` constants:
  - `NOTE_TYPE = 0`
  - `LIST_TYPE = 1`
- Migration approach:
  - Reads `PRAGMA user_version`
  - If `user_version >= DATABASE_VERSION`: do nothing
  - If missing/old:
    - (Re)creates the base table if `user_version === 0`
    - Adds the `type` column if it's missing (v2); assigns default `NOTE_TYPE` and fixes nulls
    - Sets `journal_mode = DELETE` (v3) — required because the Android widget opens the same file via Android's `SQLiteDatabase` API; WAL + two SQLite stacks can corrupt the file
  - Sets `PRAGMA user_version = DATABASE_VERSION`

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
- TypeScript `strict` mode is on, so be careful with `null`, `'loading'`, and route params.
- Follow Prettier config expectations:
  - single quotes, `printWidth: 100`, Tailwind plugin support.
- Prefer adding logic to `lib/dataStorage.ts` instead of scattering SQL strings in screens.

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

## Quick Safety Checklist (do not break invariants)
- Do not remove/skip the `migrateDbIfNeeded` hook from `SQLiteProvider` in `app/_layout.tsx`.
- Keep `NOTE_TYPE`/`LIST_TYPE` semantics consistent with `getListItemsById` and list update queries.
- Avoid direct SQL edits outside `lib/dataStorage.ts`.
- Do not change `journal_mode` away from `DELETE` — the Android widget requires it (see `NATIVE_CHANGES.md`).
- Do not run `expo prebuild --clean` — it will wipe the widget's native files.

Last scanned: 2026-05-18
