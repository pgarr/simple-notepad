import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

export function useHardwareBackHandler(onBackPress: () => void) {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        onBackPress();
        return true;
      });
      return () => subscription.remove();
    }, [onBackPress])
  );
}
