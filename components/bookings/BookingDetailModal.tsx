import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BookingDetailModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
}

const COLORS = {
  navy: "#0F1C2E",
  navyLight: "#1A2F4A",
  gold: "#C9A84C",
  goldLight: "#F5EBCB",
  white: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  textPrimary: "#0F1C2E",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  green: "#10B981",
  greenBg: "#ECFDF5",
  amber: "#F59E0B",
  amberBg: "#FFFBEB",
  red: "#EF4444",
  redBg: "#FEF2F2",
  blue: "#3B82F6",
  blueBg: "#EFF6FF",
};

export default function BookingDetailModal({
  visible,
  booking,
  onClose,
}: BookingDetailModalProps) {
  if (!booking) return null;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        weekday: "short",
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

  const roomName =
    booking.booking_items?.[0]?.room?.room_category?.name || "Standard Room";

  const nights = calculateNights(booking.check_in_date, booking.check_out_date);

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
    return { bg: COLORS.blueBg, text: COLORS.blue };
  };

  const bookingStatusColors = getStatusColor(booking.booking_status);
  const paymentStatusColors = getStatusColor(booking.payment_status);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
            <Ionicons name="close" size={24} color={COLORS.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Reference Banner Card */}
          <View style={styles.refBanner}>
            <View style={styles.refRow}>
              <View>
                <Text style={styles.refLabel}>BOOKING REFERENCE</Text>
                <Text style={styles.refCode}>{booking.booking_reference}</Text>
              </View>
              <View style={styles.badgeGroup}>
                <View style={[styles.pillBadge, { backgroundColor: bookingStatusColors.bg }]}>
                  <Text style={[styles.pillText, { color: bookingStatusColors.text }]}>
                    {booking.booking_status}
                  </Text>
                </View>
                <View style={[styles.pillBadge, { backgroundColor: paymentStatusColors.bg, marginTop: 4 }]}>
                  <Text style={[styles.pillText, { color: paymentStatusColors.text }]}>
                    Payment: {booking.payment_status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Property Details */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="location-sharp" size={20} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Property Information</Text>
            </View>
            <Text style={styles.propertyName}>{booking.property?.property_name}</Text>
            <Text style={styles.propertyAddress}>
              {[
                booking.property?.address_display,
                booking.property?.city,
                booking.property?.state,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
            <View style={styles.roomTag}>
              <Ionicons name="bed-outline" size={16} color={COLORS.navy} />
              <Text style={styles.roomTagText}>{roomName}</Text>
            </View>
          </View>

          {/* Dates & Duration Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="calendar-sharp" size={20} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Reservation Dates</Text>
            </View>

            <View style={styles.datesGrid}>
              <View style={styles.dateCol}>
                <Text style={styles.dateSubLabel}>CHECK-IN</Text>
                <Text style={styles.dateMainText}>{formatDate(booking.check_in_date)}</Text>
                <Text style={styles.timeHint}>From 12:00 PM</Text>
              </View>

              <View style={styles.nightsBadge}>
                <Text style={styles.nightsBadgeText}>{nights} {nights === 1 ? "Night" : "Nights"}</Text>
              </View>

              <View style={[styles.dateCol, { alignItems: "flex-end" }]}>
                <Text style={styles.dateSubLabel}>CHECK-OUT</Text>
                <Text style={styles.dateMainText}>{formatDate(booking.check_out_date)}</Text>
                <Text style={styles.timeHint}>Until 11:00 AM</Text>
              </View>
            </View>
          </View>

          {/* Guest Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="person-circle-sharp" size={20} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Primary Guest Details</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoVal}>{booking.guest_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoVal}>{booking.guest_email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoVal}>{booking.guest_phone}</Text>
            </View>
          </View>

          {/* Payment Breakdown */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="receipt-sharp" size={20} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Payment Summary</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Grand Total</Text>
              <Text style={styles.priceVal}>₹{booking.grand_total?.toLocaleString()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount Paid</Text>
              <Text style={[styles.priceVal, { color: COLORS.green }]}>
                ₹{booking.amount_paid?.toLocaleString()}
              </Text>
            </View>

            {booking.grand_total - booking.amount_paid > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Balance Due</Text>
                <Text style={[styles.priceVal, { color: COLORS.red }]}>
                  ₹{(booking.grand_total - booking.amount_paid)?.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.navy,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  refBanner: {
    backgroundColor: COLORS.navy,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  refLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  refCode: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  badgeGroup: {
    alignItems: "flex-end",
  },
  pillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.navy,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  roomTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  roomTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.navy,
  },
  datesGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
  },
  dateCol: {
    flex: 1,
  },
  dateSubLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  dateMainText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.navy,
    marginBottom: 2,
  },
  timeHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  nightsBadge: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nightsBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gold,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.navy,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy,
  },
});
