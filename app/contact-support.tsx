import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
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
  blue: "#2563EB",
};

const CATEGORIES = [
  "Booking Issue",
  "Refund & Payment",
  "Check-in & Stay",
  "VIP Concierge",
  "General Inquiry",
];

const URGENCY_LEVELS = [
  { id: "normal", label: "Normal", color: COLORS.green },
  { id: "high", label: "High", color: COLORS.gold },
  { id: "urgent", label: "Urgent ⚡", color: COLORS.red },
];

export default function ContactSupportScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Booking Issue");
  const [selectedUrgency, setSelectedUrgency] = useState("normal");
  const [bookingRef, setBookingRef] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    category: string;
    urgency: string;
  } | null>(null);

  const handlePhoneCall = () => {
    const phoneNumber = "tel:+18005550199";
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneNumber);
        } else {
          Alert.alert(
            "Call Support Concierge",
            "Our helpline is +1 (800) 555-0199. Lines are open 24/7."
          );
        }
      })
      .catch(() => {
        Alert.alert(
          "Call Support Concierge",
          "Our helpline is +1 (800) 555-0199. Lines are open 24/7."
        );
      });
  };

  const handleEmailSupport = () => {
    const emailUrl = "mailto:support@getstay.com?subject=Concierge%20Support%20Inquiry";
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert("Email Support", "Send your inquiries to support@getstay.com.");
        }
      })
      .catch(() => {
        Alert.alert("Email Support", "Send your inquiries to support@getstay.com.");
      });
  };

  const handleWhatsAppSupport = () => {
    const waUrl = "https://wa.me/18005550199?text=Hello%20GetStay%20Concierge";
    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          Alert.alert(
            "WhatsApp VIP Concierge",
            "Message our VIP desk on WhatsApp at +1 (800) 555-0199."
          );
        }
      })
      .catch(() => {
        Alert.alert(
          "WhatsApp VIP Concierge",
          "Message our VIP desk on WhatsApp at +1 (800) 555-0199."
        );
      });
  };

  const handleSubmitInquiry = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(
        "Missing Information",
        "Please provide a subject and details for your support request."
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = `GS-TICKET-${Math.floor(Math.random() * 89999) + 10000}`;
      setSubmittedTicket({
        id: ticketId,
        category: selectedCategory,
        urgency: selectedUrgency,
      });
    }, 1200);
  };

  const resetForm = () => {
    setSubmittedTicket(null);
    setSubject("");
    setMessage("");
    setBookingRef("");
    setSelectedUrgency("normal");
    setSelectedCategory("Booking Issue");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO BANNER */}
        <View style={styles.heroBanner}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Contact Support</Text>

            <View style={styles.responseTimeBadge}>
              <Ionicons name="time-outline" size={13} color={COLORS.gold} />
              <Text style={styles.responseTimeText}>&lt; 15 min reply</Text>
            </View>
          </View>

          <Text style={styles.heroSubtitle}>
            Our 24/7 GetStay Concierge Team is dedicated to delivering flawless experiences.
          </Text>
        </View>

        {/* SUPPORT CHANNELS GRID */}
        <View style={styles.channelsSection}>
          <Text style={styles.sectionLabel}>Support Channels</Text>
          <View style={styles.channelsGrid}>
            {/* Phone Card */}
            <TouchableOpacity
              style={styles.channelCard}
              activeOpacity={0.8}
              onPress={handlePhoneCall}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="call-outline" size={22} color={COLORS.green} />
              </View>
              <Text style={styles.channelTitle}>Phone Support</Text>
              <Text style={styles.channelDetail}>+1 (800) 555-0199</Text>
              <View style={[styles.badgePill, { backgroundColor: "#D1FAE5" }]}>
                <Text style={[styles.badgeText, { color: COLORS.green }]}>24/7 Toll-Free</Text>
              </View>
            </TouchableOpacity>

            {/* Email Card */}
            <TouchableOpacity
              style={styles.channelCard}
              activeOpacity={0.8}
              onPress={handleEmailSupport}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="mail-outline" size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.channelTitle}>Email Concierge</Text>
              <Text style={styles.channelDetail}>support@getstay.com</Text>
              <View style={[styles.badgePill, { backgroundColor: "#FEF3C7" }]}>
                <Text style={[styles.badgeText, { color: "#D97706" }]}>Fast Ticket</Text>
              </View>
            </TouchableOpacity>

            {/* WhatsApp Card */}
            <TouchableOpacity
              style={styles.channelCard}
              activeOpacity={0.8}
              onPress={handleWhatsAppSupport}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="logo-whatsapp" size={22} color={COLORS.blue} />
              </View>
              <Text style={styles.channelTitle}>WhatsApp VIP</Text>
              <Text style={styles.channelDetail}>Instant Mobile Line</Text>
              <View style={[styles.badgePill, { backgroundColor: "#DBEAFE" }]}>
                <Text style={[styles.badgeText, { color: COLORS.blue }]}>Chat Live</Text>
              </View>
            </TouchableOpacity>

            {/* Office Info Card */}
            <View style={styles.channelCard}>
              <View style={[styles.iconCircle, { backgroundColor: "#F3E8FF" }]}>
                <Ionicons name="location-outline" size={22} color="#8B5CF6" />
              </View>
              <Text style={styles.channelTitle}>Global HQ</Text>
              <Text style={styles.channelDetail}>Manhattan & Paris</Text>
              <View style={[styles.badgePill, { backgroundColor: "#EDE9FE" }]}>
                <Text style={[styles.badgeText, { color: "#8B5CF6" }]}>Headquarters</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TICKET FORM SECTION */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Submit a Support Ticket</Text>

          {submittedTicket ? (
            /* SUCCESS CONFIRMATION RECEIPT */
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={56} color={COLORS.green} />
              </View>

              <Text style={styles.successTitle}>Support Request Submitted!</Text>
              <Text style={styles.successMessage}>
                Your inquiry has been routed to our Senior Concierge Specialists. We will reach out to your registered email shortly.
              </Text>

              <View style={styles.ticketDetailsBox}>
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.ticketDetailLabel}>Ticket ID:</Text>
                  <Text style={styles.ticketDetailValue}>{submittedTicket.id}</Text>
                </View>
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.ticketDetailLabel}>Category:</Text>
                  <Text style={styles.ticketDetailValue}>{submittedTicket.category}</Text>
                </View>
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.ticketDetailLabel}>Priority:</Text>
                  <Text
                    style={[
                      styles.ticketDetailValue,
                      {
                        color:
                          submittedTicket.urgency === "urgent"
                            ? COLORS.red
                            : COLORS.green,
                        fontWeight: "800",
                      },
                    ]}
                  >
                    {submittedTicket.urgency.toUpperCase()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={resetForm}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={18} color={COLORS.navy} />
                <Text style={styles.primaryButtonText}>Submit Another Inquiry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* INPUT FORM */
            <View style={styles.formCard}>
              {/* Category Picker */}
              <Text style={styles.inputLabel}>Inquiry Topic</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isActive && styles.categoryChipActive,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isActive && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Priority Selector */}
              <Text style={styles.inputLabel}>Priority Level</Text>
              <View style={styles.urgencyRow}>
                {URGENCY_LEVELS.map((lvl) => {
                  const isActive = selectedUrgency === lvl.id;
                  return (
                    <TouchableOpacity
                      key={lvl.id}
                      style={[
                        styles.urgencyChip,
                        isActive && {
                          backgroundColor: lvl.color + "18",
                          borderColor: lvl.color,
                        },
                      ]}
                      onPress={() => setSelectedUrgency(lvl.id)}
                    >
                      <Text
                        style={[
                          styles.urgencyChipText,
                          isActive && { color: lvl.color, fontWeight: "800" },
                        ]}
                      >
                        {lvl.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Booking Ref (Optional) */}
              <Text style={styles.inputLabel}>Booking Reference (Optional)</Text>
              <View style={styles.inputBox}>
                <Ionicons name="barcode-outline" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., #GS-94821"
                  placeholderTextColor={COLORS.textMuted}
                  value={bookingRef}
                  onChangeText={setBookingRef}
                />
              </View>

              {/* Subject */}
              <Text style={styles.inputLabel}>Subject *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="document-text-outline" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Brief summary of your request..."
                  placeholderTextColor={COLORS.textMuted}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              {/* Message Details */}
              <Text style={styles.inputLabel}>Message Details *</Text>
              <View style={[styles.inputBox, styles.textAreaBox]}>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Please describe how we can assist you..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isSubmitting && { opacity: 0.7 },
                ]}
                onPress={handleSubmitInquiry}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Ionicons name="paper-plane-outline" size={18} color={COLORS.navy} />
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? "Submitting Ticket..." : "Send Request"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* FOOTER GUARANTEE */}
        <View style={styles.guaranteeBanner}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.gold} />
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>GetStay Service Guarantee</Text>
            <Text style={styles.guaranteeSub}>
              All inquiries are encrypted and handled directly by our hospitality concierge team.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: COLORS.surface,
  },

  /* HERO BANNER */
  heroBanner: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  responseTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navyMid,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  responseTimeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.goldLight,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },

  /* CHANNELS SECTION */
  channelsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  channelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  channelCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  channelTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
    textAlign: "center",
  },
  channelDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  /* FORM SECTION */
  formSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 10,
  },
  categoryScroll: {
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.gold,
    fontWeight: "800",
  },

  urgencyRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  urgencyChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  urgencyChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },
  textAreaBox: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  textAreaInput: {
    minHeight: 80,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 12,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navy,
  },

  /* SUCCESS CARD */
  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successIconCircle: {
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  ticketDetailsBox: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  ticketDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketDetailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  ticketDetailValue: {
    fontSize: 13,
    color: COLORS.navy,
    fontWeight: "700",
  },

  /* GUARANTEE BANNER */
  guaranteeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy,
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  guaranteeContent: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 2,
  },
  guaranteeSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
});
