import { NoteForm } from '@/components/NoteForm';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useHardwareBackHandler } from '@/hooks/useHardwareBackHandler';
import { addNote } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCallback } from 'react';

export default function AddNoteScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const handleSave = useCallback(
    async (title: string, content: string) => {
      await addNote(db, { title, note: content });
      router.replace('/');
    },
    [db, router]
  );

  useHardwareBackHandler(() => {
    router.replace('/');
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New note',
          headerBackVisible: false,
          headerLeft: () => (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.replace('/')}
              accessibilityLabel="Back to notes"
            >
              <Icon as={ArrowLeft} className="size-5" />
            </Button>
          ),
        }}
      />
      <NoteForm onSave={handleSave} />
    </>
  );
}
