import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { View } from 'react-native';

type ScreenNotFoundStateProps = {
  title: string;
  message: string;
};

export function ScreenNotFoundState({
  title,
  message,
}: ScreenNotFoundStateProps) {
  return (
    <>
      <Stack.Screen options={{ title }} />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">{message}</Text>
      </View>
    </>
  );
}
