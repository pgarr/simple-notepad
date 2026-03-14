import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { addNote } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddNoteScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSaving(true);
    try {
      await addNote(db, { title: trimmedTitle, note: noteContent.trim() });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New note' }} />
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
