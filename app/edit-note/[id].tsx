import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { NoteForm } from '@/components/NoteForm';
import { Text } from '@/components/ui/text';
import {
  getNoteById,
  updateNote,
  type Note,
} from '@/lib/dataStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';

export default function EditNoteScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null | 'loading'>('loading');

  const numId = id != null ? Number(id) : NaN;
  const isValidId = !Number.isNaN(numId);
  const backTarget = isValidId ? `/note/${id}` : '/';

  const loadNote = useCallback(async () => {
    if (!isValidId) {
      setNote(null);
      return;
    }
    const found = await getNoteById(db, numId);
    setNote(found);
  }, [db, numId, isValidId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleSave = useCallback(
    async (title: string, content: string) => {
      if (!isValidId) return;
      await updateNote(db, numId, { title, note: content });
      router.replace(`/note/${id}`);
    },
    [db, numId, id, isValidId, router]
  );

  const handleBackToPreviousScreen = useCallback(() => {
    router.replace(backTarget);
  }, [backTarget, router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBackToPreviousScreen();
        return true;
      });
      return () => subscription.remove();
    }, [handleBackToPreviousScreen])
  );

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
