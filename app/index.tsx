import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { getAllNotes } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { PlusIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export default function Screen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof getAllNotes>>>([]);

  const loadNotes = useCallback(async () => {
    const list = await getAllNotes(db);
    setNotes(list);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notes',
          headerBackVisible: false,
          headerRight: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.push('/add-note')}
              accessibilityLabel="Add note"
            >
              <Icon as={PlusIcon} className="size-6 text-foreground" />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-3 pb-2">
        {notes.map((note) => (
          <Pressable
            key={note.id}
            onPress={() => router.push(`/note/${note.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open note: ${note.title}`}
          >
            <Card>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
              </CardHeader>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}
