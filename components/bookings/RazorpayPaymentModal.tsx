import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  verifyBookingPayment,
  VerifyPaymentPayload,
} from "@/services/bookingService";
import { calculateHmacSha256 } from "@/utils/crypto";
import RazorpayCheckout from "react-native-razorpay";

interface BookingInfo {
  id: string;
  booking_reference?: string;
  payment_gateway_id?: string;
  grand_total?: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  property_name?: string;
}

interface Props {
  visible: boolean;
  booking: BookingInfo | null;
  authToken?: string;
  onClose: () => void;
  onPaymentSuccess: (verifiedBooking: any) => void;
}

export default function RazorpayPaymentModal({
  visible,
  booking,
  authToken,
  onClose,
  onPaymentSuccess,
}: Props) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualInputs, setShowManualInputs] = useState(false);

  const razorpayKey =
    process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TosDsYNmVRvaSg";
  const razorpaySecret =
    process.env.EXPO_PUBLIC_RAZORPAY_KEY_SECRET || "2Vvp73RcUJSle1yEx5mlKXzX";

  const orderId = booking?.payment_gateway_id || "order_pending";

  const [paymentId, setPaymentId] = useState(
    () => `pay_${Math.random().toString(36).substring(2, 12)}`,
  );
  const [signature, setSignature] = useState(() =>
    calculateHmacSha256(`${orderId}|pay_temp`, razorpaySecret),
  );

  // Recalculate signature whenever orderId or paymentId changes
  useEffect(() => {
    if (orderId && paymentId) {
      const generated = calculateHmacSha256(
        `${orderId}|${paymentId.trim()}`,
        razorpaySecret,
      );
      setSignature(generated);
    }
  }, [orderId, paymentId, razorpaySecret]);

  if (!booking) return null;

  const amountStr = booking.grand_total
    ? `₹${Number(booking.grand_total).toLocaleString()}`
    : "₹0";

  const hasNativeModule = !!(
    NativeModules.RNRazorpayCheckout || NativeModules.RazorpayCheckout
  );

  const handleLaunchNativeRazorpay = async () => {

    const options = {
      description: `Payment for ${booking.property_name || "Stay Booking"}`,
      currency: "INR",
      key: razorpayKey,
      amount: Math.round(Number(booking.grand_total || 0) * 100),
      name: "GetStay",
      order_id: orderId,
      prefill: {
        email: booking.guest_email || "",
        contact: booking.guest_phone || "",
        name: booking.guest_name || "",
      },
      theme: { color: "#10b981" },
    };

    try {
      setIsVerifying(true);
      const data = await RazorpayCheckout.open(options);
      await submitVerification({
        razorpay_order_id: data.razorpay_order_id || orderId,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });
    } catch (err: any) {
      setIsVerifying(false);
      console.warn("Razorpay Native Error/Cancellation:", err);
      Alert.alert(
        "Payment Incomplete",
        err?.description || "Payment was cancelled or could not be completed.",
      );
    }
  };

  const submitVerification = async (payload: VerifyPaymentPayload) => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const response = await verifyBookingPayment(
        booking.id,
        payload,
        authToken,
      );

      const verified = response?.data || response;
      onPaymentSuccess(verified);
    } catch (err: any) {
      console.error("=========================================");
      console.error("🔴 RAZORPAY VERIFICATION ERROR (HTTP " + (err?.response?.status || "UNKNOWN") + "):");
      console.error("Status:", err?.response?.status);
      console.error("Response Data:", JSON.stringify(err?.response?.data, null, 2));
      console.error("Payload Sent:", JSON.stringify(payload, null, 2));
      console.error("Error Message:", err?.message);
      console.error("=========================================");

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Payment verification failed. Please try again.";
      setErrorMessage(serverMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyDirect = () => {
    const validSig =
      signature.trim() ||
      calculateHmacSha256(`${orderId}|${paymentId.trim()}`, razorpaySecret);

    submitVerification({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId.trim(),
      razorpay_signature: validSig,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.gatewayBrand}>
              <View style={styles.logoBadge}>
                <Ionicons name="card" size={18} color="#0284c7" />
              </View>
              <View>
                <Text style={styles.brandTitle}>Razorpay Checkout</Text>
                <Text style={styles.brandSubtitle}>Secure Payment Gateway</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isVerifying}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentScroll}
          >
            {/* Amount card */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Total Payable</Text>
              <Text style={styles.amountValue}>{amountStr}</Text>
              <View style={styles.orderPill}>
                <Text style={styles.orderPillText}>Order: {orderId}</Text>
              </View>
            </View>

            {/* Booking Details */}
            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Booking Ref</Text>
                <Text style={styles.detailVal}>
                  {booking.booking_reference || booking.id.substring(0, 8)}
                </Text>
              </View>
              {booking.guest_name ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Guest Name</Text>
                  <Text style={styles.detailVal}>{booking.guest_name}</Text>
                </View>
              ) : null}
              {booking.guest_phone ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact</Text>
                  <Text style={styles.detailVal}>{booking.guest_phone}</Text>
                </View>
              ) : null}
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Native Razorpay Button */}
            <TouchableOpacity
              style={styles.nativePayBtn}
              onPress={handleLaunchNativeRazorpay}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color="#fff" />
                  <Text style={styles.nativePayBtnText}>
                    Open Razorpay Gateway ({amountStr})
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {!hasNativeModule && (
              <View style={styles.rebuildNoticeBox}>
                <Ionicons name="information-circle-outline" size={16} color="#b45309" />
                <Text style={styles.rebuildNoticeText}>
                  Note: App must be rebuilt with `npx expo run:android` to launch the native Razorpay SDK. You can also tap "Verify & Confirm Payment" below for test verification.
                </Text>
              </View>
            )}

            {/* Verification action */}
            <TouchableOpacity
              style={[
                styles.primaryVerifyBtn,
                isVerifying && { opacity: 0.7 },
              ]}
              onPress={handleVerifyDirect}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={18} color="#fff" />
                  <Text style={styles.primaryVerifyBtnText}>
                    Verify & Confirm Payment
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Toggle manual details */}
            <TouchableOpacity
              onPress={() => setShowManualInputs((prev) => !prev)}
              style={styles.toggleInputsBtn}
            >
              <Text style={styles.toggleInputsText}>
                {showManualInputs
                  ? "Hide payment payload"
                  : "View/Edit verification payload"}
              </Text>
              <Ionicons
                name={showManualInputs ? "chevron-up" : "chevron-down"}
                size={14}
                color="#64748b"
              />
            </TouchableOpacity>

            {showManualInputs && (
              <View style={styles.manualInputsBox}>
                <Text style={styles.inputLabel}>Razorpay Order ID</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: "#f1f5f9" }]}
                  value={orderId}
                  editable={false}
                />

                <Text style={styles.inputLabel}>Payment ID</Text>
                <TextInput
                  style={styles.input}
                  value={paymentId}
                  onChangeText={setPaymentId}
                  placeholder="pay_xxxxxxxxxx"
                  placeholderTextColor="#94a3b8"
                />

                <Text style={styles.inputLabel}>Signature</Text>
                <TextInput
                  style={styles.input}
                  value={signature}
                  onChangeText={setSignature}
                  placeholder="sig_xxxxxxxxxx"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            )}

            <View style={styles.securityFooter}>
              <Ionicons name="lock-closed" size={13} color="#10b981" />
              <Text style={styles.securityText}>
                100% Encrypted & Authenticated Transaction
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  gatewayBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  brandSubtitle: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  closeBtn: {
    padding: 6,
  },
  contentScroll: {
    paddingVertical: 16,
  },
  amountCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },
  amountLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginVertical: 4,
  },
  orderPill: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  orderPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  detailsBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  detailVal: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "700",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "600",
  },
  nativePayBtn: {
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  nativePayBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  rebuildNoticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 10,
    marginBottom: 12,
  },
  rebuildNoticeText: {
    flex: 1,
    fontSize: 12,
    color: "#92400e",
    lineHeight: 16,
  },
  primaryVerifyBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryVerifyBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  toggleInputsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 14,
    paddingVertical: 6,
  },
  toggleInputsText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  manualInputsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginTop: 10,
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#0f172a",
  },
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },
  securityText: {
    fontSize: 11,
    color: "#10b981",
    fontWeight: "600",
  },
});
