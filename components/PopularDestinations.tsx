import { Ionicons } from "@expo/vector-icons";

import React from "react";

import {
  Dimensions,
  FlatList,
  Image,
  ImageStyle,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const ITEM_WIDTH = width * 0.58;
const ITEM_HEIGHT = 280;
const ITEM_SPACING = 16;

interface Destination {
  id: string;
  title: string;
  location: string;
  price: string;
  rating: number;
  image: string;
}

const DESTINATIONS: Destination[] = [
  {
    id: "1",
    title: "Santorini",
    location: "Greece",
    price: "$250",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500",
  },
  {
    id: "2",
    title: "Bali",
    location: "Indonesia",
    price: "$180",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500",
  },
  {
    id: "3",
    title: "Kyoto",
    location: "Japan",
    price: "$210",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500",
  },
];

export default function PopularDestinations() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Popular Places</Text>
        </View>
        <Pressable style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      <FlatList
        data={DESTINATIONS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <DestinationCard item={item} index={index} />
        )}
      />
    </View>
  );
}

function DestinationCard({
  item,
  index,
}: {
  item: Destination;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .springify()
        .damping(15)}
      style={[styles.cardWrapper, animatedStyle]}
    >
      <Pressable
        onPressIn={() => (scale.value = 0.97)}
        onPressOut={() => (scale.value = 1)}
        style={styles.card}
      >
        <Image source={{ uri: item.image }} style={styles.image} />

        <View style={styles.topRow}>
          <View style={styles.heartCircle}>
            <Ionicons name="heart-outline" size={16} color="#FFF" />
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.bottomContent}>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#CCC" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>

          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  } as ViewStyle,
  headerSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  } as TextStyle,
  viewAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
  } as ViewStyle,
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#007AFF",
  } as TextStyle,
  listPadding: {
    paddingLeft: 20,
    paddingRight: 10,
  } as ViewStyle,
  cardWrapper: {
    width: ITEM_WIDTH,
    marginRight: ITEM_SPACING,
  } as ViewStyle,
  card: {
    height: ITEM_HEIGHT,

    overflow: "hidden",
    backgroundColor: "#EEE",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  } as ViewStyle,
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  } as ImageStyle,
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  } as ViewStyle,
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    height: 24,
  } as ViewStyle,
  ratingText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 3,
  } as TextStyle,
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingTop: 30, // For the gradient feel
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
  } as ViewStyle,
  textContainer: {
    flex: 1,
  } as ViewStyle,
  cardTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  } as TextStyle,
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  } as ViewStyle,
  locationText: {
    color: "#EEE",
    fontSize: 11,
    marginLeft: 3,
  } as TextStyle,
  priceTag: {
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  } as ViewStyle,
  priceText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "800",
  } as TextStyle,
});
