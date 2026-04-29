import { HeaderBackButton } from '@/components/navigation/HeaderBackButton';
import { ScreenLoadingState } from '@/components/state/ScreenLoadingState';
import { ScreenNotFoundState } from '@/components/state/ScreenNotFoundState';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHardwareBackHandler } from '@/hooks/useHardwareBackHandler';
import { useParsedNumericRouteParam } from '@/hooks/useParsedNumericRouteParam';
import { LIST_TYPE, deleteNote, getNoteById, type Note } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { PencilIcon, Trash2Icon } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function NoteViewScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { value: noteId, isValid: isValidId } = useParsedNumericRouteParam('id');
  const [note, setNote] = useState<Note | null | 'loading'>('loading');

  const loadNote = useCallback(async () => {
    if (!isValidId) {
      setNote(null);
      return;
    }
    const found = await getNoteById(db, noteId);
    if (found?.type === LIST_TYPE) {
      router.replace(`/list/${noteId}` as never);
      return;
    }
    setNote(found);
  }, [db, isValidId, noteId, router]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  useHardwareBackHandler(() => {
    router.replace('/');
  });

  const handleDeletePress = useCallback(() => {
    if (note === null || note === 'loading') return;
    Alert.alert(
      'Delete note',
      'Are you sure you want to delete this note?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(db, note.id);
            router.replace('/');
          },
        },
      ]
    );
  }, [db, note, router]);

  if (note === 'loading') {
    return <ScreenLoadingState />;
  }

  if (note === null) {
    return <ScreenNotFoundState title="Note" message="Note not found." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: note.title,
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.replace('/')}
              accessibilityLabel="Back to notes"
            />
          ),
          headerRight: () => (
            <View className="flex-row items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onPress={() => router.push(`/edit-note/${note.id}`)}
                accessibilityLabel="Edit note"
              >
                <Icon as={PencilIcon} className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onPress={handleDeletePress}
                accessibilityLabel="Delete note"
              >
                <Icon as={Trash2Icon} className="size-5" />
              </Button>
            </View>
          ),
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Text className="text-foreground" variant="p">
          {note.note || ' '}
        </Text>
      </ScrollView>
    </>
  );
}
