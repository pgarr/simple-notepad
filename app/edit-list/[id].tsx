import { HeaderBackButton } from '@/components/navigation/HeaderBackButton';
import { ScreenLoadingState } from '@/components/state/ScreenLoadingState';
import { ScreenNotFoundState } from '@/components/state/ScreenNotFoundState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useHardwareBackHandler } from '@/hooks/useHardwareBackHandler';
import { useParsedNumericRouteParam } from '@/hooks/useParsedNumericRouteParam';
import {
  LIST_TYPE,
  getListItemsById,
  getNoteById,
  type ListItem,
  updateList,
} from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

type ListEditState =
  | 'loading'
  | {
      title: string;
      items: ListItem[];
    }
  | null;

export default function EditListScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { rawValue: id, value: listId, isValid: isValidId } = useParsedNumericRouteParam('id');
  const [list, setList] = useState<ListEditState>('loading');
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [saving, setSaving] = useState(false);

  const backTarget = isValidId ? `/list/${id}` : '/';

  const loadList = useCallback(async () => {
    if (!isValidId) {
      setList(null);
      return;
    }

    const content = await getNoteById(db, listId);
    if (!content || content.type !== LIST_TYPE) {
      setList(null);
      return;
    }

    const loadedItems = (await getListItemsById(db, listId)) ?? [];
    setTitle(content.title);
    setItems(loadedItems);
    setList({ title: content.title, items: loadedItems });
  }, [db, isValidId, listId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleBackToPreviousScreen = useCallback(() => {
    router.replace(backTarget as never);
  }, [backTarget, router]);

  const handleAddRow = useCallback(() => {
    setItems((current) => [...current, { checked: false, text: '' }]);
  }, []);

  const handleUpdateRow = useCallback((index: number, text: string) => {
    setItems((current) =>
      current.map((item, currentIndex) => (currentIndex === index ? { ...item, text } : item))
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!isValidId || saving) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const sanitizedItems = items
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);

    setSaving(true);
    try {
      await updateList(db, listId, { title: trimmedTitle, items: sanitizedItems });
      router.replace(`/list/${id}`);
    } finally {
      setSaving(false);
    }
  }, [db, id, isValidId, items, listId, router, saving, title]);

  useHardwareBackHandler(handleBackToPreviousScreen);

  if (list === 'loading') {
    return <ScreenLoadingState />;
  }

  if (list === null) {
    return <ScreenNotFoundState title="Edit list" message="List not found." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit list',
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              onPress={handleBackToPreviousScreen}
              accessibilityLabel="Back"
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
