import { HeaderBackButton } from '@/components/navigation/HeaderBackButton';
import { ScreenLoadingState } from '@/components/state/ScreenLoadingState';
import { ScreenNotFoundState } from '@/components/state/ScreenNotFoundState';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHardwareBackHandler } from '@/hooks/useHardwareBackHandler';
import { useParsedNumericRouteParam } from '@/hooks/useParsedNumericRouteParam';
import {
  LIST_TYPE,
  getListItemsById,
  getNoteById,
  type ListItem,
  updateListItems,
  deletePosition,
} from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { CheckSquare2, ListChecks, PencilIcon, Square, Trash2Icon } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

type ListViewState =
  | 'loading'
  | {
      id: number;
      title: string;
      items: ListItem[];
    }
  | null;

export default function ListViewScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { value: listId, isValid: isValidId } = useParsedNumericRouteParam('id');
  const [listView, setListView] = useState<ListViewState>('loading');

  const loadList = useCallback(async () => {
    if (!isValidId) {
      setListView(null);
      return;
    }

    const content = await getNoteById(db, listId);
    if (!content || content.type !== LIST_TYPE) {
      setListView(null);
      return;
    }

    const items = (await getListItemsById(db, listId)) ?? [];
    setListView({ id: listId, title: content.title, items });
  }, [db, isValidId, listId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useHardwareBackHandler(() => {
    router.replace('/');
  });

  const handleToggleItem = useCallback(
    async (index: number) => {
      if (listView === 'loading' || listView === null) return;
      const updatedItems = listView.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, checked: !item.checked } : item
      );
      setListView({ ...listView, items: updatedItems });
      await updateListItems(db, listView.id, updatedItems);
    },
    [db, listView]
  );

  const handleToggleAllChecked = useCallback(async () => {
    if (listView === 'loading' || listView === null || listView.items.length === 0) return;
    const allChecked = listView.items.every((item) => item.checked);
    const updatedItems = listView.items.map((item) => ({ ...item, checked: !allChecked }));
    setListView({ ...listView, items: updatedItems });
    await updateListItems(db, listView.id, updatedItems);
  }, [db, listView]);

  const handleDeletePress = useCallback(() => {
    if (listView === null || listView === 'loading') return;
    Alert.alert('Delete list', 'Are you sure you want to delete this list?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          await deletePosition(db, listView.id);
          router.replace('/');
        },
      },
    ]);
  }, [db, listView, router]);

  if (listView === 'loading') {
    return <ScreenLoadingState />;
  }

  if (listView === null) {
    return <ScreenNotFoundState title="List" message="List not found." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: listView.title,
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.replace('/')}
              accessibilityLabel="Back to notes"
            />
          ),
          headerRight: () => {
            const allChecked =
              listView.items.length > 0 && listView.items.every((item) => item.checked);
            return (
              <View className="flex-row items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={listView.items.length === 0}
                  onPress={() => void handleToggleAllChecked()}
                  accessibilityLabel={allChecked ? 'Uncheck all items' : 'Check all items'}>
                  <Icon as={ListChecks} className="size-5" />
                </Button>
                <View className="flex-row items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onPress={() => router.push(`/edit-list/${listView.id}` as never)}
                    accessibilityLabel="Edit list">
                    <Icon as={PencilIcon} className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onPress={handleDeletePress}
                    accessibilityLabel="Delete list">
                    <Icon as={Trash2Icon} className="size-5" />
                  </Button>
                </View>
              </View>
            );
          },
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="gap-2 p-4">
        {listView.items.map((item, index) => (
          <Pressable
            key={`${listView.id}-${index}`}
            className="flex-row items-center gap-3 rounded-md border border-border px-3 py-2"
            onPress={() => void handleToggleItem(index)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.checked }}>
            <Icon as={item.checked ? CheckSquare2 : Square} className="size-5 text-foreground" />
            <Text className={item.checked ? 'text-muted-foreground line-through' : ''}>
              {item.text}
            </Text>
          </Pressable>
        ))}
        {listView.items.length === 0 ? (
          <Text className="text-muted-foreground">This list is empty.</Text>
        ) : null}
      </ScrollView>
    </>
  );
}
