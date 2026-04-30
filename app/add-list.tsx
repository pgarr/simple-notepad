import { HeaderBackButton } from '@/components/navigation/HeaderBackButton';
import { useHardwareBackHandler } from '@/hooks/useHardwareBackHandler';
import { addList, type ListItem } from '@/lib/dataStorage';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ListForm } from '@/components/ListForm';

export default function AddListScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const handleSave = useCallback(
    async (title: string, items: ListItem[]) => {
      await addList(db, { title, items });
      router.replace('/');
    },
    [db, router]
  );

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
      <ListForm onSave={handleSave} />
    </>
  );
}
