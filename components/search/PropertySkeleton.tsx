import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const PropertySkeletonItem = () => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.4, { duration: 750 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={[styles.skeletonBlock, styles.image]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.skeletonBlock, { width: 70, height: 16, borderRadius: 12 }]} />
          <View style={[styles.skeletonBlock, { width: 50, height: 16, borderRadius: 12 }]} />
        </View>

        <View style={[styles.skeletonBlock, { width: "85%", height: 18, borderRadius: 4, marginTop: 8 }]} />
        <View style={[styles.skeletonBlock, { width: "65%", height: 13, borderRadius: 4, marginTop: 6 }]} />

        <View style={styles.footerRow}>
          <View style={[styles.skeletonBlock, { width: 90, height: 20, borderRadius: 4 }]} />
          <View style={[styles.skeletonBlock, { width: 75, height: 32, borderRadius: 10 }]} />
        </View>
      </View>
    </Animated.View>
  );
};

export default function PropertySkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <PropertySkeletonItem key={`property-skel-${idx}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonBlock: {
    backgroundColor: "#E2E8F0",
  },
  image: {
    width: 105,
    height: 115,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
});
