import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft } from 'lucide-react-native';

type HeaderBackButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
};

export function HeaderBackButton({
  onPress,
  accessibilityLabel = 'Back',
}: HeaderBackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <Icon as={ArrowLeft} className="size-5" />
    </Button>
  );
}
