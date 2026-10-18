import {
  PropertyBannerImage,
  RoomThumbImage,
} from "@/components/property/PropertyMedia";

import SectionHeader from "@/components/ui/SectionHeader";

import {
  getPropertyById,
  getRelatedProperties,
  getRoomById,
} from "@/services/propertyService";

import { Property, RoomDetail } from "@/types/property";

import { getFullImageUrl } from "@/utils/image";

import { Ionicons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

import { ChevronLeft, Heart } from "lucide-react-native";

import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#10b981",
  secondary: "#0f172a",
  inactive: "#64748b",
  white: "#ffffff",
  border: "#e2e8f0",
  accent: "#f43f5e",
  bgLight: "#f8fafc",
  greenLight: "#ecfdf5",
};

export default function RoomDetails() {
  const { id, roomId } = useLocalSearchParams<{
    id?: string;
    roomId?: string;
  }>();

  const { token, user, isAuthenticated } = useAuth();

  const [isBooking, setIsBooking] = useState(false);

  console.log("the id and room id is", id, roomId);

  const [property, setProperty] = useState<Property | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null);

  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const onViewRef = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  useEffect(() => {
    const resolvedRoomId = roomId || undefined;

    const resolvedPropertyId = id || undefined;

    if (resolvedRoomId) {
      const fetchRoomDetails = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setProperty(null);
        setRelatedProperties([]);
        setSelectedRoom(null);

        try {
          const roomResponse = await getRoomById(resolvedRoomId as string);

          console.log("the data is", roomResponse);

          if (roomResponse?.room) {
            const roomData = roomResponse.room as RoomDetail & {
              property?: Property | null;
              property_id?: string | null;
              property_name?: string | null;
            };

            setSelectedRoom(roomData);

            if (roomData.property) {
              setProperty({
                ...roomData.property,
                id: roomData.property.id || roomData.property_id || "",
                property_name:
                  roomData.property.property_name ||
                  roomData.property_name ||
                  "Property",
                room_details: roomData.property.room_details?.length
                  ? roomData.property.room_details
                  : [roomData],
                property_images: roomData.property.property_images?.length
                  ? roomData.property.property_images
                  : roomData.room_images_url || [],
                image_url:
                  roomData.property.image_url || roomData.room_images_url?.[0],
              });
            } else if (resolvedPropertyId) {
              const fallback = await getPropertyById(resolvedPropertyId);
              if (fallback?.property) {
                setProperty(fallback.property);
              } else {
                setErrorMessage(
                  "Room loaded but property details are unavailable.",
                );
              }
            } else {
              setErrorMessage(
                "Room loaded but property details are unavailable.",
              );
            }
          } else if (roomResponse?.error) {
            setErrorMessage(roomResponse.error);
          } else {
            setErrorMessage("Room not found");
          }
        } catch (err: any) {
          console.error("Failed to fetch room details:", err);
          setErrorMessage("Unable to load room details.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchRoomDetails();
      return;
    }

    if (!resolvedPropertyId) {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setErrorMessage("No property selected");
        setProperty(null);
        setSelectedRoom(null);
        setRelatedProperties([]);
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setSelectedRoom(null);
      try {
        const [detailRes, relatedRes] = await Promise.all([
          getPropertyById(resolvedPropertyId as string).catch((err) => {
            console.error("Error fetching property detail:", err);
            return null;
          }),
          getRelatedProperties(resolvedPropertyId as string).catch((err) => {
            console.error("Error fetching related properties:", err);
            return null;
          }),
        ]);

        if (detailRes && detailRes.property) {
          setProperty(detailRes.property);
        } else if (detailRes && detailRes.error) {
          setErrorMessage(detailRes.error);
        } else {
          setErrorMessage("Property not found");
        }

        if (relatedRes && Array.isArray(relatedRes.properties)) {
          setRelatedProperties(relatedRes.properties);
        } else {
          setRelatedProperties([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch property page data:", err);
        setErrorMessage("Unable to load property details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, roomId]);

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading property details...</Text>
      </View>
    );
  }

  if (errorMessage || !property) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.notFoundCard}>
          <Ionicons
            name="alert-circle-outline"
            size={54}
            color={COLORS.accent}
          />
          <Text style={styles.notFoundTitle}>Property Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            {errorMessage ||
              "The requested property could not be found or has been removed."}
          </Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images: string[] = [];
  if (property.property_images && property.property_images.length > 0) {
    property.property_images.forEach((img) => {
      images.push(getFullImageUrl(img));
    });
  } else if (property.image_url) {
    images.push(getFullImageUrl(property.image_url));
  } else if (property.category?.image_url) {
    images.push(getFullImageUrl(property.category.image_url));
  } else {
    images.push(getFullImageUrl(null));
  }

  // Address and location string
  const cleanCity = property.city?.trim();

  const cleanState = property.state?.trim();

  const locationTitle = [cleanCity, cleanState].filter(Boolean).join(", ");

  // Property Name trimmed
  const propertyNameDisplay = (property.property_name || "").trim();

  // Starting price calculation
  const roomList: RoomDetail[] = selectedRoom
    ? [selectedRoom]
    : property.room_details || [];
  const currentRoom = roomList[0] ?? selectedRoom ?? null;
  const roomPrices = roomList.map((r) => r.base_price).filter(Boolean);
  const minPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : null;

  const handleReserve = async () => {
    if (!currentRoom || !property?.id) {
      Alert.alert("Unable to reserve", "Room details are not available yet.");
      return;
    }

    if (!isAuthenticated || !token) {
      Alert.alert("Sign in required", "Please sign in to reserve this room.");
      router.push("/login");
      return;
    }

    console.log("the user is", user);

    const guestPhone = (user?.phone || user?.phone_number || "").trim();
    if (!guestPhone) {
      Alert.alert(
        "Missing phone number",
        "Please add a valid phone number to your profile before making a booking.",
      );
      return;
    }

    try {
      setIsBooking(true);

      const hasBreakfast = Boolean(
        (property as any)?.provides_breakfast ||
        (property as any)?.has_breakfast ||
        (property as any)?.breakfast_available ||
        (property as any)?.breakfast_included ||
        (currentRoom as any)?.provides_breakfast ||
        (currentRoom as any)?.has_breakfast ||
        (currentRoom as any)?.breakfast_available ||
        (currentRoom as any)?.breakfast_included ||
        property?.amenities?.some((a: string) =>
          typeof a === "string" && a.toLowerCase().includes("breakfast")
        ) ||
        currentRoom?.amenities?.some((a: string) =>
          typeof a === "string" && a.toLowerCase().includes("breakfast")
        )
      );

      // Navigate to review screen to confirm dates/guests and finalize booking
      router.push({
        pathname: "/review-booking-screen",
        params: {
          id: property.id,
          roomId: currentRoom.id,
          name: property.property_name,
          price: currentRoom.base_price ? String(currentRoom.base_price) : "",
          image: images[0] || "",
          extra_bed_price: currentRoom.extra_bed_price
            ? String(currentRoom.extra_bed_price)
            : "",
          adults: String(currentRoom.room_capacity?.adults || 2),
          children: String(currentRoom.room_capacity?.children || 0),
          max_guests: String(
            currentRoom.max_guests ||
            currentRoom.max_occupancy ||
            currentRoom.room_capacity?.persons ||
            ((currentRoom.room_capacity?.adults || 2) + (currentRoom.room_capacity?.children || 0))
          ),
          max_adults: String(currentRoom.room_capacity?.adults || 2),
          max_children: String(currentRoom.room_capacity?.children ?? 2),
          room_capacity: JSON.stringify(currentRoom.room_capacity || {}),
          provides_breakfast: String(hasBreakfast),
          property_amenities: JSON.stringify(property?.amenities || []),
          room_amenities: JSON.stringify(currentRoom?.amenities || []),
          // pass room and default dates/rooms (stringified) so review screen can assemble payload
          rooms: JSON.stringify([
            {
              room_details_id: currentRoom.id,
              number_of_rooms: 1,
              adults: currentRoom.room_capacity?.adults || 2,
              children: currentRoom.room_capacity?.children || 0,
              max_guests:
                currentRoom.max_guests ||
                currentRoom.max_occupancy ||
                currentRoom.room_capacity?.persons,
              room_capacity: currentRoom.room_capacity,
              extra_beds: 0,
              extra_bed_price: currentRoom.extra_bed_price || 0,
              amenities: currentRoom?.amenities || [],
            },
          ]),
          check_in_date: new Date().toISOString(),
          check_out_date: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      });
    } catch (error: any) {
      console.error("Booking creation failed: full error object:", error);
      console.error(
        "Booking creation failed: response data:",
        error?.response?.data,
      );
      console.error(
        "Booking creation failed: status:",
        error?.response?.status,
      );
      console.error("Booking creation failed: request config:", error?.config);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        error?.response?.data?.errors ||
        error?.message;

      const friendlyMessage =
        typeof backendMessage === "string"
          ? backendMessage
          : Array.isArray(backendMessage)
            ? backendMessage.join("\n")
            : "Your booking could not be created. Please check your details and try again.";

      Alert.alert("Booking Failed", friendlyMessage);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            renderItem={({ item }) => (
              <PropertyBannerImage uri={item} style={styles.mainImage} />
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewRef}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            keyExtractor={(_, index) => `img-${index}`}
          />

          {images.length > 1 && (
            <View style={styles.paginationRow}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === activeIndex
                          ? COLORS.white
                          : "rgba(255,255,255,0.5)",
                    },
                  ]}
                />
              ))}
            </View>
          )}

          <SafeAreaView style={styles.topActions}>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => router.back()}
            >
              <ChevronLeft size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundBtn}>
              <Heart size={20} color={COLORS.accent} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.roomHeaderCard}>
            <Text style={styles.title}>
              {currentRoom?.room_name || propertyNameDisplay || "Room Details"}
            </Text>
            {property.property_name ? (
              <Text style={styles.subTitle}>{property.property_name}</Text>
            ) : null}
            {locationTitle ? (
              <Text style={styles.locationText}>{locationTitle}</Text>
            ) : null}
          </View>

          <View style={styles.pricePill}>
            <Text style={styles.roomPriceText}>
              ₹
              {currentRoom?.base_price?.toLocaleString() ||
                minPrice?.toLocaleString() ||
                "0"}
              <Text style={styles.perNight}> / night</Text>
            </Text>
          </View>

          <View style={styles.infoGrid}>
            {currentRoom?.room_category?.category_name ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>
                  {currentRoom.room_category.category_name}
                </Text>
              </View>
            ) : null}

            {currentRoom?.room_capacity?.persons ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Guests</Text>
                <Text style={styles.infoValue}>
                  Up to {currentRoom.room_capacity.persons}
                </Text>
              </View>
            ) : null}

            {currentRoom?.bed_category?.length ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Beds</Text>
                <Text style={styles.infoValue}>
                  {currentRoom.bed_category
                    .map((b) => `${b.count || 1} x ${b.type || "Bed"}`)
                    .join(", ")}
                </Text>
              </View>
            ) : null}

            {currentRoom?.check_in_time || currentRoom?.check_out_time ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Check-in / Check-out</Text>
                <Text style={styles.infoValue}>
                  {currentRoom.check_in_time || "12:00 PM"} /{" "}
                  {currentRoom.check_out_time || "11:00 AM"}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.fullDivider} />

          {currentRoom?.description ? (
            <>
              <SectionHeader
                title="Room Description"
                style={styles.sectionTitle}
              />
              <Text style={styles.descriptionText}>
                {currentRoom.description}
              </Text>
              <View style={styles.fullDivider} />
            </>
          ) : null}

          {currentRoom?.amenities && currentRoom.amenities.length > 0 ? (
            <>
              <SectionHeader
                title="Room Amenities"
                style={styles.sectionTitle}
              />
              <View style={styles.amenitiesGrid}>
                {currentRoom.amenities.map((item, idx) => (
                  <View key={`room-amenity-${idx}`} style={styles.amenityChip}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.amenityText}>{item}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.fullDivider} />
            </>
          ) : null}

          {currentRoom?.room_images_url &&
            currentRoom.room_images_url.length > 0 ? (
            <>
              <SectionHeader title="Room Gallery" style={styles.sectionTitle} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScroll}
              >
                {currentRoom.room_images_url.map((img, index) => (
                  <RoomThumbImage
                    key={`gallery-${index}`}
                    uri={getFullImageUrl(img)}
                    style={styles.roomThumbImage}
                  />
                ))}
              </ScrollView>
              <View style={styles.fullDivider} />
            </>
          ) : null}

          {currentRoom ? (
            <>
              <SectionHeader title="Room Details" style={styles.sectionTitle} />
              <View style={styles.roomMetaSection}>
                {currentRoom.room_capacity?.adults ? (
                  <View style={styles.roomMetaRow}>
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={COLORS.primary}
                    />
                    <Text style={styles.roomMetaText}>
                      Capacity: {currentRoom.room_capacity.adults} Adults
                      {currentRoom.room_capacity.children
                        ? `, ${currentRoom.room_capacity.children} Children`
                        : ""}
                    </Text>
                  </View>
                ) : null}

                {currentRoom.bed_category &&
                  currentRoom.bed_category.length > 0 ? (
                  <View style={styles.roomMetaRow}>
                    <Ionicons
                      name="bed-outline"
                      size={14}
                      color={COLORS.secondary}
                    />
                    <Text style={styles.roomMetaText}>
                      Beds:{" "}
                      {currentRoom.bed_category
                        .map((b) => `${b.count || 1} x ${b.type || "Bed"}`)
                        .join(", ")}
                    </Text>
                  </View>
                ) : null}

                {currentRoom.extra_bed_type ? (
                  <View style={styles.roomMetaRow}>
                    <Ionicons
                      name="add-circle-outline"
                      size={14}
                      color={COLORS.secondary}
                    />
                    <Text style={styles.roomMetaText}>
                      Extra Bed: {currentRoom.extra_bed_type}
                      {currentRoom.extra_bed_capacity
                        ? ` (Capacity: ${currentRoom.extra_bed_capacity})`
                        : ""}
                      {currentRoom.extra_bed_price
                        ? ` — +₹${currentRoom.extra_bed_price}`
                        : ""}
                    </Text>
                  </View>
                ) : null}

                {(currentRoom as any).toilet_type ? (
                  <View style={styles.roomMetaRow}>
                    <Ionicons
                      name="water-outline"
                      size={14}
                      color={COLORS.secondary}
                    />
                    <Text style={styles.roomMetaText}>
                      Toilet: {(currentRoom as any).toilet_type}
                    </Text>
                  </View>
                ) : null}

                {(currentRoom as any).room_heating ? (
                  <View style={styles.roomMetaRow}>
                    <Ionicons
                      name="flame-outline"
                      size={14}
                      color={COLORS.secondary}
                    />
                    <Text style={styles.roomMetaText}>
                      Heating: {(currentRoom as any).room_heating}
                    </Text>
                  </View>
                ) : null}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>


      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>
            {minPrice ? `₹${minPrice.toLocaleString()}` : "Inquire Rate"}
          </Text>
          <Text style={styles.footerSub}>
            {minPrice ? "Starting price / night" : "Contact for pricing"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.reserveBtn, isBooking && styles.reserveBtnDisabled]}
          onPress={handleReserve}
          disabled={isBooking}
        >
          <Text style={styles.reserveBtnText}>
            {isBooking ? "Booking..." : "Book Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingBottom: 140 },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.inactive,
    fontWeight: "600",
  },
  notFoundCard: {
    alignItems: "center",
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.secondary,
    marginTop: 12,
    marginBottom: 6,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: COLORS.inactive,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  backHomeBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backHomeBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },

  // Header Image Carousel
  imageContainer: { height: 350, position: "relative" },
  mainImage: { width: width, height: "100%", resizeMode: "cover" },
  paginationRow: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 4 },
  topActions: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  // Main Content
  contentCard: { padding: 20 },
  roomHeaderCard: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.secondary },
  subTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.inactive,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 8,
  },
  pricePill: {
    backgroundColor: COLORS.greenLight,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    minWidth: "46%",
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.inactive,
    marginBottom: 4,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 12,
  },
  descriptionText: { fontSize: 15, color: COLORS.inactive, lineHeight: 22 },

  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.bgLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 15, fontWeight: "800", color: COLORS.secondary },
  statLabel: { fontSize: 11, color: COLORS.inactive, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },

  // Host info
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgLight,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hostAvatar: { width: 48, height: 48, borderRadius: 24 },
  hostAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  hostDetails: { marginLeft: 12, flex: 1 },
  hostName: { fontSize: 16, fontWeight: "700", color: COLORS.secondary },
  hostSubtext: { fontSize: 12, color: COLORS.inactive, marginTop: 1 },
  hostContact: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: "500",
  },

  // Amenities
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amenityText: { fontSize: 13, color: COLORS.secondary, fontWeight: "600" },

  // Room details list
  roomsListContainer: { gap: 12 },
  roomCard: {
    backgroundColor: COLORS.bgLight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  galleryScroll: {
    marginBottom: 12,
  },
  roomThumbImage: {
    width: 130,
    height: 90,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: COLORS.border,
  },
  roomHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomTitle: { fontSize: 16, fontWeight: "800", color: COLORS.secondary },
  roomPriceText: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  perNight: { fontSize: 11, fontWeight: "400", color: COLORS.inactive },
  roomDesc: {
    fontSize: 13,
    color: COLORS.inactive,
    marginTop: 6,
    lineHeight: 18,
  },
  roomMetaSection: {
    marginTop: 10,
    gap: 4,
  },
  roomMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roomMetaText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: "500",
  },
  roomAmenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  roomAmenityChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roomAmenityChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.secondary,
  },
  emptyRoomsBox: {
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.bgLight,
    borderRadius: 14,
  },
  emptyRoomsText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.inactive,
    textAlign: "center",
  },

  mapPlaceholder: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  mapText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.secondary,
    textAlign: "center",
    fontWeight: "600",
  },
  coordsText: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.inactive,
    textAlign: "center",
  },

  ruleItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ruleText: { marginLeft: 10, fontSize: 14, color: COLORS.secondary },

  fullDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerPrice: { fontSize: 20, fontWeight: "800", color: COLORS.secondary },
  footerSub: { fontSize: 12, color: COLORS.inactive },
  reserveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  reserveBtnDisabled: {
    backgroundColor: "#6ee7b7",
  },
  reserveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
