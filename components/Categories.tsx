import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
  withSpring,
} from "react-native-reanimated";

// 1. Types for Property Categories
interface PropertyType {
  id: string;
  name: string;
  subtext: string;
  priceInfo: string;
  rating: string;
  image: string;
  isGuestFavourite?: boolean;
}

const CATEGORIES: PropertyType[] = [
  {
    id: "1",
    name: "Hotel",
    subtext: "Premium stays in city",
    priceInfo: "From ₹4,500/night",
    rating: "4.95",
    isGuestFavourite: true,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
  },
  {
    id: "2",
    name: "Homestay",
    subtext: "Authentic local living",
    priceInfo: "From ₹2,200/night",
    rating: "4.88",
    isGuestFavourite: true,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
  },
  {
    id: "3",
    name: "Resort",
    subtext: "All-inclusive luxury",
    priceInfo: "From ₹9,800/night",
    rating: "4.92",
    isGuestFavourite: false,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400",
  },
  {
    id: "4",
    name: "Guest House",
    subtext: "Cozy & affordable",
    priceInfo: "From ₹1,500/night",
    rating: "4.75",
    isGuestFavourite: false,
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400",
  },
  {
    id: "5",
    name: "Villa",
    subtext: "Private & spacious",
    priceInfo: "From ₹15,000/night",
    rating: "4.98",
    isGuestFavourite: true,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400",
  },
  {
    id: "6",
    name: "Apartment",
    subtext: "Modern urban living",
    priceInfo: "From ₹3,500/night",
    rating: "4.80",
    isGuestFavourite: false,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
  },
  {
    id: "7",
    name: "Lodge",
    subtext: "Rustic mountain vibes",
    priceInfo: "From ₹4,000/night",
    rating: "4.70",
    isGuestFavourite: true,
    image: "https://images.unsplash.com/photo-1449156001446-515f6b3b3335?w=400",
  },
];

export default function Categories() {
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
        {CATEGORIES.map((item, index) => (
          <CategoryCard key={item.id} item={item} index={index} />
        ))}
      </ScrollView>
    </View>
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
