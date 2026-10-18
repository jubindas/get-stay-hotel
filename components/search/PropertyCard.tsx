import { SearchedProperty } from "@/types/property";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PropertyCardProps {
  property: SearchedProperty;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

const COLORS = {
  black: "#0F172A",
  white: "#FFFFFF",
  grayText: "#64748B",
  lightGray: "#F8FAFC",
  green: "#10B981",
  greenLight: "#ECFDF5",
  border: "#E2E8F0",
  gold: "#C9A84C",
  goldLight: "#FFFBEB",
};

import { getFullImageUrl } from "@/utils/image";

export default function PropertyCard({ property }: PropertyCardProps) {
  const [imgError, setImgError] = React.useState(false);

  // Image resolution logic
  const getPropertyImageUrl = (): string => {
    if (imgError) return getFullImageUrl(null);
    const rawPath =
      property.property_images?.[0] || property.category?.image_url;
    return getFullImageUrl(rawPath);
  };

  // Category name logic
  const categoryName =
    property.category?.category_name ||
    property.category?.name ||
    "Property";

  // Location display
  const locationDisplay = [property.city, property.state]
    .filter(Boolean)
    .map((s) => s?.trim())
    .join(", ");

  const fullAddress = [property.address_display, property.village]
    .filter(Boolean)
    .map((s) => s?.trim())
    .join(", ");

  // Room details & starting price calculation
  const rooms = property.room_details || [];
  const hasRooms = rooms.length > 0;

  let minPrice: number | null = null;
  let primaryRoomCategory = "";
  let totalCapacity = 2;

  if (hasRooms) {
    const prices = rooms.map((r) => r.base_price).filter(Boolean);
    if (prices.length > 0) {
      minPrice = Math.min(...prices);
    }

    const firstRoom = rooms[0];
    primaryRoomCategory =
      firstRoom?.room_category?.category_name ||
      firstRoom?.room_category?.name ||
      firstRoom?.room_name ||
      `${rooms.length} Room Types`;

    if (firstRoom?.room_capacity) {
      totalCapacity =
        (firstRoom.room_capacity.adults || 0) +
        (firstRoom.room_capacity.children || 0) ||
        firstRoom.room_capacity.persons ||
        firstRoom?.max_guests ||
        2;
    } else if (firstRoom?.max_guests) {
      totalCapacity = firstRoom.max_guests;
    }
  }

  // Amenities display (up to 3 chips)
  const amenitiesList = property.amenities || [];
  const displayAmenities = amenitiesList.slice(0, 3);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() =>
        router.push({
          pathname: "/property-details",
          params: { id: property.id },
        })
      }
    >
      {/* Property Image Thumbnail */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: getPropertyImageUrl() }}
          style={styles.image}
          onError={() => setImgError(true)}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryName}</Text>
        </View>

        {property.property_images && property.property_images.length > 1 && (
          <View style={styles.photoCountBadge}>
            <Ionicons name="images-outline" size={10} color={COLORS.white} />
            <Text style={styles.photoCountText}>
              {property.property_images.length}
            </Text>
          </View>
        )}
      </View>

      {/* Main Details */}
      <View style={styles.content}>
        <View>
          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={13} color={COLORS.green} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationDisplay || "Guwahati, Assam"}
            </Text>
          </View>

          {/* Property Name */}
          <Text style={styles.propertyName} numberOfLines={1}>
            {property.property_name}
          </Text>

          {/* Street / Village address */}
          {fullAddress ? (
            <Text style={styles.addressText} numberOfLines={1}>
              {fullAddress}
            </Text>
          ) : null}

          {/* Room / Capacity Tag */}
          <View style={styles.tagsRow}>
            {hasRooms ? (
              <View style={styles.roomBadge}>
                <Ionicons name="bed-outline" size={12} color={COLORS.black} />
                <Text style={styles.roomBadgeText}>
                  {primaryRoomCategory} • {totalCapacity} Guests
                </Text>
              </View>
            ) : (
              <View style={styles.roomBadge}>
                <Ionicons name="home-outline" size={12} color={COLORS.black} />
                <Text style={styles.roomBadgeText}>Entire Property</Text>
              </View>
            )}

            {/* Host badge */}
            {property.host?.full_name ? (
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>
                  Host: {property.host.full_name}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Amenities Chips */}
          {displayAmenities.length > 0 && (
            <View style={styles.amenitiesContainer}>
              {displayAmenities.map((amenity, idx) => (
                <View key={`amenity-${idx}`} style={styles.amenityChip}>
                  <Text style={styles.amenityChipText}>{amenity}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Card Footer: Price & CTA */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>
              {minPrice ? "STARTING FROM" : "PRICING"}
            </Text>
            {minPrice ? (
              <Text style={styles.priceVal}>
                ₹{minPrice.toLocaleString()}{" "}
                <Text style={styles.perNight}>/ night</Text>
              </Text>
            ) : (
              <Text style={styles.contactVal}>Explore Rates</Text>
            )}
          </View>

          <View style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>View</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrapper: {
    position: "relative",
    width: 115,
    height: 145,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.lightGray,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.white,
  },
  photoCountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  photoCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.green,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.grayText,
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roomBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.black,
  },
  hostBadge: {
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hostBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.green,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  amenityChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  amenityChipText: {
    fontSize: 10,
    color: COLORS.grayText,
    fontWeight: "500",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.grayText,
    letterSpacing: 0.8,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.black,
  },
  contactVal: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.green,
  },
  perNight: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.grayText,
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },
});
