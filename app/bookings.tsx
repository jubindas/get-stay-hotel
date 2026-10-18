import BookingCard from "@/components/bookings/BookingCard";

import BookingDetailModal from "@/components/bookings/BookingDetailModal";


import BookingSkeletonList from "@/components/bookings/BookingSkeleton";

import { useAuth } from "@/context/AuthContext";

import { getUserBookings } from "@/services/bookingService";

import { Booking } from "@/types/booking";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { useCallback, useEffect, useState } from "react";

import {
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  navy: "#0F1C2E",
  navyMid: "#1A2F4A",
  gold: "#C9A84C",
  goldLight: "#F0DFA0",
  white: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E8EDF3",
  textPrimary: "#0F1C2E",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  red: "#E05252",
  green: "#2D9E6B",
};

type FilterType = "All" | "Confirmed" | "Cancelled";

export default function MyBookingsScreen() {

  const { token, logout } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);

  const fetchBookings = useCallback(
    async (showRefreshIndicator = false) => {


      if (!token) {
        console.warn("⚠️ [BookingsScreen] No auth token found. User is not authenticated.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);
      setIsUnauthorized(false);

      try {
        const response = await getUserBookings(token);
        console.log("📦 [BookingsScreen] API Response received:", response);

        if (response && Array.isArray(response.data)) {
          console.log(`✅ [BookingsScreen] Successfully loaded ${response.data.length} bookings into state`);
          setBookings(response.data);
        } else {
          console.warn("⚠️ [BookingsScreen] Response received but 'data' is not an array:", response);
          setBookings([]);
        }
      } catch (error: any) {
        const status = error?.response?.status;
        const responseData = error?.response?.data;
        const requestUrl = error?.config?.baseURL
          ? `${error.config.baseURL}${error.config.url}`
          : error?.config?.url;


        if (status === 401) {
          setIsUnauthorized(true);
          setErrorMessage("Your session has expired. Please sign in again.");
          if (logout) {
            console.log("🔒 [BookingsScreen] Auto logging out due to 401 Unauthorized");
            await logout();
          }
        } else if (status === 404) {
          setErrorMessage("Booking endpoint not found (HTTP 404). Please verify backend URL and routes.");
        } else if (!error.response) {
          setErrorMessage("Network error: Cannot reach the backend. Please check network connection and backend status.");
        } else {
          const apiMsg = responseData?.message || responseData?.error;
          setErrorMessage(apiMsg || "Unable to fetch bookings. Please try again.");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, logout],
  );

  useEffect(() => {
    if (!token) return;

    const timeoutId = setTimeout(() => {
      void fetchBookings();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [token, fetchBookings]);

  // Filter & Search Logic
  const filteredBookings = bookings.filter((item) => {
    // Exclude any unpaid pending bookings
    if (item.booking_status === "Pending" && item.payment_status === "Pending") {
      return false;
    }

    const matchesFilter =
      activeFilter === "All" ||
      item.booking_status?.toLowerCase() === activeFilter.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      item.booking_reference
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.property?.property_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.property?.city?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleOpenDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const handleCloseDetail = () => {
    setModalVisible(false);
    setSelectedBooking(null);
  };

  const filterOptions: FilterType[] = [
    "All",
    "Confirmed",
    "Cancelled",
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Hero Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>My Bookings</Text>
            {token && bookings.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{bookings.length}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => fetchBookings(true)}
            hitSlop={10}
          >
            <Ionicons name="refresh" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {token && (
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={18}
              color={COLORS.textMuted}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by property or reference..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      {token && (
        <View style={styles.filterContainer}>
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {!token || isUnauthorized ? (
          /* Unauthenticated State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons
                name="lock-closed-outline"
                size={38}
                color={COLORS.navy}
              />
            </View>
            <Text style={styles.emptyTitle}>Sign in to view bookings</Text>
            <Text style={styles.emptySubtext}>
              Please sign in to access your current, past, and upcoming stay
              reservations.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.ctaButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          /* Skeleton Loading State */
          <BookingSkeletonList count={3} />
        ) : errorMessage ? (
          /* Error State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons
                name="alert-circle-outline"
                size={38}
                color={COLORS.red}
              />
            </View>
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySubtext}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => fetchBookings()}
            >
              <Text style={styles.ctaButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredBookings.length === 0 ? (
          /* Empty Bookings State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="bed-outline" size={38} color={COLORS.gold} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery || activeFilter !== "All"
                ? "No matching bookings"
                : "No bookings yet"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || activeFilter !== "All"
                ? "Try adjusting your search query or status filter."
                : "Explore luxury stays and start planning your next getaway today."}
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push("/rooms-list")}
            >
              <Text style={styles.ctaButtonText}>Explore Properties</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Bookings List */
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item.id || item.booking_reference}
            renderItem={({ item }) => (
              <BookingCard booking={item} onPress={handleOpenDetail} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchBookings(true)}
                tintColor={COLORS.gold}
                colors={[COLORS.gold]}
              />
            }
          />
        )}
      </View>


      <BookingDetailModal
        visible={modalVisible}
        booking={selectedBooking}
        authToken={token || undefined}
        onClose={handleCloseDetail}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.navyMid,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.navyMid,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navyMid,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    padding: 0,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.navyMid,
  },
  filterChipActive: {
    backgroundColor: COLORS.gold,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.navy,
    fontWeight: "800",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 2,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navy,
  },
});
