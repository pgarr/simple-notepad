import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllNotes } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

export default function Screen() {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof getAllNotes>>>([]);

  const loadNotes = useCallback(async () => {
    const list = await getAllNotes(db);
    setNotes(list);
  }, [db]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return (
    <>
      <Stack.Screen options={{ title: 'Notes' }} />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-3">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </ScrollView>
    </>
  );
}
