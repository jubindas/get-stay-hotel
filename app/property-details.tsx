import {
  PropertyBannerImage,
  RoomThumbImage,
} from "@/components/property/PropertyMedia";
import RelatedProperties from "@/components/property/RelatedProperties";
import SectionHeader from "@/components/ui/SectionHeader";
import { useAuth } from "@/context/AuthContext";
import {
  getPropertyById,
  getRelatedProperties,
  toggleSavedProperty,
} from "@/services/propertyService";
import { Property, RoomDetail } from "@/types/property";
import { getFullImageUrl } from "@/utils/image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Heart, Home, MapPin, User } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image as RNImage,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const onViewRef = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  useEffect(() => {
    if (!id) return;

    const fetchPropertyData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setProperty(null);
      setRelatedProperties([]);
      try {
        const [detailRes, relatedRes] = await Promise.all([
          // GET /api/public/properties/:id
          getPropertyById(id as string).catch((err) => {
            console.error("Error fetching property detail:", err);
            return null;
          }),
          // GET /api/public/properties/:id/related
          getRelatedProperties(id as string).catch((err) => {
            console.error("Error fetching related properties:", err);
            return null;
          }),
        ]);

        console.log(
          "Property details data:",
          JSON.stringify(detailRes?.property, null, 2),
        );

        if (detailRes && detailRes.property) {
          setProperty(detailRes.property);
        } else if (detailRes && detailRes.error) {
          setErrorMessage(detailRes.error);
        } else {
          setErrorMessage("Property details not found.");
        }

        if (relatedRes && Array.isArray(relatedRes.properties)) {
          setRelatedProperties(relatedRes.properties);
        } else {
          setRelatedProperties([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch property details:", err);
        setErrorMessage(
          "Unable to load property details. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyData();
  }, [id]);

  if (!id) {
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
          <Text style={styles.notFoundSubtitle}>No property ID provided.</Text>
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
              "The requested property details could not be loaded."}
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

  // Gallery image setup
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

  // Location string construction
  const cleanCity = property.city?.trim();
  const cleanState = property.state?.trim();
  const cleanVillage = property.village?.trim();
  const cleanPostOffice = property.post_office?.trim();
  const cleanAddress =
    property.address_display?.trim() || property.address?.trim();

  const locationTitle = [cleanCity, cleanState].filter(Boolean).join(", ");

  const fullAddress = [
    cleanAddress,
    cleanVillage,
    cleanPostOffice ? `P.O. ${cleanPostOffice}` : null,
    cleanCity,
    cleanState,
    property.pincode ? `PIN: ${property.pincode}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const propertyNameDisplay = (property.property_name || "").trim();

  // Calculate starting room price
  const roomList: RoomDetail[] = property.room_details || [];
  const roomPrices = roomList.map((r) => r.base_price).filter(Boolean);
  const minPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : null;

  const handleToggleSavedProperty = async () => {
    if (!id) return;

    if (!isAuthenticated) {
      Alert.alert("Login required", "Please log in to save this property.");
      return;
    }

    const previousState = isSaved;
    setSaving(true);
    setIsSaved(!previousState);

    try {
      const response = await toggleSavedProperty(id);
      const nextSaved = !!response?.saved;
      setIsSaved(nextSaved);

      if (response?.message) {
        Alert.alert("Saved property", response.message);
      }
    } catch (error: any) {
      setIsSaved(previousState);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to update saved property.";
      Alert.alert("Saved property", message);
    } finally {
      setSaving(false);
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
        {/* Banner Carousel */}
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
            <TouchableOpacity
              style={[styles.roundBtn, isSaved && styles.savedButton]}
              onPress={handleToggleSavedProperty}
              disabled={saving}
            >
              <Heart
                size={20}
                color={isSaved ? COLORS.accent : "#94a3b8"}
                fill={isSaved ? COLORS.accent : "transparent"}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Property Details Content */}
        <View style={styles.contentCard}>
          {property.category?.category_name && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {property.category.category_name}
              </Text>
            </View>
          )}

          <Text style={styles.title}>{propertyNameDisplay}</Text>
          <Text style={styles.subTitle}>{locationTitle}</Text>

          {/* Key Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {property.category?.category_name || "Property"}
              </Text>
              <Text style={styles.statLabel}>Category</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{roomList.length}</Text>
              <Text style={styles.statLabel}>Room Types</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{cleanCity || "Available"}</Text>
              <Text style={styles.statLabel}>City</Text>
            </View>
          </View>

          <View style={styles.fullDivider} />

          {/* Host Card */}
          {property.host && (
            <>
              <SectionHeader
                title="Host Information"
                style={styles.sectionTitle}
              />
              <View style={styles.hostCard}>
                {property.host.image_url ? (
                  <RNImage
                    source={{ uri: getFullImageUrl(property.host.image_url) }}
                    style={styles.hostAvatar}
                  />
                ) : (
                  <View style={styles.hostAvatarPlaceholder}>
                    <User size={24} color={COLORS.primary} />
                  </View>
                )}
                <View style={styles.hostDetails}>
                  <Text style={styles.hostName}>
                    Hosted by {property.host.full_name || "Property Host"}
                  </Text>
                  {property.host.created_at && (
                    <Text style={styles.hostSubtext}>
                      Joined in{" "}
                      {new Date(property.host.created_at).getFullYear()}
                    </Text>
                  )}
                  {property.host.email && (
                    <Text style={styles.hostContact}>
                      {property.host.email}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.fullDivider} />
            </>
          )}

          {/* Description */}
          {(property.description || property.category?.description) && (
            <>
              <SectionHeader
                title="About this property"
                style={styles.sectionTitle}
              />
              <Text style={styles.descriptionText}>
                {property.description || property.category?.description}
              </Text>
              <View style={styles.fullDivider} />
            </>
          )}

          {/* Property Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <>
              <SectionHeader
                title="Property Amenities & Features"
                style={styles.sectionTitle}
              />
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((item, idx) => (
                  <View key={`amenity-${idx}`} style={styles.amenityChip}>
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
          )}

          {/* Available Rooms */}
          <SectionHeader
            title="Available Rooms & Options"
            style={styles.sectionTitle}
          />
          {roomList.length === 0 ? (
            <View style={styles.emptyRoomsBox}>
              <Home size={24} color={COLORS.inactive} />
              <Text style={styles.emptyRoomsText}>
                No specific room listings configured yet for this property.
              </Text>
            </View>
          ) : (
            <View style={styles.roomsListContainer}>
              {roomList.map((room) => {
                const roomCatName =
                  room.room_category?.category_name || room.room_name || "Room";
                const roomImages = (room.room_images_url || []).map((img) =>
                  getFullImageUrl(img),
                );

                const adults = room.room_capacity?.adults;
                const persons = room.room_capacity?.persons;
                const children = room.room_capacity?.children;

                const capacityStr = [
                  adults ? `${adults} Adults` : null,
                  children ? `${children} Children` : null,
                  persons ? `(Max ${persons} Persons)` : null,
                ]
                  .filter(Boolean)
                  .join(" ");

                const bedsStr = room.bed_category
                  ?.map((b) => `${b.count || 1} x ${b.type || "Bed"}`)
                  .join(", ");

                return (
                  <View key={room.id} style={styles.roomCard}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push({
                          pathname: "/room-details",
                          params: {
                            id: property.id,
                            roomId: room.id,
                          },
                        })
                      }
                    >
                      {roomImages.length > 0 && (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={{ marginBottom: 12 }}
                        >
                          {roomImages.map((rImg, rIdx) => (
                            <RoomThumbImage
                              key={`rimg-${rIdx}`}
                              uri={rImg}
                              style={styles.roomThumbImage}
                            />
                          ))}
                        </ScrollView>
                      )}

                      <View style={styles.roomHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.roomTitle}>
                            {roomCatName}
                          </Text>
                        </View>
                        <Text style={styles.roomPriceText}>
                          ₹{room.base_price?.toLocaleString()}
                          <Text style={styles.perNight}> / night</Text>
                        </Text>
                      </View>

                      {room.description ? (
                        <Text style={styles.roomDesc}>{room.description}</Text>
                      ) : null}

                      <View style={styles.roomMetaSection}>
                        {capacityStr ? (
                          <View style={styles.roomMetaRow}>
                            <Ionicons
                              name="people-outline"
                              size={14}
                              color={COLORS.primary}
                            />
                            <Text style={styles.roomMetaText}>
                              Capacity: {capacityStr}
                            </Text>
                          </View>
                        ) : null}

                        {bedsStr ? (
                          <View style={styles.roomMetaRow}>
                            <Ionicons
                              name="bed-outline"
                              size={14}
                              color={COLORS.secondary}
                            />
                            <Text style={styles.roomMetaText}>
                              Beds: {bedsStr}
                            </Text>
                          </View>
                        ) : null}

                        {room.extra_bed_type ? (
                          <View style={styles.roomMetaRow}>
                            <Ionicons
                              name="add-circle-outline"
                              size={14}
                              color={COLORS.secondary}
                            />
                            <Text style={styles.roomMetaText}>
                              Extra Bed: {room.extra_bed_type} (Capacity:{" "}
                              {room.extra_bed_capacity || 1})
                              {room.extra_bed_price
                                ? ` — +₹${room.extra_bed_price}`
                                : ""}
                            </Text>
                          </View>
                        ) : null}

                        {room.toilet_type ? (
                          <View style={styles.roomMetaRow}>
                            <Ionicons
                              name="water-outline"
                              size={14}
                              color={COLORS.secondary}
                            />
                            <Text style={styles.roomMetaText}>
                              Toilet: {room.toilet_type}
                            </Text>
                          </View>
                        ) : null}

                        {room.room_heating ? (
                          <View style={styles.roomMetaRow}>
                            <Ionicons
                              name="flame-outline"
                              size={14}
                              color={COLORS.secondary}
                            />
                            <Text style={styles.roomMetaText}>
                              Heating: {room.room_heating}
                            </Text>
                          </View>
                        ) : null}

                        {room.check_in_time || room.check_out_time ? (
                          <View style={styles.roomMetaRow}>
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color={COLORS.inactive}
                            />
                            <Text style={styles.roomMetaText}>
                              Check-in: {room.check_in_time || "12:00 PM"} |
                              Check-out: {room.check_out_time || "11:00 AM"}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      {room.amenities && room.amenities.length > 0 && (
                        <View style={styles.roomAmenitiesContainer}>
                          {room.amenities.map((rAmenity, rIdx) => (
                            <View
                              key={`ram-${rIdx}`}
                              style={styles.roomAmenityChip}
                            >
                              <Text style={styles.roomAmenityChipText}>
                                {rAmenity}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.bookNowBtn}
                      activeOpacity={0.8}
                      onPress={() =>
                        router.push({
                          pathname: "/room-details",
                          params: {
                            id: property.id,
                            roomId: room.id,
                          },
                        })
                      }
                    >
                      <Text style={styles.bookNowBtnText}>Book Now</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color={COLORS.white}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.fullDivider} />

          {/* Location details */}
          <SectionHeader
            title="Location & Address"
            style={styles.sectionTitle}
          />
          <View style={styles.mapPlaceholder}>
            <MapPin size={24} color={COLORS.primary} />
            <Text style={styles.mapText}>
              {fullAddress || locationTitle || "Guwahati, Assam"}
            </Text>
            {property.latitude && property.longitude ? (
              <Text style={styles.coordsText}>
                GPS Coordinates: {property.latitude}, {property.longitude}
              </Text>
            ) : null}
          </View>
        </View>
        <RelatedProperties properties={relatedProperties} />
      </ScrollView>
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
  savedButton: {
    backgroundColor: "#ffe4e6",
  },

  contentCard: { padding: 20 },
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

  roomsListContainer: { gap: 12 },
  roomCard: {
    backgroundColor: COLORS.bgLight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  bookNowBtn: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bookNowBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
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
});
