import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { NoteForm } from '@/components/NoteForm';
import { Text } from '@/components/ui/text';
import { useHardwareBackHandler } from '@/hooks/useHardwareBackHandler';
import { useParsedNumericRouteParam } from '@/hooks/useParsedNumericRouteParam';
import { LIST_TYPE, getNoteById, updateNote, type Note } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function EditNoteScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { rawValue: id, value: noteId, isValid: isValidId } =
    useParsedNumericRouteParam('id');
  const [note, setNote] = useState<Note | null | 'loading'>('loading');

  const backTarget = isValidId ? `/note/${id}` : '/';

  const loadNote = useCallback(async () => {
    if (!isValidId) {
      setNote(null);
      return;
    }
    const found = await getNoteById(db, noteId);
    if (found?.type === LIST_TYPE) {
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
    return (
      <>
        <Stack.Screen options={{ title: '…' }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </>
    );
  }

  if (note === null) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit note' }} />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-muted-foreground">Note not found.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit note',
          headerBackVisible: false,
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={handleBackToPreviousScreen}
              accessibilityLabel="Back"
            >
              <Icon as={ArrowLeft} className="size-5" />
            </Button>
          ),
        }}
      />
      <NoteForm
        initialTitle={note.title}
        initialContent={note.note}
        onSave={handleSave}
      />
    </>
  );
}
