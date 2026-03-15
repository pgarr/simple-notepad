import { NoteForm } from '@/components/NoteForm';
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
      router.back();
    },
    [db, router]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'New note' }} />
      <NoteForm onSave={handleSave} />
    </>
  );
}
