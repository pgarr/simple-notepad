import { HeaderBackButton } from '@/components/navigation/HeaderBackButton';
import { ScreenLoadingState } from '@/components/state/ScreenLoadingState';
import { ScreenNotFoundState } from '@/components/state/ScreenNotFoundState';
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
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { ListForm } from '@/components/ListForm';

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
    setList({ title: content.title, items: loadedItems });
  }, [db, isValidId, listId]);

  useFocusEffect(
    useCallback(() => {
      loadList();
    }, [loadList])
  );

  useEffect(() => {
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        loadList();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [loadList]);

  const handleBackToPreviousScreen = useCallback(() => {
    router.replace(backTarget as never);
  }, [backTarget, router]);

  const handleSave = useCallback(
    async (title: string, items: ListItem[]) => {
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
    },
    [db, id, isValidId, listId, router, saving]
  );

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
            <HeaderBackButton onPress={handleBackToPreviousScreen} accessibilityLabel="Back" />
          ),
        }}
      />
      <ListForm initialTitle={list.title} initialItems={list.items} onSave={handleSave} />
    </>
  );
}
