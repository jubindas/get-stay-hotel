import { getRoomCategories } from "@/services/propertyService";
import { PublicRoomCategoryItem } from "@/types/property";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const COLORS = {
  navy: "#0F172A",
  navyMid: "#1E293B",
  gold: "#C9A84C",
  goldLight: "#F5EBCB",
  white: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  green: "#10B981",
  greenLight: "#ECFDF5",
};

export default function RoomCategories() {
  const [categories, setCategories] = useState<PublicRoomCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoomCategories = async () => {
      try {
        const responseData = await getRoomCategories();
        let items: PublicRoomCategoryItem[] = [];

        if (Array.isArray(responseData)) {
          items = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          items = responseData.data;
        } else if (responseData && Array.isArray(responseData.categories)) {
          items = responseData.categories;
        } else if (responseData && Array.isArray(responseData.room_categories)) {
          items = responseData.room_categories;
        }

        setCategories(items);
      } catch (error) {
        console.error("Error fetching room categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomCategories();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bed-sharp" size={20} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Room Types & Suites</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/rooms-list")}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>Browse</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <RoomCategorySkeleton key={`room-cat-skel-${idx}`} index={idx} />
          ))
        ) : categories.length === 0 ? (
          /* Default Fallback Room Categories if API is empty */
          <>
            <RoomCategoryCard
              item={{
                id: "default-1",
                name: "Deluxe Suite",
                description: "Spacious luxury room with balcony view",
              }}
              index={0}
            />
            <RoomCategoryCard
              item={{
                id: "default-2",
                name: "Executive King",
                description: "Premium king bed suite with working desk",
              }}
              index={1}
            />
            <RoomCategoryCard
              item={{
                id: "default-3",
                name: "Standard Double",
                description: "Comfortable double room with modern amenities",
              }}
              index={2}
            />
          </>
        ) : (
          categories.map((item, idx) => (
            <RoomCategoryCard key={item.id || `rcat-${idx}`} item={item} index={idx} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// Skeleton Component for Loading State
function RoomCategorySkeleton({ index }: { index: number }) {
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
    <Animated.View
      entering={FadeInRight.delay(index * 80).springify()}
      style={[styles.skeletonCard, animatedStyle]}
    >
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonSub} />
    </Animated.View>
  );
}

// Room Category Card Component
function RoomCategoryCard({
  item,
  index,
}: {
  item: PublicRoomCategoryItem;
  index: number;
}) {
  const getIconName = (name: string): any => {
    const n = name?.toLowerCase() || "";
    if (n.includes("suite")) return "sparkles";
    if (n.includes("deluxe") || n.includes("king")) return "bed-sharp";
    if (n.includes("villa") || n.includes("cottage")) return "home-sharp";
    if (n.includes("family")) return "people-sharp";
    return "cube-sharp";
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 90).springify()}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => router.push("/rooms-list")}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name={getIconName(item.name)} size={18} color={COLORS.navy} />
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AVAILABLE</Text>
          </View>
        </View>

        <Text style={styles.categoryName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.categoryDesc} numberOfLines={2}>
          {item.description || "Premium quality room with top tier amenities."}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.exploreText}>Explore Stays</Text>
          <Ionicons name="arrow-forward-circle" size={20} color={COLORS.navy} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Touch opacity helper
function TouchableOpacity({ children, onPress, style }: any) {
  return (
    <Pressable onPress={onPress} style={style}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: -0.5,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },

  /* Card */
  card: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: "space-between",
    minHeight: 145,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.goldLight,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.green,
    letterSpacing: 0.5,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  exploreText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
  },

  /* Skeleton */
  skeletonCard: {
    width: 200,
    height: 145,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "space-between",
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  skeletonTitle: {
    width: "70%",
    height: 16,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginTop: 10,
  },
  skeletonSub: {
    width: "90%",
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginTop: 6,
  },
});
