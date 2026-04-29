import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

type ScreenLoadingStateProps = {
  title?: string;
};

export function ScreenLoadingState({ title = '…' }: ScreenLoadingStateProps) {
  return (
    <>
      <Stack.Screen options={{ title }} />
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    </>
  );
}
