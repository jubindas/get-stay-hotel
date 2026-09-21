import PropertyCard from "@/components/search/PropertyCard";
import PropertySkeletonList from "@/components/search/PropertySkeleton";
import { searchProperties } from "@/services/propertyService";
import { SearchedProperty } from "@/types/property";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight : 0;

interface GuestData {
  rooms: number;
  adults: number;
  children: number;
}

interface GuestPickerProps extends GuestData {
  visible: boolean;
  onClose: () => void;
  onApply: (r: number, a: number, c: number) => void;
}

const COLORS = {
  white: "#ffffff",
  black: "#0f172a",
  grayText: "#64748b",
  lightGray: "#f1f5f9",
  green: "#10b981",
  border: "#e2e8f0",
  headerBg: "#0f172a",
  headerText: "#000000",
  greenLight: "#d1fae5",
  red: "#ef4444",
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
};

const GuestPickerModal: React.FC<GuestPickerProps> = ({
  visible,
  rooms,
  adults,
  children,
  onClose,
  onApply,
}) => {
  const [r, setR] = useState(rooms);
  const [a, setA] = useState(adults);
  const [c, setC] = useState(children);

  const Counter = (
    label: string,
    value: number,
    setValue: (v: number) => void,
    min: number,
    max: number
  ) => (
    <View style={gStyles.row}>
      <Text style={gStyles.label}>{label}</Text>
      <View style={gStyles.counterRow}>
        <TouchableOpacity
          style={[gStyles.btn, value <= min && gStyles.btnDisabled]}
          onPress={() => value > min && setValue(value - 1)}
        >
          <Ionicons
            name="remove"
            size={20}
            color={value <= min ? COLORS.grayText : COLORS.green}
          />
        </TouchableOpacity>
        <Text style={gStyles.value}>{value}</Text>
        <TouchableOpacity
          style={[gStyles.btn, value >= max && gStyles.btnDisabled]}
          onPress={() => value < max && setValue(value + 1)}
        >
          <Ionicons
            name="add"
            size={20}
            color={value >= max ? COLORS.grayText : COLORS.green}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={gStyles.overlay}>
        <View style={gStyles.sheet}>
          <Text style={gStyles.title}>Select Guests</Text>
          {Counter("Rooms", r, setR, 1, 10)}
          {Counter("Adults", a, setA, 1, 20)}
          {Counter("Children", c, setC, 0, 10)}
          <TouchableOpacity
            style={gStyles.apply}
            onPress={() => onApply(r, a, c)}
          >
            <Text style={gStyles.applyText}>Apply Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function OyoStyleSearchBar() {
  const [location, setLocation] = useState("");
  const [checkin, setCheckin] = useState(new Date());
  const [guestData, setGuestData] = useState<GuestData>({
    rooms: 1,
    adults: 1,
    children: 0,
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);

  // Search API States
  const [properties, setProperties] = useState<SearchedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSearchResults = useCallback(
    async (queryKeyword: string = "", isPullToRefresh = false) => {
      if (isPullToRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const response = await searchProperties(queryKeyword);
        console.log("Search query:", queryKeyword);
        console.log("Search response properties:", response?.properties);
        if (response && Array.isArray(response.properties)) {
          setProperties(response.properties);
        } else {
          setProperties([]);
        }
      } catch (error: any) {
        console.error("Error searching properties:", error);
        setErrorMessage("Failed to load properties. Please try again.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Initial load: Fetch all active properties
  useEffect(() => {
    fetchSearchResults("");
  }, [fetchSearchResults]);

  // Debounced search on typing location
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchResults(location);
    }, 450);

    return () => clearTimeout(timer);
  }, [location, fetchSearchResults]);

  const handleManualSearch = () => {
    fetchSearchResults(location);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
        translucent
      />

      {/* Top Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerBack}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Find Hotels & Stays</Text>
            <Text style={styles.headerSubtitle}>
              Discover your perfect getaway
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => fetchSearchResults(location, true)}
          >
            <Ionicons name="refresh" size={20} color={COLORS.green} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchSearchResults(location, true)}
            tintColor={COLORS.green}
            colors={[COLORS.green]}
          />
        }
      >
        {/* Search Bar Input */}
        <View style={styles.searchHeader}>
          <Ionicons
            name="search-outline"
            size={20}
            color={COLORS.grayText}
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search city, location, stay name..."
            placeholderTextColor={COLORS.grayText}
            style={styles.searchInput}
            value={location}
            onChangeText={setLocation}
            returnKeyType="search"
            onSubmitEditing={handleManualSearch}
          />
          {location.length > 0 && (
            <TouchableOpacity onPress={() => setLocation("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.grayText} />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Info Row (Check-in & Guests) */}
        <View style={styles.quickInfoRow}>
          <TouchableOpacity
            style={styles.infoSegment}
            onPress={() => setDatePickerVisible(true)}
          >
            <View style={styles.infoIconRow}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={COLORS.grayText}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.label}>CHECK-IN</Text>
            </View>
            <Text style={styles.greenText}>{formatDate(checkin)}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.infoSegment}
            onPress={() => setGuestModalVisible(true)}
          >
            <View style={styles.infoIconRow}>
              <Ionicons
                name="people-outline"
                size={13}
                color={COLORS.grayText}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.label}>GUESTS</Text>
            </View>
            <Text style={styles.greenText}>
              {guestData.rooms} R · {guestData.adults + guestData.children} G
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search CTA Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleManualSearch}
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons
                  name="search"
                  size={20}
                  color={COLORS.white}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.searchBtnText}>Search Properties</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeaderRow}>
            <Text style={styles.resultsTitle}>
              {location ? `Results for "${location}"` : "Available Properties"}
            </Text>
            {!isLoading && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{properties.length}</Text>
              </View>
            )}
          </View>

          {isLoading ? (
            <PropertySkeletonList count={3} />
          ) : errorMessage ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={38} color={COLORS.red} />
              <Text style={styles.emptyTitle}>Error loading properties</Text>
              <Text style={styles.emptySubtext}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => fetchSearchResults(location)}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : properties.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="location-outline" size={34} color={COLORS.green} />
              </View>
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptySubtext}>
                We couldn't find any stays matching "{location}". Try searching for another city like "Guwahati" or "Dispur".
              </Text>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {properties.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        themeVariant="light"
        onConfirm={(date) => {
          setDatePickerVisible(false);
          setCheckin(date);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />

      {/* Guest Picker Modal */}
      <GuestPickerModal
        visible={guestModalVisible}
        {...guestData}
        onClose={() => setGuestModalVisible(false)}
        onApply={(r, a, c) => {
          setGuestData({ rooms: r, adults: a, children: c });
          setGuestModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop:
      Platform.OS === "android" && STATUS_BAR_HEIGHT
        ? STATUS_BAR_HEIGHT + 10
        : 50,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.green,
    fontWeight: "600",
    marginTop: 1,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    fontWeight: "500",
    padding: 0,
  },
  quickInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoSegment: { flex: 1 },
  infoIconRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  label: {
    fontSize: 10,
    color: COLORS.grayText,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  greenText: { color: COLORS.green, fontSize: 13, fontWeight: "700" },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  buttonContainer: { paddingHorizontal: 16, marginTop: 12 },
  searchBtn: {
    backgroundColor: COLORS.green,
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },

  /* Results Section */
  resultsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  resultsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.green,
  },
  cardsList: {
    paddingTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.greenLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.grayText,
    textAlign: "center",
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: COLORS.black,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 13,
  },
});

const gStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  sheet: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  label: { fontSize: 16, fontWeight: "600", color: COLORS.black },
  counterRow: { flexDirection: "row", alignItems: "center" },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { borderColor: COLORS.border, opacity: 0.5 },
  value: {
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 15,
    color: COLORS.black,
  },
  apply: {
    backgroundColor: COLORS.green,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  applyText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
