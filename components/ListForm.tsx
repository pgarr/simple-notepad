import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import { ListItem } from '@/lib/dataStorage';
import { Trash2Icon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

type NoteFormProps = {
  initialTitle?: string;
  initialItems?: ListItem[];
  onSave: (title: string, items: ListItem[]) => Promise<void>;
  submitLabel?: string;
};

export function ListForm({
  initialTitle = '',
  initialItems = [],
  onSave,
  submitLabel = 'Save',
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);

  const { paddingBottom } = useKeyboardOffset();

  const handleAddRow = useCallback(() => {
    setItems((current) => [...current, { checked: false, text: '' }]);
  }, []);

  const handleUpdateRow = useCallback((index: number, text: string) => {
    setItems((current) =>
      current.map((item, currentIndex) => (currentIndex === index ? { ...item, text } : item))
    );
  }, []);

  const handleDeleteRow = useCallback((index: number) => {
    setItems((current) => current.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSaving(true);
    try {
      await onSave(
        trimmedTitle,
        items.map((item) => ({ ...item, text: item.text.trim() }))
      );
    } finally {
      setSaving(false);
    }
  }, [title, items, onSave]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
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
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 gap-3 px-4">
            {items.map((item, index) => (
              <View key={`row-${index}`} className="flex-row items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder={`Item ${index + 1}`}
                  value={item.text}
                  onChangeText={(text) => handleUpdateRow(index, text)}
                  editable={!saving}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => handleDeleteRow(index)}
                  disabled={saving}
                  accessibilityLabel={`Delete item ${index + 1}`}>
                  <Icon as={Trash2Icon} className="size-5 text-destructive" />
                </Button>
              </View>
            ))}
            <Button variant="outline" onPress={handleAddRow} disabled={saving}>
              <Text>Add</Text>
            </Button>
          </View>
        </ScrollView>
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
    </KeyboardAvoidingView>
  );
}
