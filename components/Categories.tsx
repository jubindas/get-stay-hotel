import { Ionicons } from "@expo/vector-icons";

import axios from "axios";

import { router } from "expo-router";

import { useEffect, useState } from "react";

import {
  Image,
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
  withSpring,
  withTiming,
} from "react-native-reanimated";


interface PropertyType {
  id: string;
  name: string;
  subtext: string;
  priceInfo: string;
  rating: string;
  image: string;
  isGuestFavourite?: boolean;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


export default function Categories() {

  const [categories, setCategories] = useState<PropertyType[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const fetchCategories = async () => {

      try {
        const response = await axios.get(`${API_BASE_URL}/api/public/categories`);
        console.log("the response is", response.data);

        if (response.data && response.data.categories) {
          const apiCategories: PropertyType[] = response.data.categories.map((c: any) => ({
            id: c.id,
            name: c.category_name,
            subtext: c.description,
            priceInfo: "Explore", // API doesn't provide price
            rating: "New", // API doesn't provide rating
            image: c.image_url?.startsWith('http') ? c.image_url : `${API_BASE_URL}${c.image_url}`,
            isGuestFavourite: false,
          }));
          setCategories(apiCategories);
        }
      } catch (error) {
        console.log("the error is", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Popular Types</Text>
        <Ionicons name="chevron-forward" size={18} color="#000" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} index={index} />
          ))
          : categories.map((item, index) => (
            <CategoryCard key={item.id} item={item} index={index} />
          ))}
      </ScrollView>
    </View>
  );
}

function SkeletonCard({ index }: { index: number }) {


  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).springify()}
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.imageContainer}>
        <View style={[styles.image, { backgroundColor: "#e2e8f0" }]} />
      </View>
      <View style={styles.info}>
        <View style={{ height: 16, backgroundColor: "#e2e8f0", borderRadius: 4, width: '70%', marginBottom: 6 }} />
        <View style={{ height: 12, backgroundColor: "#e2e8f0", borderRadius: 4, width: '40%', marginBottom: 10 }} />
        <View style={styles.footerRow}>
          <View style={{ height: 14, backgroundColor: "#e2e8f0", borderRadius: 4, width: '30%' }} />
          <View style={{ height: 14, backgroundColor: "#e2e8f0", borderRadius: 4, width: '20%' }} />
        </View>
      </View>
    </Animated.View>
  );
}

function CategoryCard({ item, index }: { item: PropertyType; index: number }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));


  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).springify()}
      style={[styles.card, animatedStyle]}
    >
      <Pressable
        onPressIn={() => (scale.value = 0.97)}
        onPressOut={() => (scale.value = 1)}
        style={styles.pressable}
        onPress={() => router.push("/rooms-list")}
      >
        {/* Image Frame */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />

          {item.isGuestFavourite && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Guest favourite</Text>
            </View>
          )}

          <View style={styles.heartWrapper}>
            <Ionicons name="heart-outline" size={22} color="white" />
          </View>
        </View>

        {/* Text Details - Exactly like image */}
        <View style={styles.info}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.subText}>{item.subtext}</Text>

          <View style={styles.footerRow}>
            <Text style={styles.priceText}>{item.priceInfo}</Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={12} color="#000" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: -0.5,
    marginRight: 4,
  },
  scrollContent: {
    paddingLeft: 24,
    paddingRight: 10,
  },
  card: {
    width: 240,
    marginRight: 18,
  },
  pressable: {
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1, // Square like the image
    borderRadius: 20, // Softer Airbnb radius
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    // Soft shadow for the badge
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000",
  },
  heartWrapper: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  info: {
    marginTop: 10,
  },
  nameText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  subText: {
    fontSize: 13,
    color: "#717171", // Airbnb grey
    marginTop: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
    marginLeft: 3,
  },
});
