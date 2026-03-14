import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { getAllNotes } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon } from 'lucide-react-native';

export default function Screen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      <Stack.Screen options={{ title: 'Notes' }} />
      <View className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="p-4 gap-3 pb-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </ScrollView>
        <View
          className="border-t border-border bg-background px-4 py-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button
            onPress={() => router.push('/add-note')}
            size="icon"
            className="self-center"
            accessibilityLabel="Add note"
          >
            <Icon as={PlusIcon} className="size-6" />
          </Button>
        </View>
      </View>
    </>
  );
}
