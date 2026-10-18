import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  Image as RNImage,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import {
  getSavedProperties,
  toggleSavedProperty,
} from "@/services/propertyService";
import { getFullImageUrl } from "@/utils/image";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 50) / 2;

const COLORS = {
  white: "#FFFFFF",
  black: "#18181b",
  grayText: "#71717a",
  lightGray: "#f4f4f5",
  border: "#e4e4e7",
  blue: "#2563eb",
  red: "#ef4444",
  amber: "#f59e0b",
  overlay: "rgba(0, 0, 0, 0.6)",
  glass: "rgba(255, 255, 255, 0.9)",
  green: "#10b981",
};

interface SavedProperty {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  categoryName: string;
}

const normalizeSavedProperty = (property: any): SavedProperty => {
  const roomPrices = Array.isArray(property?.room_details)
    ? property.room_details
        .map((room: any) => Number(room?.base_price ?? 0))
        .filter((price: number) => Number.isFinite(price) && price > 0)
    : [];

  const safePrice = Number(
    property?.price ?? (roomPrices.length > 0 ? Math.min(...roomPrices) : 0),
  );

  const location =
    property?.location ||
    [property?.city, property?.state].filter(Boolean).join(", ") ||
    "Location unavailable";

  const categoryName =
    property?.category?.category_name ||
    property?.category?.name ||
    property?.category_name ||
    "Property";

  return {
    id: String(property?.id ?? ""),
    name: property?.name || property?.property_name || "Untitled property",
    location,
    price: Number.isFinite(safePrice) ? safePrice : 0,
    rating: Number(property?.rating ?? 4.7) || 4.7,
    image: getFullImageUrl(
      property?.image_url ||
        property?.cover_image ||
        property?.property_images?.[0] ||
        property?.category?.image_url ||
        null,
    ),
    categoryName,
  };
};

const getErrorMessage = (err: any, fallback: string): string => {
  if (!err?.response) return "Cannot reach the server. Please try again.";

  const status = err.response.status;
  const serverMessage = err.response.data?.message || err.response.data?.error;

  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403)
    return "You do not have permission to view saved properties.";
  if (status >= 500) return "Server error while loading saved properties.";

  return serverMessage || fallback;
};

export default function Wishlist() {
  const { token, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedProperties = useCallback(
    async (isInitial = false) => {
      if (!token) {
        setWishlist([]);
        setError(null);
        if (isInitial) setLoading(false);
        return;
      }

      if (isInitial) setLoading(true);

      try {
        const response = await getSavedProperties();
        console.log(
          "Saved properties details:",
          JSON.stringify(response?.properties, null, 2),
        );
        const properties = Array.isArray(response?.properties)
          ? response.properties.map(normalizeSavedProperty)
          : [];
        console.log(
          "Normalized properties details:",
          JSON.stringify(properties, null, 2),
        );

        setWishlist(properties);
        setError(null);
      } catch (err: any) {
        const message = getErrorMessage(err, "Could not load saved properties.");
        setError(message);
      } finally {
        if (isInitial) setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }
    void fetchSavedProperties(true);
  }, [authLoading, token, fetchSavedProperties]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        void fetchSavedProperties(false);
      } else {
        setLoading(false);
      }
    }, [token, fetchSavedProperties]),
  );

  const onRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    await fetchSavedProperties(false);
  };

  const removeItem = async (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    try {
      await toggleSavedProperty(id);
    } catch (err) {
      console.error("Failed to unsave property:", err);
    }
  };

  const renderGalleryItem = ({ item }: { item: SavedProperty }) => (
    <TouchableOpacity
      style={styles.galleryCard}
      activeOpacity={0.9}
      onPress={() => {
        console.log("Selected wishlist property details:", item);
        router.push({
          pathname: "/property-details",
          params: { id: item.id },
        });
      }}
    >
      <View style={styles.imageWrapper}>
        <RNImage source={{ uri: item.image }} style={styles.galleryImage} />

        <TouchableOpacity
          style={styles.heartOverlay}
          onPress={() => removeItem(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={18} color={COLORS.red} />
        </TouchableOpacity>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.categoryName}</Text>
        </View>

        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>
            ₹{item.price.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.galleryContent}>
        <Text style={styles.galleryHotelName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.gallerySubRow}>
          <Ionicons name="location-outline" size={12} color={COLORS.grayText} />
          <Text style={styles.galleryLocationText} numberOfLines={1}>
            {item.location}
          </Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color={COLORS.amber} />
            <Text style={styles.galleryRating}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (authLoading || (loading && token)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={COLORS.blue} />
          <Text style={styles.loadingText}>Loading saved properties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Saved</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {token ? `${wishlist.length} properties` : "Sign in to view"}
              </Text>
            </View>
          </View>
          {token && (
            <TouchableOpacity
              style={styles.headerCircleBtn}
              onPress={() => void onRefresh()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={COLORS.black}
              />
            </TouchableOpacity>
          )}
        </View>

        {!token ? (
          <View style={styles.unauthContainer}>
            <View style={styles.unauthCard}>
              <View style={styles.unauthIconContainer}>
                <View style={styles.unauthIconCircle}>
                  <Ionicons name="heart" size={36} color="#ef4444" />
                </View>
                <View style={styles.unauthLockBadge}>
                  <Ionicons name="lock-closed" size={13} color="#ffffff" />
                </View>
              </View>

              <Text style={styles.unauthTitle}>You're not logged in</Text>
              <Text style={styles.unauthSubtitle}>
                Please log in to check your saved wishlist and access your favorite stays anytime.
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconBox}>
                    <Ionicons name="heart-outline" size={16} color="#ef4444" />
                  </View>
                  <Text style={styles.featureText}>
                    Save hotel rooms, resorts & homestays
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconBox}>
                    <Ionicons name="sync-outline" size={16} color="#2563eb" />
                  </View>
                  <Text style={styles.featureText}>
                    Sync automatically across your devices
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconBox}>
                    <Ionicons name="flash-outline" size={16} color="#f59e0b" />
                  </View>
                  <Text style={styles.featureText}>
                    Instant booking when you're ready
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.loginCtaBtn}
                activeOpacity={0.85}
                onPress={() => router.push("/login")}
              >
                <Ionicons name="log-in-outline" size={19} color="#ffffff" />
                <Text style={styles.loginCtaText}>Log In to Check</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryExploreBtn}
                activeOpacity={0.7}
                onPress={() => router.push("/(tabs)")}
              >
                <Text style={styles.secondaryExploreText}>
                  Explore Properties First
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color={COLORS.red}
            />
            <Text style={styles.emptyTitle}>
              Unable to load saved properties
            </Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                void fetchSavedProperties(true);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : wishlist.length > 0 ? (
          <FlatList
            data={wishlist}
            keyExtractor={(item) => item.id}
            renderItem={renderGalleryItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="heart-outline"
                size={40}
                color={COLORS.grayText}
              />
            </View>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              Save properties you like to see them here.
            </Text>
            <TouchableOpacity
              style={[
                styles.loginCtaBtn,
                { marginTop: 20, backgroundColor: COLORS.black },
              ]}
              activeOpacity={0.85}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.loginCtaText}>Explore Properties</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: -1.2,
  },
  countBadge: {
    marginTop: 2,
  },
  countText: {
    fontSize: 14,
    color: COLORS.grayText,
    fontWeight: "500",
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.grayText,
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  galleryCard: {
    width: COLUMN_WIDTH,
    marginBottom: 25,
  },
  imageWrapper: {
    width: "100%",
    height: COLUMN_WIDTH * 1.3,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: COLORS.lightGray,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  heartOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.glass,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  priceTag: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  priceTagText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "800",
  },
  galleryContent: {
    paddingTop: 10,
  },
  galleryHotelName: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  gallerySubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  galleryLocationText: {
    flex: 1,
    color: COLORS.grayText,
    fontSize: 12,
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 6,
  },
  galleryRating: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 3,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    color: COLORS.grayText,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  /* Unauthenticated State Styles */
  unauthContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  unauthCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  unauthIconContainer: {
    position: "relative",
    marginBottom: 16,
  },
  unauthIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  unauthLockBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  unauthTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  unauthSubtitle: {
    fontSize: 13.5,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  featuresList: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 22,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
    flex: 1,
  },
  loginCtaBtn: {
    width: "100%",
    backgroundColor: "#0f172a",
    paddingVertical: 15,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginCtaText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryExploreBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryExploreText: {
    color: "#64748b",
    fontSize: 13.5,
    fontWeight: "600",
  },
});
