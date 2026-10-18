import { getPopularProperties } from "@/services/propertyService";
import { Property } from "@/types/property";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import { getFullImageUrl } from "@/utils/image";

const { width } = Dimensions.get("window");

const ITEM_WIDTH = width * 0.58;
const ITEM_HEIGHT = 280;
const ITEM_SPACING = 16;

export default function PopularDestinations() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await getPopularProperties();
        if (response && Array.isArray(response.properties)) {
          setProperties(response.properties);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching popular properties:", error);
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopular();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Popular Properties</Text>
        </View>
        <Pressable
          style={styles.viewAllBtn}
          onPress={() => router.push("/search-bar")}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#007AFF" size="small" />
          <Text style={styles.loadingText}>Loading popular stays...</Text>
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No popular properties available right now.</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
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
      )}
    </View>
  );
}

function DestinationCard({
  item,
  index,
}: {
  item: Property;
  index: number;
}) {
  const scale = useSharedValue(1);
  const [imageError, setImageError] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const getImageUrl = (): string => {
    if (imageError) return getFullImageUrl(null);
    const rawPath =
      item.property_images?.[0] || item.image_url || item.category?.image_url;
    return getFullImageUrl(rawPath);
  };

  const locationStr = [item.city, item.state]
    .filter(Boolean)
    .map((s) => s?.trim())
    .join(", ") || "India";

  // Calculate starting price if rooms exist
  const roomPrices = item.room_details
    ?.map((r) => r.base_price)
    .filter(Boolean);
  const minPrice =
    roomPrices && roomPrices.length > 0 ? Math.min(...roomPrices) : null;

  const categoryName =
    item.category?.category_name || item.category?.name || "Stay";

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
        onPress={() =>
          router.push({
            pathname: "/property-details",
            params: { id: item.id },
          })
        }
        style={styles.card}
      >
        <Image
          source={{ uri: getImageUrl() }}
          style={styles.image}
          onError={() => setImageError(true)}
        />

        <View style={styles.topRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{categoryName}</Text>
          </View>
          <View style={styles.heartCircle}>
            <Ionicons name="heart-outline" size={16} color="#FFF" />
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.bottomContent}>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.property_name}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#CCC" />
              <Text style={styles.locationText} numberOfLines={1}>
                {locationStr}
              </Text>
            </View>
          </View>

          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              {minPrice ? `₹${minPrice.toLocaleString()}` : "Explore"}
            </Text>
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
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  } as ImageStyle,
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  } as ViewStyle,
  categoryTag: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  } as ViewStyle,
  categoryTagText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  } as TextStyle,
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  loadingContainer: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#64748b",
  } as TextStyle,
  emptyContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  } as ViewStyle,
  emptyText: {
    fontSize: 13,
    color: "#64748b",
  } as TextStyle,
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
    backgroundColor: "rgba(0,0,0,0.35)",
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

