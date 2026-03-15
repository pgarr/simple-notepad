import { Text } from '@/components/ui/text';
import { getNoteById, type Note } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

export default function NoteViewScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null | 'loading'>('loading');

  const loadNote = useCallback(async () => {
    const numId = id != null ? Number(id) : NaN;
    if (Number.isNaN(numId)) {
      setNote(null);
      return;
    }
    const found = await getNoteById(db, numId);
    setNote(found);
  }, [db, id]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

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
        <Stack.Screen options={{ title: 'Note' }} />
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
          title: note.title,
          headerBackVisible: true,
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
