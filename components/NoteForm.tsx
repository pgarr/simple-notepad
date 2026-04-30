import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

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
  const [title, setTitle] = useState(initialTitle);
  const [noteContent, setNoteContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setNoteContent(initialContent);
  }, [initialTitle, initialContent]);

  const { paddingBottom } = useKeyboardOffset();

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
      keyboardVerticalOffset={0}>
      <View className="flex-1">
        <View className="min-h-[200px] flex-1 gap-3 py-4">
          <View className="border-b border-border px-4">
            <Input
              className="mb-4 w-full"
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              editable={!saving}
            />
          </View>
          <View className="flex-1 px-4">
            <Textarea
              className="min-h-[120px] w-full flex-1"
              placeholder="Note content"
              value={noteContent}
              onChangeText={setNoteContent}
              editable={!saving}
            />
          </View>
        </View>
        <View
          className="border-t border-border bg-background px-4 py-3"
          style={{
            paddingBottom,
          }}>
          <Button onPress={handleSave} disabled={saving} className="w-full">
            <Text>{submitLabel}</Text>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
