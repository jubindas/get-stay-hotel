import { useAuth } from "@/context/AuthContext";
import {
  BookingItemBreakdown,
  BookingPaymentBreakdown,
  getBookingPaymentBreakdown,
} from "@/services/bookingService";
import { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface BookingDetailModalProps {
  visible: boolean;
  booking: Booking | null;
  authToken?: string;
  onClose: () => void;
}

const COLORS = {
  navy: "#0A1424",
  navyCard: "#11223B",
  navyBorder: "#1E355B",
  gold: "#C9A84C",
  goldDark: "#9A7B2C",
  goldLight: "#FAF3E1",
  goldBorder: "#E8D5A3",
  white: "#FFFFFF",
  surface: "#F4F6F9",
  card: "#FFFFFF",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  green: "#059669",
  greenBg: "#ECFDF5",
  greenBorder: "#A7F3D0",
  amber: "#D97706",
  amberBg: "#FFFBEB",
  amberBorder: "#FDE68A",
  red: "#DC2626",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
  blue: "#2563EB",
  blueBg: "#EFF6FF",
  blueBorder: "#BFDBFE",
};

export default function BookingDetailModal({
  visible,
  booking,
  authToken,
  onClose,
}: BookingDetailModalProps) {
  const { token: contextToken } = useAuth();

  const [breakdown, setBreakdown] = useState<BookingPaymentBreakdown | null>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState<boolean>(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Fetch payment breakdown when modal is opened for a booking
  useEffect(() => {
    if (visible && booking?.id) {
      fetchBreakdown(booking.id);
    } else {
      setBreakdown(null);
      setBreakdownError(null);
      setCopiedRef(false);
    }
  }, [visible, booking?.id]);

  const fetchBreakdown = async (bookingId: string) => {
    setLoadingBreakdown(true);
    setBreakdownError(null);
    try {
      const activeToken = authToken || contextToken || undefined;
      console.log("=================================================");
      console.log(`🔍 [BookingDetailModal] Fetching payment breakdown for booking: ${bookingId}`);
      console.log("🔑 [BookingDetailModal] Auth Token present:", !!activeToken);
      const res = await getBookingPaymentBreakdown(bookingId, activeToken);
      console.log("✅ [BookingDetailModal] Payment breakdown response:", JSON.stringify(res, null, 2));
      const data = res?.data || (res as any);
      setBreakdown(data);
    } catch (err: any) {
      console.error("=================================================");
      console.error(`🔴 [BookingDetailModal] Error fetching payment breakdown for ${bookingId}:`);
      console.error("Status:", err?.response?.status ?? "NO_RESPONSE");
      console.error("Response Data:", JSON.stringify(err?.response?.data, null, 2));
      console.error("Error Message:", err?.message);
      console.error("=================================================");
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Itemized payment breakdown is not available yet.";
      setBreakdownError(msg);
    } finally {
      setLoadingBreakdown(false);
    }
  };

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
    booking.booking_items?.[0]?.room?.room_category?.name ||
    booking.booking_items?.[0]?.room?.name ||
    "Standard Room";

  const nights = calculateNights(booking.check_in_date, booking.check_out_date);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "confirmed" || s === "paid" || s === "completed") {
      return { bg: COLORS.greenBg, text: COLORS.green, border: COLORS.greenBorder };
    }
    if (s === "pending" || s === "unpaid" || s === "partial") {
      return { bg: COLORS.amberBg, text: COLORS.amber, border: COLORS.amberBorder };
    }
    if (s === "cancelled" || s === "failed") {
      return { bg: COLORS.redBg, text: COLORS.red, border: COLORS.redBorder };
    }
    return { bg: COLORS.blueBg, text: COLORS.blue, border: COLORS.blueBorder };
  };

  const bookingStatusColors = getStatusColor(booking.booking_status);
  const paymentStatusColors = getStatusColor(booking.payment_status);

  // Compute breakdown line items & aggregated totals
  const items: BookingItemBreakdown[] = breakdown?.booking_items || [];
  const hasItemBreakdown = items.length > 0;

  const totalRoomTariff = items.reduce(
    (sum, it) => sum + (Number(it.room_tariff) || 0),
    0,
  );
  const totalRoomGst = items.reduce(
    (sum, it) => sum + (Number(it.gst_on_room_tariff) || 0),
    0,
  );
  const totalPlatformFeeWithGst = items.reduce(
    (sum, it) =>
      sum +
      (Number(it.platform_fee) || 0) +
      (Number(it.gst_on_platform_fee) || 0),
    0,
  );

  const grandTotal =
    breakdown?.grand_total ?? booking.grand_total ?? 0;
  const amountPaid = booking.amount_paid ?? 0;
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  const firstItem = booking.booking_items?.[0];
  const numRooms = firstItem?.number_of_rooms || 1;
  const perDayPrice =
    firstItem?.base_price_booked && firstItem.base_price_booked > 0
      ? firstItem.base_price_booked
      : firstItem?.room?.base_price && firstItem.room.base_price > 0
        ? firstItem.room.base_price
        : totalRoomTariff && totalRoomTariff > 0
          ? Math.round(totalRoomTariff / (nights * numRooms))
          : nights > 0
            ? Math.round(grandTotal / (nights * numRooms))
            : grandTotal;

  const totalCalculated = perDayPrice * nights * numRooms;

  const formatPrice = (val?: number | string | null) => {
    if (val === undefined || val === null || isNaN(Number(val))) return "₹0";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  const handleCopyRef = () => {
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Close booking modal"
          >
            <Ionicons name="close" size={20} color={COLORS.navy} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Booking Voucher</Text>
            <Text style={styles.headerSubtitle}>Official Reservation & Receipt</Text>
          </View>
          <TouchableOpacity
            onPress={handleCopyRef}
            style={styles.copyHeaderBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={copiedRef ? "checkmark-circle" : "copy-outline"}
              size={18}
              color={copiedRef ? COLORS.green : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.surface }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Reference Banner Card (Digital Boarding Pass Style) */}
          <View style={styles.refCard}>
            <View style={styles.refTopRow}>
              <View>
                <View style={styles.refBadgeLabel}>
                  <Ionicons name="ticket-outline" size={13} color={COLORS.gold} />
                  <Text style={styles.refLabelText}>BOOKING REFERENCE</Text>
                </View>
                <Text style={styles.refCodeText}>{booking.booking_reference}</Text>
              </View>
              <View style={styles.statusBadgesCol}>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: bookingStatusColors.bg,
                      borderColor: bookingStatusColors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: bookingStatusColors.text },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: bookingStatusColors.text },
                    ]}
                  >
                    {booking.booking_status}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: paymentStatusColors.bg,
                      borderColor: paymentStatusColors.border,
                      marginTop: 6,
                    },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={11}
                    color={paymentStatusColors.text}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: paymentStatusColors.text },
                    ]}
                  >
                    {booking.payment_status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Ticket Perforation Line */}
            <View style={styles.ticketDividerRow}>
              <View style={styles.ticketPunchLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.ticketPunchRight} />
            </View>

            <View style={styles.refBottomRow}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>ROOM TYPE</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {roomName}
                </Text>
              </View>
              <View style={styles.metaColRight}>
                <Text style={styles.metaLabel}>TOTAL STAY</Text>
                <Text style={styles.metaValue}>
                  {nights} {nights === 1 ? "Night" : "Nights"}
                </Text>
              </View>
            </View>
          </View>

          {/* Property Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="business" size={17} color={COLORS.gold} />
              </View>
              <Text style={styles.cardTitle}>Property Details</Text>
            </View>

            <Text style={styles.propertyName}>{booking.property?.property_name}</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.propertyAddress}>
                {[
                  booking.property?.address_display,
                  booking.property?.city,
                  booking.property?.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>

            <View style={styles.roomTagBadge}>
              <Ionicons name="bed-outline" size={15} color={COLORS.navy} />
              <Text style={styles.roomTagText}>{roomName}</Text>
            </View>
          </View>

          {/* Stay Dates Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar" size={17} color={COLORS.gold} />
              </View>
              <Text style={styles.cardTitle}>Stay Itinerary</Text>
            </View>

            <View style={styles.stayDatesContainer}>
              <View style={styles.dateCol}>
                <Text style={styles.dateTypeLabel}>CHECK-IN</Text>
                <Text style={styles.dateMainText}>
                  {formatDate(booking.check_in_date)}
                </Text>
                <Text style={styles.dateTimeHint}>From 12:00 PM</Text>
              </View>

              <View style={styles.durationPill}>
                <Ionicons name="moon" size={12} color={COLORS.gold} />
                <Text style={styles.durationPillText}>
                  {nights} {nights === 1 ? "Night" : "Nights"}
                </Text>
              </View>

              <View style={[styles.dateCol, { alignItems: "flex-end" }]}>
                <Text style={styles.dateTypeLabel}>CHECK-OUT</Text>
                <Text style={styles.dateMainText}>
                  {formatDate(booking.check_out_date)}
                </Text>
                <Text style={styles.dateTimeHint}>Until 11:00 AM</Text>
              </View>
            </View>

            {/* Calculation formula: e.g. 49 nights × ₹500/night = ₹24,500 */}
            <View style={styles.stayCalculationBanner}>
              <Ionicons name="calculator-outline" size={14} color={COLORS.navy} />
              <Text style={styles.stayCalculationText}>
                {nights} {nights === 1 ? "night" : "nights"} × ₹{perDayPrice.toLocaleString("en-IN")}/night{numRooms > 1 ? ` (${numRooms} rooms)` : ""} = ₹{totalCalculated.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          {/* Guest Information */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={17} color={COLORS.gold} />
              </View>
              <Text style={styles.cardTitle}>Guest Information</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="person-outline" size={15} color={COLORS.textMuted} />
                <Text style={styles.detailLabel}>Primary Guest</Text>
              </View>
              <Text style={styles.detailValue}>{booking.guest_name}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="mail-outline" size={15} color={COLORS.textMuted} />
                <Text style={styles.detailLabel}>Email</Text>
              </View>
              <Text style={styles.detailValue}>{booking.guest_email}</Text>
            </View>

            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="call-outline" size={15} color={COLORS.textMuted} />
                <Text style={styles.detailLabel}>Phone Number</Text>
              </View>
              <Text style={styles.detailValue}>{booking.guest_phone}</Text>
            </View>
          </View>

          {/* ITEM-WISE PAYMENT BREAKDOWN CARD */}
          <View style={[styles.card, styles.breakdownCard]}>
            <View style={styles.breakdownHeaderRow}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.goldLight }]}>
                  <Ionicons name="receipt" size={17} color={COLORS.goldDark} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Payment Breakdown</Text>
                  <Text style={styles.breakdownSubtitle}>
                    Itemized GST & fee calculations
                  </Text>
                </View>
              </View>

              {loadingBreakdown && (
                <ActivityIndicator size="small" color={COLORS.gold} />
              )}
            </View>

            {/* Error or Retry banner */}
            {breakdownError && !loadingBreakdown && (
              <View style={styles.breakdownErrorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.amber} />
                <Text style={styles.breakdownErrorText}>
                  {breakdownError}
                </Text>
                <TouchableOpacity
                  onPress={() => fetchBreakdown(booking.id)}
                  style={styles.retryBtn}
                >
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Itemized breakdown per room item */}
            {hasItemBreakdown && (
              <View style={styles.itemsListContainer}>
                {items.map((item, index) => {
                  const categoryName =
                    item.room?.room_category?.name ||
                    `Room ${index + 1}`;

                  return (
                    <View key={item.id || index} style={styles.itemBlock}>
                      <View style={styles.itemCategoryRow}>
                        <View style={styles.itemCategoryBadge}>
                          <Ionicons name="bed" size={12} color={COLORS.navy} />
                          <Text style={styles.itemCategoryText}>
                            {categoryName}
                          </Text>
                        </View>
                        <Text style={styles.itemCategoryTotal}>
                          {formatPrice(item.total_guest_payment)}
                        </Text>
                      </View>

                      {/* Line items */}
                      <View style={styles.breakdownLine}>
                        <Text style={styles.lineLabel}>
                          Base Room Tariff ({nights} {nights === 1 ? "night" : "nights"} × ₹{perDayPrice.toLocaleString("en-IN")})
                        </Text>
                        <Text style={styles.lineVal}>
                          {formatPrice(item.room_tariff || perDayPrice * nights * (item.number_of_rooms || 1))}
                        </Text>
                      </View>

                      <View style={styles.breakdownLine}>
                        <Text style={styles.lineLabel}>GST on Room Tariff</Text>
                        <Text style={styles.lineVal}>
                          {formatPrice(item.gst_on_room_tariff)}
                        </Text>
                      </View>

                      <View style={styles.breakdownLine}>
                        <Text style={styles.lineLabel}>Platform Fee with GST</Text>
                        <Text style={styles.lineVal}>
                          {formatPrice(
                            (Number(item.platform_fee) || 0) +
                              (Number(item.gst_on_platform_fee) || 0)
                          )}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {/* Subtotals & Taxes across items */}
                <View style={styles.dashedDivider} />

                <View style={styles.breakdownLine}>
                  <Text style={styles.summaryLineLabel}>Total Room Tariff</Text>
                  <Text style={styles.summaryLineVal}>
                    {formatPrice(totalRoomTariff)}
                  </Text>
                </View>

                <View style={styles.breakdownLine}>
                  <Text style={styles.summaryLineLabel}>Total GST on Room</Text>
                  <Text style={styles.summaryLineVal}>
                    {formatPrice(totalRoomGst)}
                  </Text>
                </View>

                <View style={styles.breakdownLine}>
                  <Text style={styles.summaryLineLabel}>Total Platform Fee with GST</Text>
                  <Text style={styles.summaryLineVal}>
                    {formatPrice(totalPlatformFeeWithGst)}
                  </Text>
                </View>
              </View>
            )}

            {/* Fallback if breakdown items are empty but grand total exists */}
            {!hasItemBreakdown && !loadingBreakdown && (
              <View style={styles.fallbackBreakdownBox}>
                <View style={styles.breakdownLine}>
                  <Text style={styles.lineLabel}>
                    Stay Tariff ({nights} {nights === 1 ? "night" : "nights"} × ₹{perDayPrice.toLocaleString("en-IN")})
                  </Text>
                  <Text style={styles.lineVal}>{formatPrice(booking.grand_total)}</Text>
                </View>
              </View>
            )}

            {/* Total & Payment Status Highlights */}
            <View style={styles.grandTotalHighlight}>
              <View style={styles.grandTotalRow}>
                <View>
                  <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
                  <Text style={styles.grandTotalSubLabel}>
                    Inclusive of all taxes & platform fees
                  </Text>
                </View>
                <Text style={styles.grandTotalValue}>{formatPrice(grandTotal)}</Text>
              </View>

              <View style={styles.paymentSplitDivider} />

              <View style={styles.paymentSplitRow}>
                <View style={styles.splitCol}>
                  <Text style={styles.splitLabel}>Amount Paid</Text>
                  <Text style={[styles.splitValue, { color: COLORS.green }]}>
                    {formatPrice(amountPaid)}
                  </Text>
                </View>

                <View style={[styles.splitCol, { alignItems: "flex-end" }]}>
                  <Text style={styles.splitLabel}>
                    {balanceDue > 0 ? "Balance Payable" : "Balance Due"}
                  </Text>
                  <Text
                    style={[
                      styles.splitValue,
                      { color: balanceDue > 0 ? COLORS.red : COLORS.textPrimary },
                    ]}
                  >
                    {formatPrice(balanceDue)}
                  </Text>
                </View>
              </View>

              {booking.payment_method ? (
                <View style={styles.paymentMethodRow}>
                  <Ionicons name="card-outline" size={13} color={COLORS.navy} />
                  <Text style={styles.paymentMethodText}>
                    Payment Mode: {booking.payment_method.toUpperCase()}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Secure Guarantee Banner */}
          <View style={styles.securityBanner}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.green} />
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Verified & Guaranteed Stay</Text>
              <Text style={styles.securitySubtitle}>
                Your reservation details are synced directly with the property.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Close Receipt</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 0,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginTop: 1,
  },
  copyHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  /* Reference Card (Boarding Pass Design) */
  refCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  refTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  refBadgeLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  refLabelText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.gold,
    letterSpacing: 1.2,
  },
  refCodeText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  statusBadgesCol: {
    alignItems: "flex-end",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  ticketDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    marginHorizontal: -18,
  },
  ticketPunchLeft: {
    width: 14,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: COLORS.surface,
  },
  ticketPunchRight: {
    width: 14,
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: COLORS.surface,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: "#1E355B",
    borderStyle: "dashed",
    marginHorizontal: 8,
  },
  refBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaCol: {
    flex: 1,
  },
  metaColRight: {
    alignItems: "flex-end",
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#8CA2C2",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white,
  },

  /* Common Card Styling */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.goldLight,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navy,
  },

  /* Property Info */
  propertyName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  propertyAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
  roomTagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.goldLight,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  roomTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
  },

  /* Stay Dates */
  stayDatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dateCol: {
    flex: 1,
  },
  dateTypeLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  dateMainText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 2,
  },
  dateTimeHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  durationPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.gold,
  },

  /* Detail Rows (Guest details) */
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy,
  },

  /* Itemized Payment Breakdown */
  breakdownCard: {
    borderColor: COLORS.goldBorder,
    backgroundColor: COLORS.white,
  },
  breakdownHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  breakdownSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  breakdownErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.amberBg,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
  },
  breakdownErrorText: {
    fontSize: 12,
    color: COLORS.amber,
    flex: 1,
  },
  retryBtn: {
    backgroundColor: COLORS.amber,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
  itemsListContainer: {
    marginTop: 6,
  },
  itemBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  itemCategoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemCategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  itemCategoryText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy,
  },
  itemCategoryTotal: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy,
  },
  breakdownLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  lineLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  lineVal: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    marginVertical: 10,
  },
  summaryLineLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  summaryLineVal: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
  },
  fallbackBreakdownBox: {
    paddingVertical: 8,
  },

  /* Grand Total Box */
  grandTotalHighlight: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.8,
  },
  grandTotalSubLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginTop: 1,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.navy,
  },
  paymentSplitDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  paymentSplitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  splitCol: {
    flex: 1,
  },
  splitLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginBottom: 2,
  },
  splitValue: {
    fontSize: 14,
    fontWeight: "800",
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignSelf: "flex-start",
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy,
  },

  /* Security Banner */
  securityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.greenBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    padding: 12,
    marginBottom: 10,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.green,
  },
  securitySubtitle: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "500",
    marginTop: 1,
  },

  /* Bottom Bar */
  bottomBar: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  doneBtn: {
    backgroundColor: COLORS.navy,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  stayCalculationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stayCalculationText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy,
  },
});
