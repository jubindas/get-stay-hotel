import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const BookingSkeletonItem = () => {
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
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      {/* Top Ref & Status Bar */}
      <View style={styles.topRow}>
        <View style={[styles.skeletonBlock, { width: 100, height: 22, borderRadius: 6 }]} />
        <View style={styles.statusRow}>
          <View style={[styles.skeletonBlock, { width: 70, height: 20, borderRadius: 12 }]} />
          <View style={[styles.skeletonBlock, { width: 50, height: 20, borderRadius: 12, marginLeft: 6 }]} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Main Content Area */}
      <View style={styles.bodyRow}>
        <View style={[styles.skeletonBlock, { width: 72, height: 72, borderRadius: 14 }]} />
        <View style={styles.bodyContent}>
          <View style={[styles.skeletonBlock, { width: "80%", height: 18, borderRadius: 4, marginBottom: 8 }]} />
          <View style={[styles.skeletonBlock, { width: "60%", height: 14, borderRadius: 4, marginBottom: 8 }]} />
          <View style={[styles.skeletonBlock, { width: "45%", height: 14, borderRadius: 4 }]} />
        </View>
      </View>

      {/* Dates Box */}
      <View style={styles.datesBox}>
        <View style={{ flex: 1 }}>
          <View style={[styles.skeletonBlock, { width: 50, height: 11, borderRadius: 3, marginBottom: 4 }]} />
          <View style={[styles.skeletonBlock, { width: 90, height: 14, borderRadius: 4 }]} />
        </View>
        <View style={styles.datesArrow}>
          <View style={[styles.skeletonBlock, { width: 24, height: 14, borderRadius: 4 }]} />
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <View style={[styles.skeletonBlock, { width: 50, height: 11, borderRadius: 3, marginBottom: 4 }]} />
          <View style={[styles.skeletonBlock, { width: 90, height: 14, borderRadius: 4 }]} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer Price & Action */}
      <View style={styles.footerRow}>
        <View>
          <View style={[styles.skeletonBlock, { width: 70, height: 12, borderRadius: 3, marginBottom: 4 }]} />
          <View style={[styles.skeletonBlock, { width: 90, height: 20, borderRadius: 4 }]} />
        </View>
        <View style={[styles.skeletonBlock, { width: 110, height: 36, borderRadius: 10 }]} />
      </View>
    </Animated.View>
  );
};

export default function BookingSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <BookingSkeletonItem key={`skeleton-booking-${index}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    shadowColor: "#0F1C2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  skeletonBlock: {
    backgroundColor: "#E2E8F0",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bodyContent: {
    flex: 1,
    marginLeft: 14,
  },
  datesBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
  },
  datesArrow: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
});
