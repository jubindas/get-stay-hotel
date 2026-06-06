import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const THEME = {
  bg: "#f8fafc",
  primary: "#10b981",
  inactive: "#94a3b8",
  white: "#ffffff",
  border: "#f1f5f9",
  textDark: "#0f172a",
};

const ROOMS = [
  {
    id: "1",
    name: "Executive Suite",
    location: "Bhetapara, Guwahati",
    price: "₹2,500",
    oldPrice: "₹3,200",
    status: "Available",
    image: "https://picsum.photos/id/101/400/200",
    rating: "4.8",
    details: "2 Bed • 450 sqft",
    amenities: ["WiFi", "AC", "Breakfast"],
  },
  {
    id: "2",
    name: "Deluxe Ocean View",
    location: "Mission Chariali, Tezpur",
    price: "₹1,800",
    oldPrice: "₹2,100",
    status: "Booked",
    image: "https://picsum.photos/id/122/400/200",
    rating: "4.5",
    details: "1 Bed • 320 sqft",
    amenities: ["WiFi", "TV"],
  },
  {
    id: "3",
    name: "Family Garden Room",
    location: "JPR, Jorhat",
    price: "₹1,500",
    oldPrice: "₹1,750",
    status: "Available",
    image: "https://picsum.photos/id/164/400/200",
    rating: "4.2",
    details: "3 Bed • 600 sqft",
    amenities: ["WiFi", "AC", "Parking"],
  },
];

export default function RoomsList() {
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push("/room-details")}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {item.rating}</Text>
        </View>
        {item.oldPrice && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoText}>PROMO</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <View>
          <View style={styles.locationRow}>
            <Text style={styles.location}>{item.location}</Text>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    item.status === "Booked" ? "#ef4444" : THEME.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.roomName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.roomSubText}>{item.details}</Text>

          <View style={styles.amenitiesRow}>
            {item.amenities.map((amenity: any, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            {item.oldPrice && (
              <Text style={styles.oldPrice}>{item.oldPrice}</Text>
            )}
            <Text style={styles.price}>
              {item.price}
              <Text style={styles.perNight}>/night</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.bookBtn,
              item.status === "Booked" && styles.disabledBtn,
            ]}
          >
            <Text style={styles.bookBtnText}>
              {item.status === "Booked" ? "Details" : "Book"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={ROOMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },

  // --- Header Styling ---
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 14,
    color: THEME.inactive,
    fontWeight: "500",
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: "800",
    color: THEME.textDark,
    letterSpacing: -0.5,
  },
  profileWrapper: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16, // Modern squircle look
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  statusIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: THEME.primary,
    borderWidth: 3,
    borderColor: THEME.bg,
  },
  headerDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginTop: 20,
    width: "40%", // Decorative short line
    borderRadius: 1,
  },

  // --- Card Styling ---
  listPadding: { paddingBottom: 30 },
  card: {
    flexDirection: "row",
    backgroundColor: THEME.white,
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    elevation: 1,
  },
  imageContainer: { position: "relative" },
  image: { width: 110, height: 135, borderRadius: 18 },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: { fontSize: 10, fontWeight: "800", color: "#fbbf24" },
  promoBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: THEME.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  promoText: { color: THEME.white, fontSize: 8, fontWeight: "900" },

  detailsContainer: {
    flex: 1,
    paddingLeft: 16,
    paddingVertical: 2,
    justifyContent: "space-between",
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  roomName: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textDark,
    marginTop: 2,
  },
  roomSubText: { fontSize: 12, color: THEME.inactive, marginTop: 2 },

  amenitiesRow: { flexDirection: "row", marginTop: 8 },
  tag: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  tagText: { fontSize: 9, color: THEME.inactive, fontWeight: "600" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  oldPrice: {
    fontSize: 11,
    color: THEME.inactive,
    textDecorationLine: "line-through",
    marginBottom: -2,
  },
  price: { fontSize: 18, fontWeight: "800", color: THEME.textDark },
  perNight: { fontSize: 11, color: THEME.inactive, fontWeight: "400" },

  bookBtn: {
    backgroundColor: THEME.textDark,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },
  disabledBtn: { backgroundColor: "#e2e8f0" },
  bookBtnText: { color: THEME.white, fontSize: 12, fontWeight: "700" },
});
