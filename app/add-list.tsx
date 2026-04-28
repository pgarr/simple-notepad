import { HeaderBackButton } from '@/components/navigation/HeaderBackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useHardwareBackHandler } from '@/hooks/useHardwareBackHandler';
import { addList, type ListItem } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export default function AddListScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [saving, setSaving] = useState(false);

  const handleAddRow = useCallback(() => {
    setItems((current) => [...current, { checked: false, text: '' }]);
  }, []);

  const handleUpdateRow = useCallback((index: number, text: string) => {
    setItems((current) =>
      current.map((item, currentIndex) => (currentIndex === index ? { ...item, text } : item))
    );
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || saving) return;
    const sanitizedItems = items
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);
    setSaving(true);
    try {
      await addList(db, { title: trimmedTitle, items: sanitizedItems });
      router.replace('/');
    } finally {
      setSaving(false);
    }
  }, [db, items, router, saving, title]);

  useHardwareBackHandler(() => {
    router.replace('/');
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New list',
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.replace('/')}
              accessibilityLabel="Back to notes"
            />
          ),
        }}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView className="flex-1" contentContainerClassName="gap-3 p-4 pb-8">
          <Input
            className="w-full"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            editable={!saving}
          />
          {items.map((item, index) => (
            <Input
              key={`row-${index}`}
              className="w-full"
              placeholder={`Item ${index + 1}`}
              value={item.text}
              onChangeText={(text) => handleUpdateRow(index, text)}
              editable={!saving}
            />
          ))}
          <Button variant="outline" onPress={handleAddRow} disabled={saving}>
            <Text>Add</Text>
          </Button>
          <Button onPress={handleSave} disabled={saving}>
            <Text>Save</Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
