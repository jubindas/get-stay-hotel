import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
}

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
  green: "#10B981",
  greenBg: "#ECFDF5",
  amber: "#F59E0B",
  amberBg: "#FFFBEB",
  red: "#EF4444",
  redBg: "#FEF2F2",
};

export default function BookingCard({ booking, onPress }: BookingCardProps) {
  const formatDateShort = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    try {
      const start = new Date(checkIn).getTime();
      const end = new Date(checkOut).getTime();
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1;
    } catch {
      return 1;
    }
  };

  const roomCategory =
    booking.booking_items?.[0]?.room?.room_category?.name || "Deluxe Room";

  const nights = calculateNights(booking.check_in_date, booking.check_out_date);

  // Per-day room price and calculation breakdown
  const firstItem = booking.booking_items?.[0];
  const numRooms = firstItem?.number_of_rooms || 1;
  const grandTotal = Number(booking.grand_total) || 0;

  const perDayPrice =
    firstItem?.base_price_booked && firstItem.base_price_booked > 0
      ? firstItem.base_price_booked
      : firstItem?.room?.base_price && firstItem.room.base_price > 0
      ? firstItem.room.base_price
      : firstItem?.room_tariff && firstItem.room_tariff > 0
      ? Math.round(firstItem.room_tariff / (nights * numRooms))
      : nights > 0
      ? Math.round(grandTotal / (nights * numRooms))
      : grandTotal;

  const totalCalculated = perDayPrice * nights * numRooms;
  const totalAmountToShow = grandTotal > 0 ? grandTotal : totalCalculated;

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "confirmed" || s === "paid" || s === "completed") {
      return { bg: COLORS.greenBg, text: COLORS.green };
    }
    if (s === "pending" || s === "unpaid" || s === "partial") {
      return { bg: COLORS.amberBg, text: COLORS.amber };
    }
    if (s === "cancelled" || s === "failed") {
      return { bg: COLORS.redBg, text: COLORS.red };
    }
    return { bg: COLORS.surface, text: COLORS.navy };
  };

  const bookingStatusColor = getStatusColor(booking.booking_status);
  const paymentStatusColor = getStatusColor(booking.payment_status);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress(booking)}
    >
      {/* Top Header: Ref & Badges */}
      <View style={styles.topHeader}>
        <View style={styles.refBox}>
          <Ionicons name="receipt-outline" size={14} color={COLORS.gold} />
          <Text style={styles.refText}>{booking.booking_reference}</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: bookingStatusColor.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: bookingStatusColor.text }]} />
            <Text style={[styles.statusText, { color: bookingStatusColor.text }]}>
              {booking.booking_status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Property Details */}
      <View style={styles.propertySection}>
        <View style={styles.propertyHeader}>
          <Text style={styles.propertyName} numberOfLines={1}>
            {booking.property?.property_name || "GetStay Property"}
          </Text>
          <Text style={styles.locationText} numberOfLines={1}>
            <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />{" "}
            {[booking.property?.city, booking.property?.state].filter(Boolean).join(", ")}
          </Text>
        </View>

        <View style={styles.roomPill}>
          <Ionicons name="bed-outline" size={13} color={COLORS.navy} />
          <Text style={styles.roomPillText}>{roomCategory}</Text>
        </View>
      </View>

      {/* Dates Row */}
      <View style={styles.datesContainer}>
        <View style={styles.dateCol}>
          <Text style={styles.dateLabel}>CHECK-IN</Text>
          <Text style={styles.dateVal}>{formatDateShort(booking.check_in_date)}</Text>
        </View>

        <View style={styles.durationTag}>
          <Text style={styles.durationText}>{nights} {nights === 1 ? "Night" : "Nights"}</Text>
          <Ionicons name="arrow-forward" size={12} color={COLORS.gold} />
        </View>

        <View style={[styles.dateCol, { alignItems: "flex-end" }]}>
          <Text style={styles.dateLabel}>CHECK-OUT</Text>
          <Text style={styles.dateVal}>{formatDateShort(booking.check_out_date)}</Text>
        </View>
      </View>

      {/* Calculation Banner: e.g. 49 nights × ₹500 = ₹24,500 */}
      <View style={styles.calculationBadge}>
        <Ionicons name="calculator-outline" size={13} color={COLORS.navyMid} />
        <Text style={styles.calculationText}>
          {nights} {nights === 1 ? "night" : "nights"} × ₹{perDayPrice.toLocaleString("en-IN")}/night
          {numRooms > 1 ? ` (${numRooms} rooms)` : ""} = ₹{totalAmountToShow.toLocaleString("en-IN")}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Footer Price & Details Button */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.priceLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.priceVal}>₹{totalAmountToShow.toLocaleString("en-IN")}</Text>
          <Text style={styles.priceSubtext}>
            {nights} nights × ₹{perDayPrice.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.detailsBtn}>
          <Text style={styles.detailsBtnText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.navy} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.navy + "0A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  refText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  propertySection: {
    marginBottom: 14,
  },
  propertyHeader: {
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  roomPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roomPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  datesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 14,
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  dateVal: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy,
  },
  durationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gold,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  priceVal: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.navy,
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy,
  },
  calculationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calculationText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navyMid,
  },
  priceSubtext: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
