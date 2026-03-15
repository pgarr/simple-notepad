import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import {
  getNoteById,
  updateNote,
  type Note,
} from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditNoteScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null | 'loading'>('loading');
  const [title, setTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);

  const numId = id != null ? Number(id) : NaN;
  const isValidId = !Number.isNaN(numId);

  const loadNote = useCallback(async () => {
    if (!isValidId) {
      setNote(null);
      return;
    }
    const found = await getNoteById(db, numId);
    setNote(found);
    if (found) {
      setTitle(found.title);
      setNoteContent(found.note);
    }
  }, [db, numId, isValidId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !isValidId) return;
    setSaving(true);
    try {
      await updateNote(db, numId, {
        title: trimmedTitle,
        note: noteContent.trim(),
      });
      router.replace(`/note/${id}`);
    } finally {
      setSaving(false);
    }
  };

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
              onPress={() => router.back()}
              accessibilityLabel="Back"
            >
              <Icon as={ArrowLeft} className="size-5" />
            </Button>
          ),
        }}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 gap-3 p-4">
          <Input
            className="w-full"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            editable={!saving}
          />
          <Textarea
            className="flex-1 w-full min-h-[120px]"
            placeholder="Note content"
            value={noteContent}
            onChangeText={setNoteContent}
            editable={!saving}
          />
        </View>
        <View
          className="border-t border-border bg-background px-4 py-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button onPress={handleSave} disabled={saving} className="w-full">
            <Text>Save</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
