import api from "@/services/api";
import { getFullImageUrl } from "@/utils/image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

/* ---------- Types ---------- */
type Room = {
  id: string;
  room_name: string;
  description?: string;
  bed_count?: number;
  bed_category?: { type: string; count: number }[];
  room_capacity?: { adults: number; children: number; persons: number };
  base_price?: number;
  discount_percentage?: number | null;
  toilet_type?: string;
  room_heating?: string;
  amenities?: string[];
  check_in_time?: string;
  check_out_time?: string;
  room_images_url?: string[];
  room_category?: { category_name: string };
};

type Property = {
  id: string;
  property_name: string;
  address_display?: string;
  city?: string;
  state?: string;
  district?: string;
  pincode?: number;
  property_images?: string[];
  amenities?: string[];
  category?: { category_name: string; description?: string };
  room_details?: Room[];
};


const C = {
  primary: "#10b981",
  primaryDark: "#047857",
  primarySoft: "#ecfdf5",
  ink: "#0f172a",
  body: "#475569",
  muted: "#94a3b8",
  line: "#e2e8f0",
  bg: "#f8fafc",
  card: "#ffffff",
};

const AMENITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  wifi: "wifi",
  "power backup": "flash-outline",
  "dg set": "battery-charging-outline",
  "jain food": "restaurant-outline",
  "pet friendly": "paw-outline",
  parking: "car-outline",
  "smoking allowed in room": "flame-outline",
  "private balcony": "sunny-outline",
  "smart tv": "tv-outline",
};

const iconFor = (name: string) => {
  const key = name.toLowerCase();
  const hit = Object.keys(AMENITY_ICONS).find((k) => key.startsWith(k));
  return hit ? AMENITY_ICONS[hit] : "checkmark-circle-outline";
};

const clean = (s?: string) => (s ? s.trim() : "");
const titleCase = (s?: string) =>
  clean(s).replace(/\b\w/g, (c) => c.toUpperCase());

const finalPrice = (r: Room) => {
  if (r.base_price == null) return null;
  const d = r.discount_percentage || 0;
  return Math.round(r.base_price * (1 - d / 100));
};

/* ---------- Image gallery ---------- */
function Gallery({ images, width }: { images: string[]; width: number }) {
  const [index, setIndex] = useState(0);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  if (!images.length) {
    return (
      <View style={[styles.galleryEmpty, { width }]}>
        <Ionicons name="image-outline" size={36} color={C.muted} />
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(u, i) => `${u}-${i}`}
        onMomentumScrollEnd={onEnd}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={{ width, height: 200 }} />
        )}
      />
      {images.length > 1 && (
        <>
          <View style={styles.counter}>
            <Ionicons name="images-outline" size={12} color="#fff" />
            <Text style={styles.counterText}>
              {index + 1}/{images.length}
            </Text>
          </View>
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

/* ---------- Room row ---------- */
function RoomRow({ room }: { room: Room }) {
  const price = finalPrice(room);
  const beds = room.bed_category?.map((b) => `${b.count} ${b.type}`).join(", ");
  const cap = room.room_capacity;
  const thumb = getFullImageUrl(room.room_images_url?.[0]);

  return (
    <View style={styles.roomRow}>
      {thumb ? (
        <Image source={{ uri: thumb }} style={styles.roomThumb} />
      ) : (
        <View style={[styles.roomThumb, styles.roomThumbEmpty]}>
          <Ionicons name="bed-outline" size={22} color={C.muted} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View style={styles.roomTop}>
          <Text style={styles.roomName} numberOfLines={1}>
            Room {room.room_name}
          </Text>
          {price != null && (
            <Text style={styles.roomPrice}>
              ₹{price}
              <Text style={styles.perNight}> /night</Text>
            </Text>
          )}
        </View>

        {!!room.room_category?.category_name && (
          <Text style={styles.roomType}>
            {titleCase(room.room_category.category_name)}
          </Text>
        )}

        <View style={styles.metaRow}>
          {!!beds && <Meta icon="bed-outline" text={beds} />}
          {cap && (
            <Meta
              icon="people-outline"
              text={`${cap.adults} adult${cap.adults > 1 ? "s" : ""}${cap.children ? ` + ${cap.children} child` : ""
                }`}
            />
          )}
        </View>

        <View style={styles.metaRow}>
          {!!room.toilet_type && (
            <Meta icon="water-outline" text={room.toilet_type} />
          )}
          {!!room.room_heating && room.room_heating !== "No Heating" && (
            <Meta icon="thermometer-outline" text={room.room_heating} />
          )}
        </View>

        {!!room.check_in_time && (
          <Text style={styles.timing}>
            Check-in {room.check_in_time} · Check-out {room.check_out_time}
          </Text>
        )}
      </View>
    </View>
  );
}

function Meta({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={13} color={C.body} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

/* ---------- Property card ---------- */
function PropertyCard({ item, width }: { item: Property; width: number }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const images = useMemo(
    () =>
      (item.property_images || [])
        .map((p) => getFullImageUrl(p))
        .filter(Boolean) as string[],
    [item.property_images],
  );

  const rooms = item.room_details || [];
  const prices = rooms.map(finalPrice).filter((p): p is number => p != null);
  const minPrice = prices.length ? Math.min(...prices) : null;

  const location = [
    clean(item.address_display) !== "hh" ? clean(item.address_display) : "",
    titleCase(item.city),
    item.state,
  ]
    .filter(Boolean)
    .join(", ");

  const amenities = Array.from(new Set(item.amenities || []));
  const shown = amenities.slice(0, 4);
  const extra = amenities.length - shown.length;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/property-details",
            params: { id: item.id },
          })
        }
      >
        <Gallery images={images} width={width} />
        {!!item.category?.category_name && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category.category_name}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.title} numberOfLines={1}>
              {titleCase(item.property_name)}
            </Text>
            <View style={styles.locRow}>
              <Ionicons name="location-sharp" size={14} color={C.primary} />
              <Text style={styles.location} numberOfLines={1}>
                {location || "Location not available"}
                {item.pincode ? ` · ${item.pincode}` : ""}
              </Text>
            </View>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>from</Text>
            <Text style={styles.price}>
              {minPrice != null ? `₹${minPrice}` : "—"}
            </Text>
            <Text style={styles.perNight}>per night</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="bed-outline" size={15} color={C.primaryDark} />
            <Text style={styles.statText}>
              {rooms.length} room{rooms.length !== 1 ? "s" : ""}
            </Text>
          </View>
          {!!item.category?.description && (
            <View style={styles.stat}>
              <Ionicons
                name="sparkles-outline"
                size={15}
                color={C.primaryDark}
              />
              <Text style={styles.statText} numberOfLines={1}>
                {item.category.description}
              </Text>
            </View>
          )}
        </View>

        {shown.length > 0 && (
          <View style={styles.chips}>
            {shown.map((a) => (
              <View key={a} style={styles.chip}>
                <Ionicons name={iconFor(a)} size={13} color={C.primaryDark} />
                <Text style={styles.chipText}>{a}</Text>
              </View>
            ))}
            {extra > 0 && (
              <View style={[styles.chip, styles.chipMore]}>
                <Text style={[styles.chipText, { color: C.body }]}>
                  +{extra} more
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() => setOpen((v) => !v)}
        >
          <Text style={styles.ctaText}>
            {open ? "Hide rooms" : "View rooms"}
          </Text>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>

        {open && (
          <View style={styles.rooms}>
            {rooms.length ? (
              rooms.map((r, i) => (
                <View key={r.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <RoomRow room={r} />
                </View>
              ))
            ) : (
              <Text style={styles.noRooms}>No rooms available right now.</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

/* ---------- Screen ---------- */
export default function PropertiesByCategory() {
  const { category_id } = useLocalSearchParams<{ category_id?: string }>();
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const id =
      (category_id as string) || "8d5f1a6d-3b1f-4b8a-bd44-2d7f2d6b8c30";
    try {
      const res = await api.get(`/api/public/categories/${id}/properties`);
      setProperties(res?.data?.properties || []);
    } catch (err) {
      console.error("Failed to fetch properties by category:", err);
      setProperties([]);
    }
    setLoading(false);
  }, [category_id]);

  useEffect(() => {
    // call fetchProperties asynchronously to avoid setting state synchronously inside effect
    void (async () => {
      await fetchProperties();
    })();
  }, [fetchProperties]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProperties();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <PropertyCard item={item} width={cardWidth} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        ListHeaderComponent={
          properties.length ? (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {properties[0]?.category?.category_name || "Stays"}
              </Text>
              <Text style={styles.headerSub}>
                {properties.length} propert
                {properties.length !== 1 ? "ies" : "y"} available
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={48} color={C.muted} />
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySub}>
              Pull down to refresh or try another category.
            </Text>
          </View>
        }
      />
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, paddingBottom: 40 },

  header: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: C.bg,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.ink,
    flexShrink: 1,
    flexWrap: "wrap",
    lineHeight: 28,
    marginTop: 20,
  },
  headerSub: { fontSize: 13, color: C.body, marginTop: 6 },

  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    marginBottom: 2,
  },

  galleryEmpty: {
    height: 200,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15,23,42,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  counterText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  dots: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  dotActive: { backgroundColor: "#fff", width: 16 },

  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: C.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  body: { padding: 14 },
  titleRow: { flexDirection: "row", alignItems: "flex-start" },
  title: { fontSize: 19, fontWeight: "800", color: C.ink },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 3 },
  location: { fontSize: 13, color: C.body, flexShrink: 1 },

  priceBox: { alignItems: "flex-end" },
  priceLabel: { fontSize: 11, color: C.muted },
  price: { fontSize: 22, fontWeight: "800", color: C.primaryDark },
  perNight: { fontSize: 11, color: C.muted, fontWeight: "500" },

  statsRow: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: "100%",
  },
  statText: { fontSize: 12, fontWeight: "600", color: C.primaryDark },

  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 14 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipMore: { backgroundColor: "#f1f5f9", borderColor: "#f1f5f9" },
  chipText: { fontSize: 12, color: C.ink, fontWeight: "500" },

  cta: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.ink,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  rooms: {
    marginTop: 14,
    backgroundColor: C.bg,
    borderRadius: 14,
    padding: 12,
  },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 12 },
  noRooms: { color: C.body, textAlign: "center", paddingVertical: 8 },

  roomRow: { flexDirection: "row", gap: 12 },
  roomThumb: { width: 76, height: 76, borderRadius: 12 },
  roomThumbEmpty: {
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  roomTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomName: { fontSize: 15, fontWeight: "700", color: C.ink, flex: 1 },
  roomPrice: { fontSize: 15, fontWeight: "800", color: C.primaryDark },
  roomType: { fontSize: 12, color: C.muted, marginTop: 1 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: C.body },
  timing: { fontSize: 11, color: C.muted, marginTop: 6 },

  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.ink },
  emptySub: { fontSize: 14, color: C.body, textAlign: "center" },
});
