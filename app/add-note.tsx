import { NoteForm } from '@/components/NoteForm';
import { HeaderBackButton } from '@/components/navigation/HeaderBackButton';
import { useHardwareBackHandler } from '@/hooks/useHardwareBackHandler';
import { addNote } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useCallback } from 'react';

export default function AddNoteScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const handleSave = useCallback(
    async (title: string, content: string) => {
      await addNote(db, { title, note: content });
      router.replace('/');
    },
    [db, router]
  );

  useHardwareBackHandler(() => {
    router.replace('/');
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New note',
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.replace('/')}
              accessibilityLabel="Back to notes"
            />
          ),
        }}
      />
      <NoteForm onSave={handleSave} />
    </>
  );
}
