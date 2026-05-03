# Simple Notepad

A lightweight cross-platform notes and checklist app built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/). Create, manage, and organize your notes and checklists with persistent local storage via SQLite.

## Features

- ✍️ Create and edit notes with a clean, intuitive interface
- ☑️ Create and manage checklist items with check/uncheck functionality
- 💾 All data persisted locally in SQLite database
- 🎨 Responsive UI powered by Tailwind CSS via NativeWind
- 📱 Runs seamlessly on iOS, Android, and Web
- 🔥 Edge-to-Edge display support

## Getting Started

### Running the App

Start the development server:

```bash
npm run dev
```

Then open the app in your preferred platform:

- **iOS**: press `i` to launch in the iOS simulator _(Mac only)_
- **Android**: press `a` to launch in the Android emulator
- **Web**: press `w` to run in a browser

Alternatively, you can scan the QR code using the [Expo Go](https://expo.dev/go) app on your physical device.

### Available Scripts

From `package.json`:

```bash
npm run dev              # Start development server
npm run android         # Build and run on Android
npm run prebuild        # Generate native projects
npm run test-watch      # Run tests in watch mode
npm run test-ci         # Run tests (CI mode)
npm run clean           # Clean build artifacts and dependencies
npm run bump:patch      # Bump patch version
npm run bump:minor      # Bump minor version
npm run bump:major      # Bump major version
```

## Adding components

You can add more reusable components using the CLI:

```bash
npx react-native-reusables/cli@latest add [...components]
```

> e.g. `npx react-native-reusables/cli@latest add input textarea`

If you don't specify any component names, you'll be prompted to select which components to add interactively. Use the `--all` flag to install all available components at once.

## Project Features

- ⚛️ Built with [Expo Router](https://expo.dev/router)
- 🎨 Styled with [Tailwind CSS](https://tailwindcss.com/) via [Nativewind](https://www.nativewind.dev/)
- 📦 UI powered by [React Native Reusables](https://github.com/founded-labs/react-native-reusables)
- 🚀 New Architecture enabled
- 🔥 Edge to Edge enabled
- 📱 Runs on iOS, Android, and Web

## Architecture

- **Routing**: File-based routing with [Expo Router](https://expo.dev/router) under `app/` directory
- **Storage**: Local SQLite database via `expo-sqlite` with automated migrations
- **State Management**: React hooks and component state
- **Data Layer**: Centralized CRUD helpers in `lib/dataStorage.ts`

## Learn More

To dive deeper into the technologies used:

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Expo Router Guide](https://expo.dev/router)
- [Nativewind Docs](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)
- [SQLite with Expo](https://docs.expo.dev/versions/latest/sdk/sqlite/)
