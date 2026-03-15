import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useCallback, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Extra space above Android keyboard for the input accessory bar (emoji, mic, etc.). */
const ANDROID_KEYBOARD_ACCESSORY_OFFSET = 52;

type NoteFormProps = {
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => Promise<void>;
  submitLabel?: string;
};

export function NoteForm({
  initialTitle = '',
  initialContent = '',
  onSave,
  submitLabel = 'Save',
}: NoteFormProps) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(initialTitle);
  const [noteContent, setNoteContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [keyboardAccessoryPadding, setKeyboardAccessoryPadding] = useState(0);

  useEffect(() => {
    setTitle(initialTitle);
    setNoteContent(initialContent);
  }, [initialTitle, initialContent]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardAccessoryPadding(ANDROID_KEYBOARD_ACCESSORY_OFFSET);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardAccessoryPadding(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSaving(true);
    try {
      await onSave(trimmedTitle, noteContent.trim());
    } finally {
      setSaving(false);
    }
  }, [title, noteContent, onSave]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 gap-3 p-4 min-h-[200px]">
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
          style={{
            paddingBottom:
              insets.bottom + 12 + keyboardAccessoryPadding,
          }}
        >
          <Button onPress={handleSave} disabled={saving} className="w-full">
            <Text>{submitLabel}</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
