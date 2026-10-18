import api, { API_BASE_URL as SERVICE_API_BASE_URL } from "@/services/api";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export interface Category {
  id: string;
  category_name: string;
  description?: string;
  image_url: string;
}

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  SERVICE_API_BASE_URL ||
  "http://192.168.29.235:3005";

const GRID_PADDING = 20;
const GRID_GAP = 8;
const ROW_GAP = 10;

export const getCategoryImageUrl = (path?: string | null): string => {
  if (!path || typeof path !== "string" || path.trim().length === 0) return "";
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const base = (API_BASE_URL ?? "").replace(/\/+$/, "");
  const clean = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${clean}`;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { width: screenWidth } = useWindowDimensions();

  // Dynamic card width to guarantee exactly 4 items per row in the grid
  const cardWidth = Math.floor(
    (screenWidth - GRID_PADDING * 2 - GRID_GAP * 3) / 4
  );

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        let data: any = null;
        try {
          const response = await api.get("/api/public/categories");
          data = response.data;
        } catch {
          const fallbackResponse = await axios.get(
            `${API_BASE_URL}/api/public/categories`
          );
          data = fallbackResponse.data;
        }

        console.log("the response is", data);

        if (isMounted && data) {
          if (Array.isArray(data.categories)) {
            setCategories(data.categories);
          } else if (Array.isArray(data)) {
            setCategories(data);
          }
        }
      } catch (error) {
        console.log("Error fetching categories:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <View style={styles.gridContainer}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard
                key={`cat-skeleton-${index}`}
                index={index}
                cardWidth={cardWidth}
              />
            ))
          : categories.map((item, index) => (
              <CategoryCard
                key={item.id || `cat-${index}`}
                item={item}
                index={index}
                cardWidth={cardWidth}
              />
            ))}
      </View>
    </View>
  );
}

function SkeletonCard({
  index,
  cardWidth,
}: {
  index: number;
  cardWidth: number;
}) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.45, { duration: 750 })
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
      entering={FadeInDown.delay(index * 35).springify()}
      style={[{ width: cardWidth }, animatedStyle]}
    >
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonText} />
      </View>
    </Animated.View>
  );
}

function CategoryCard({
  item,
  index,
  cardWidth,
}: {
  item: Category;
  index: number;
  cardWidth: number;
}) {
  const scale = useSharedValue(1);
  const [imgError, setImgError] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(scale.value, {
          damping: 15,
          stiffness: 300,
        }),
      },
    ],
  }));

  const imageUrl = getCategoryImageUrl(item.image_url);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 35).springify()}
      style={[{ width: cardWidth }, animatedStyle]}
    >
      <Pressable
        onPressIn={() => (scale.value = 0.94)}
        onPressOut={() => (scale.value = 1)}
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/properties-by-category",
            params: {
              category_id: item.id,
              category_name: item.category_name,
            },
          })
        }
      >
        <View style={styles.imageContainer}>
          {imageUrl && !imgError ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.categoryImage}
              resizeMode="contain"
              onError={(e) => {
                console.log(
                  "Category image failed to load:",
                  imageUrl,
                  e.nativeEvent.error
                );
                setImgError(true);
              }}
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.categoryName} numberOfLines={2}>
            {item.category_name}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GRID_PADDING,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: GRID_PADDING,
    columnGap: GRID_GAP,
    rowGap: ROW_GAP,
  },
  card: {
    width: "100%",
    height: 86,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryImage: {
    width: 40,
    height: 40,
  },
  imagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  textContainer: {
    width: "100%",
    minHeight: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    lineHeight: 13,
    letterSpacing: -0.2,
  },
  skeletonCard: {
    width: "100%",
    height: 86,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  skeletonImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  skeletonText: {
    width: "70%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
    marginBottom: 4,
  },
});


