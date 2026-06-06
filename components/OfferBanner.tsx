import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  ImageStyle,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import Animated, {
  Easing,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface OfferBannerProps {
  onPress?: (index: number) => void;
}

interface PaginationDotProps {
  active: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 40;

const IMAGES = [
  "https://i.pinimg.com/1200x/cf/1d/b8/cf1db89fc8b650f69258258cb3423655.jpg",
  "https://i.pinimg.com/1200x/40/c5/5b/40c55b9592d61cd56df9f408c3d54a2b.jpg",
  "https://i.pinimg.com/1200x/ac/b5/d0/acb5d04d3f6c0b1ba49cc000a15d5db5.jpg",
];

function PaginationDot({ active }: PaginationDotProps) {
  const dotStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(active ? 22 : 8, { duration: 300 }),
      opacity: withTiming(active ? 1 : 0.45, { duration: 300 }),
      backgroundColor: active ? "#ffffff" : "#cbd5e1",
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

export default function OfferBanner({ onPress }: OfferBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rotation = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const translateX = useSharedValue(0);

  const startAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % IMAGES.length);
    }, 3000);
  }, []);

  useEffect(() => {
    startAutoSlide();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoSlide]);

  useEffect(() => {
    translateX.value = withTiming(activeIndex * -BANNER_WIDTH, {
      duration: 700,
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    });
  }, [activeIndex]);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 25000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => cancelAnimation(rotation);
  }, []);

  const slidingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: 1.08 }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressScale.value) }],
  }));

  const handlePress = () => {
    onPress?.(activeIndex);
    startAutoSlide();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInDown.delay(150).duration(900).springify()}
        style={[styles.mainWrapper, containerAnimatedStyle]}
      >
        <Pressable
          style={styles.pressableArea}
          onPress={handlePress}
          onPressIn={() => {
            pressScale.value = 0.97;
          }}
          onPressOut={() => {
            pressScale.value = 1;
          }}
        >
          <Animated.View style={[styles.imageStrip, slidingStyle]}>
            {IMAGES.map((img, index) => (
              <ImageBackground
                key={index}
                source={{ uri: img }}
                style={styles.backgroundImage}
                imageStyle={styles.backgroundImageStyle}
              >
                <Animated.View style={[styles.floatingShape, floatingStyle]} />

                <View style={styles.overlay} />
              </ImageBackground>
            ))}
          </Animated.View>

          <View style={styles.pagination}>
            {IMAGES.map((_, i) => (
              <PaginationDot key={i} active={activeIndex === i} />
            ))}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    alignItems: "center",
  } as ViewStyle,

  mainWrapper: {
    width: BANNER_WIDTH,
    height: 180,
    borderRadius: 24,
    backgroundColor: "#0f172a",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  } as ViewStyle,

  pressableArea: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  } as ViewStyle,

  imageStrip: {
    flexDirection: "row",
    width: BANNER_WIDTH * IMAGES.length,
    flex: 1,
  } as ViewStyle,

  backgroundImage: {
    width: BANNER_WIDTH,
    height: "100%",
    justifyContent: "flex-end",
  } as ViewStyle,

  backgroundImageStyle: {
    resizeMode: "cover",
  } as ImageStyle,

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  } as ViewStyle,

  floatingShape: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 25,
    borderColor: "rgba(255,255,255,0.12)",
  } as ViewStyle,

  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 16,
    left: 20,
  } as ViewStyle,

  dot: {
    height: 8,
    borderRadius: 20,
    marginHorizontal: 3,
  } as ViewStyle,
});
