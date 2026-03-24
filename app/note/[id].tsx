import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { deleteNote, getNoteById, type Note } from '@/lib/dataStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, PencilIcon, Trash2Icon } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  View,
} from 'react-native';

export default function NoteViewScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
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

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        router.replace('/');
        return true;
      });
      return () => subscription.remove();
    }, [router])
  );

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
