import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Extra space above Android keyboard for the input accessory bar (emoji, mic, etc.). */
const ANDROID_KEYBOARD_ACCESSORY_OFFSET = 52;

export const useKeyboardOffset = () => {
  const insets = useSafeAreaInsets();
  const [keyboardAccessoryPadding, setKeyboardAccessoryPadding] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardAccessoryPadding(ANDROID_KEYBOARD_ACCESSORY_OFFSET);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardAccessoryPadding(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return { paddingBottom: insets.bottom + 12 + keyboardAccessoryPadding };
};
