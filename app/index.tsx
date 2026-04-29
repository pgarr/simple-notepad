import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { AddContentDropdown } from '@/components/AddContentDropdown';
import { LIST_TYPE, getAllNotes } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { PlusIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { BackHandler, Pressable, ScrollView } from 'react-native';

export default function Screen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof getAllNotes>>>([]);
  const [showAddOptions, setShowAddOptions] = useState(false);

  const loadNotes = useCallback(async () => {
    const list = await getAllNotes(db);
    setNotes(list);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        BackHandler.exitApp();
        return true;
      });
      return () => subscription.remove();
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
              onPress={() => setShowAddOptions((current) => !current)}
              accessibilityLabel="Add note"
            >
              <Icon as={PlusIcon} className="size-6 text-foreground" />
            </Button>
          ),
        }}
      />
      <AddContentDropdown
        visible={showAddOptions}
        onClose={() => setShowAddOptions(false)}
        onSelectNote={() => {
          setShowAddOptions(false);
          router.push('/add-note');
        }}
        onSelectList={() => {
          setShowAddOptions(false);
          router.push('/add-list' as never);
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-3 pb-2">
        {notes.map((note) => (
          <Pressable
            key={note.id}
            onPress={() =>
              router.push(
                (note.type === LIST_TYPE ? `/list/${note.id}` : `/note/${note.id}`) as never
              )
            }
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
