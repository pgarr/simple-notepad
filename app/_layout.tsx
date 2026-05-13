import '@/global.css';

import { migrateDbIfNeeded, SQLITE_DATABASE_NAME } from '@/lib/dataStorage';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { addDatabaseChangeListener, SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function AndroidHomeScreenWidgetsSync() {
  const db = useSQLiteContext();

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }
    const sub = addDatabaseChangeListener(({ tableName }) => {
      if (tableName === 'content') {
        NativeModules.WidgetRefresh?.refreshNoteListWidgets?.();
      }
    });
    return () => sub.remove();
  }, [db]);

  return null;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <SQLiteProvider
        databaseName={SQLITE_DATABASE_NAME}
        onInit={migrateDbIfNeeded}
        options={{ enableChangeListener: true }}
      >
        <AndroidHomeScreenWidgetsSync />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack />
        <PortalHost />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
