import { Toast, useToastState } from '@tamagui/toast';
import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { YStack, isWeb, useTheme } from 'tamagui';

export type ToastType = "error" | "success" | "warning" | "info" | "small" | "smallErr";

export function CurrentToast() {
  const toast = useToastState();

  if (!toast || toast.isHandledNatively) return null;

  if (toast.type === 'smallErr') {
    return <SmallBottomToast message='Please try again later' />;
  }

  if (toast.type === 'small') {
    return <SmallBottomToast />;
  }

  return <DefaultToast />;
}

export function SmallBottomToast(prop: { message?: string; }) {
  const toast = useToastState();

  // Only render if there's a toast message that you intend for this style
  if (!toast || toast.isHandledNatively) return null;

  return (
    <Toast
      key={toast.id}
      duration={toast.duration}
      viewportName='bottom'
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={isWeb ? '$12' : 0}
      p={0}
      br={toast.message ? '$6' : 999999}
      animation="quick"
      mx='$5'
      maw='90%'
      overflow='hidden'
    >
      <YStack ai="center" py="$3" px='$5'>
        <Toast.Title fos='$4'>{toast.title}</Toast.Title>
        {(toast.message || prop.message) && (
          <Toast.Description fos='$3'>
            {toast.message ? toast.message : prop.message}
          </Toast.Description>
        )}
      </YStack>
    </Toast>
  );
}

export function DefaultToast() {

  const toast = useToastState();
  const theme = useTheme();
  const progress = useSharedValue(100);

  useEffect(() => {
    if (!toast || toast.isHandledNatively) return;

    progress.value = 100; // reset
    const duration = toast.duration ?? 6000;

    // Animate to 0
    progress.value = withTiming(0, { duration });

    return () => {
      progress.value = 0;
    };
  }, [toast?.id]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  if (!toast || toast.isHandledNatively) return null;

  return (
    <Toast
      key={toast.id}
      duration={toast.duration}
      viewportName={toast.viewportName}
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={isWeb ? '$12' : 0}
      p={0}
      br="$6"
      animation="quick"
      mx='$5'
      maw='90%'
      overflow='hidden'
    >
      <YStack pt="$3" pb='$2' px='$5' gap="$2">
        <Toast.Title fontWeight="bold" fos='$5'>{toast.title}</Toast.Title>
        {!!toast.message && (
          <Toast.Description fos='$3'>{toast.message}</Toast.Description>
        )}
      </YStack>
      <Animated.View
        style={[
          {
            height: 4,
            backgroundColor: theme.accentBackground.val,
            borderRadius: 999,
            alignSelf: 'flex-start',
          },
          progressStyle,
        ]}
      />
    </Toast>
  );
};