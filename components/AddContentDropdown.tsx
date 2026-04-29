import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';

type AddContentDropdownProps = {
  visible: boolean;
  onClose: () => void;
  onSelectNote: () => void;
  onSelectList: () => void;
};

export function AddContentDropdown({
  visible,
  onClose,
  onSelectNote,
  onSelectList,
}: AddContentDropdownProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-10">
      <Pressable className="flex-1" onPress={onClose} />
      <View className="absolute right-4 top-4 rounded-md border border-border bg-background p-1 shadow-sm shadow-black/20">
        <Button variant="ghost" className="justify-start" onPress={onSelectNote}>
          <Text>Note</Text>
        </Button>
        <Button variant="ghost" className="justify-start" onPress={onSelectList}>
          <Text>List</Text>
        </Button>
      </View>
    </View>
  );
}
