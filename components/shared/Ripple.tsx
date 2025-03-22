import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { measure, runOnJS, useAnimatedRef, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface IRippleProps {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  rippleColor: string;
  rippleOpacity: number;
  duration: number;
}

const Ripple: React.FC<React.PropsWithChildren<IRippleProps>> = ({
  style,
  onPress,
  rippleColor,
  rippleOpacity,
  duration,
  children,
}) => {
  const centerX = useSharedValue(0);
  const centerY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(rippleOpacity);

  const aRef = useAnimatedRef<View>();
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const tapGesture = Gesture.Tap()
    .onBegin((e) => {
      const layout = measure(aRef);
      width.value = layout!.width;
      height.value = layout!.height;

      centerX.value = e.x;
      centerY.value = e.y;

      opacity.value = rippleOpacity;
      scale.value = 0;
      scale.value = withTiming(1, { duration: duration });
    })
    .onStart(() => {
      if (onPress) runOnJS(onPress)();
    })
    .onFinalize(() => {
      opacity.value = withTiming(0, { duration: duration });
    });

  const rippleStyle = useAnimatedStyle(() => {
    const radius = Math.sqrt(width.value ** 2 + height.value ** 2);

    const translateX = centerX.value - radius;
    const translateY = centerY.value - radius;

    return {
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
      backgroundColor: rippleColor,
      position: "absolute",
      top: 0,
      left: 0,
      opacity: opacity.value,
      transform: [
        { translateX },
        { translateY },
        {
          scale: scale.value,
        },
      ],
    };
  });

  return (
    <View ref={aRef} collapsable={false} style={style}>
      <GestureHandlerRootView>
        <GestureDetector gesture={tapGesture}>
          <Animated.View style={[{ overflow: "hidden" }]}>
            <View>{children}</View>
            <Animated.View style={rippleStyle} />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  );
};

export default Ripple;
