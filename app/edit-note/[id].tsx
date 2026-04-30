import { HeaderBackButton } from '@/components/navigation/HeaderBackButton';
import { NoteForm } from '@/components/NoteForm';
import { ScreenLoadingState } from '@/components/state/ScreenLoadingState';
import { ScreenNotFoundState } from '@/components/state/ScreenNotFoundState';
import { useHardwareBackHandler } from '@/hooks/useHardwareBackHandler';
import { useParsedNumericRouteParam } from '@/hooks/useParsedNumericRouteParam';
import { NOTE_TYPE, getNoteById, updateNote, type Note } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export default function EditNoteScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { rawValue: id, value: noteId, isValid: isValidId } = useParsedNumericRouteParam('id');
  const [note, setNote] = useState<Note | null | 'loading'>('loading');

  const backTarget = isValidId ? `/note/${id}` : '/';

  const loadNote = useCallback(async () => {
    if (!isValidId) {
      setNote(null);
      return;
    }
    const found = await getNoteById(db, noteId);
    if (found?.type !== NOTE_TYPE) {
      setNote(null);
      return;
    }
    setNote(found);
  }, [db, noteId, isValidId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleSave = useCallback(
    async (title: string, content: string) => {
      if (!isValidId) return;
      await updateNote(db, noteId, { title, note: content });
      router.replace(`/note/${id}`);
    },
    [db, noteId, id, isValidId, router]
  );

  const handleBackToPreviousScreen = useCallback(() => {
    router.replace(backTarget as never);
  }, [backTarget, router]);

  useHardwareBackHandler(handleBackToPreviousScreen);

  if (note === 'loading') {
    return <ScreenLoadingState />;
  }

  if (note === null) {
    return <ScreenNotFoundState title="Edit note" message="Note not found." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit note',
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton onPress={handleBackToPreviousScreen} accessibilityLabel="Back" />
          ),
        }}
      />
      <NoteForm initialTitle={note.title} initialContent={note.note} onSave={handleSave} />
    </>
  );
}
