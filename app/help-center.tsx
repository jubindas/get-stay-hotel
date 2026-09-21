import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
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
  cardBg: "#FFFFFF",
};

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags?: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    category: "Bookings",
    question: "How do I view or modify my existing booking?",
    answer:
      "You can view all your active and past reservations by opening the 'My Bookings' tab from the profile menu. To modify your dates or guest counts, tap on your booking receipt and select 'Request Modification' or reach out to our 24/7 Concierge.",
    tags: ["modification", "dates", "reservation"],
  },
  {
    id: "2",
    category: "Bookings",
    question: "What is GetStay's instant booking confirmation?",
    answer:
      "All bookings made through GetStay receive instant real-time confirmation. Once payment is authorized, your digital voucher and booking reference number will appear in your account immediately.",
    tags: ["instant", "confirmation", "voucher"],
  },
  {
    id: "3",
    category: "Payments",
    question: "Which payment methods are accepted?",
    answer:
      "We accept all major credit & debit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, Net Banking, and select luxury gift cards. All transactions are protected with 256-bit SSL encryption.",
    tags: ["cards", "apple pay", "security"],
  },
  {
    id: "4",
    category: "Payments",
    question: "Are there any hidden fees or resort charges?",
    answer:
      "No. At GetStay, we believe in complete transparency. The final price displayed at checkout includes all local taxes, service fees, and mandatory charges. Any optional property add-ons will be listed clearly.",
    tags: ["taxes", "pricing", "transparent"],
  },
  {
    id: "5",
    category: "Cancellation",
    question: "What is the cancellation and refund policy?",
    answer:
      "Cancellation rules depend on the room tariff selected: 'Free Cancellation' options can be cancelled up to 24-48 hours before check-in for a 100% full refund. 'Non-refundable' rates offer discounted pricing but cannot be cancelled for cash refunds.",
    tags: ["refund", "policy", "cancellation"],
  },
  {
    id: "6",
    category: "Cancellation",
    question: "How long does it take to process a refund?",
    answer:
      "Approved refunds are initiated immediately by our automated system. Funds typically reflect in your original payment method within 3 to 5 business days, depending on your financial institution.",
    tags: ["refund time", "bank", "processing"],
  },
  {
    id: "7",
    category: "Check-in",
    question: "What are the standard Check-in and Check-out times?",
    answer:
      "Standard Check-in begins at 3:00 PM local time, and Check-out is until 11:00 AM. If you require Early Check-in or Late Check-out, you can request it through your booking details page.",
    tags: ["timing", "early check-in", "late check-out"],
  },
  {
    id: "8",
    category: "Check-in",
    question: "What identification documents do I need to present?",
    answer:
      "Primary guests must present a valid government-issued photo ID (Passport, Driver's License, or National ID card) alongside the credit card used for booking verification at the front desk.",
    tags: ["id", "passport", "verification"],
  },
  {
    id: "9",
    category: "Account",
    question: "How do I update my profile details or security settings?",
    answer:
      "Navigate to Profile > Personal Information to edit your name, email, or phone number. For password updates and two-factor authentication, visit Profile > Login & Security.",
    tags: ["profile", "password", "security"],
  },
  {
    id: "10",
    category: "Account",
    question: "How do GetStay Reward Points work?",
    answer:
      "As a GetStay Gold Member, you earn 10 points for every dollar spent on eligible stays. Points can be redeemed at checkout for room upgrades, complimentary breakfasts, or direct discounts.",
    tags: ["points", "gold member", "rewards"],
  },
];

const CATEGORIES = [
  "All",
  "Bookings",
  "Payments",
  "Cancellation",
  "Check-in",
  "Account",
];

export default function HelpCenterScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("1");
  const [helpfulRatings, setHelpfulRatings] = useState<Record<string, "yes" | "no">>({});

  // Ticket modal state
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [ticketCategory, setTicketCategory] = useState("Bookings");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const filteredFaqs = FAQ_DATA.filter((item) => {
    return selectedCategory === "All" || item.category === selectedCategory;
  });

  const toggleAccordion = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleRateHelpful = (id: string, rating: "yes" | "no") => {
    setHelpfulRatings((prev) => ({ ...prev, [id]: rating }));
  };

  const handlePhoneCall = () => {
    const phoneNumber = "tel:+18005550199";
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneNumber);
        } else {
          Alert.alert(
            "Call Support",
            "Our Concierge line is +1 (800) 555-0199. Available 24/7."
          );
        }
      })
      .catch(() => {
        Alert.alert(
          "Call Support",
          "Our Concierge line is +1 (800) 555-0199. Available 24/7."
        );
      });
  };

  const handleSendTicket = () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      Alert.alert("Required Fields", "Please enter both a subject and message.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSubmitted(true);
    }, 1200);
  };

  const resetTicketForm = () => {
    setTicketModalVisible(false);
    setTicketSubmitted(false);
    setTicketSubject("");
    setTicketMessage("");
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

            <Text style={styles.headerTitle}>Help & Support</Text>

            <View style={styles.onlineBadge}>
              <View style={styles.onlinePulse} />
              <Text style={styles.onlineText}>24/7 Live</Text>
            </View>
          </View>

          <Text style={styles.heroSubtitle}>
            How can we assist your getaway experience today?
          </Text>
        </View>

        {/* QUICK CONTACT SUPPORT CARDS */}
        <View style={styles.quickContactContainer}>
          <Text style={styles.sectionLabel}>Direct Assistance</Text>
          <View style={styles.contactCardsRow}>
            {/* Phone Call Card */}
            <TouchableOpacity
              style={styles.contactCard}
              activeOpacity={0.8}
              onPress={handlePhoneCall}
            >
              <View style={[styles.contactIconBox, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="call-outline" size={22} color={COLORS.green} />
              </View>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactSub}>Toll-Free Concierge</Text>
              <View style={[styles.cardTag, { backgroundColor: "#D1FAE5" }]}>
                <Text style={[styles.cardTagText, { color: COLORS.green }]}>24/7</Text>
              </View>
            </TouchableOpacity>

            {/* Submit Ticket Card */}
            <TouchableOpacity
              style={styles.contactCard}
              activeOpacity={0.8}
              onPress={() => router.push("/contact-support")}
            >
              <View style={[styles.contactIconBox, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="mail-open-outline" size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.contactTitle}>Send Inquiry</Text>
              <Text style={styles.contactSub}>Detailed Request</Text>
              <View style={[styles.cardTag, { backgroundColor: "#FEF3C7" }]}>
                <Text style={[styles.cardTagText, { color: "#D97706" }]}>Email</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* CATEGORY FILTER CHIPS */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionLabel}>Browse Topics</Text>
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
                  activeOpacity={0.8}
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
        </View>

        {/* FAQ ACCORDION LIST */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeaderRow}>
            <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
            <Text style={styles.faqCountText}>{filteredFaqs.length} Articles</Text>
          </View>

          {filteredFaqs.length === 0 ? (
            <View style={styles.emptyFaqBox}>
              <Ionicons name="help-circle-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyFaqTitle}>No matching answers found</Text>
              <Text style={styles.emptyFaqSub}>
                Try searching with different keywords or submit an inquiry to our concierge team.
              </Text>
              <TouchableOpacity
                style={styles.emptyFaqBtn}
                onPress={() => setTicketModalVisible(true)}
              >
                <Text style={styles.emptyFaqBtnText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const rating = helpfulRatings[faq.id];

              return (
                <View key={faq.id} style={styles.faqCard}>
                  <TouchableOpacity
                    style={styles.faqQuestionRow}
                    activeOpacity={0.7}
                    onPress={() => toggleAccordion(faq.id)}
                  >
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{faq.category}</Text>
                    </View>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={isExpanded ? COLORS.gold : COLORS.textMuted}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>

                      {/* WAS THIS HELPFUL FEEDBACK */}
                      <View style={styles.feedbackRow}>
                        <Text style={styles.feedbackLabel}>Was this article helpful?</Text>
                        <View style={styles.feedbackButtons}>
                          <TouchableOpacity
                            style={[
                              styles.feedbackBtn,
                              rating === "yes" && styles.feedbackBtnActive,
                            ]}
                            onPress={() => handleRateHelpful(faq.id, "yes")}
                          >
                            <Ionicons
                              name="thumbs-up-outline"
                              size={14}
                              color={rating === "yes" ? COLORS.navy : COLORS.textSecondary}
                            />
                            <Text
                              style={[
                                styles.feedbackBtnText,
                                rating === "yes" && styles.feedbackBtnTextActive,
                              ]}
                            >
                              Yes
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.feedbackBtn,
                              rating === "no" && styles.feedbackBtnActive,
                            ]}
                            onPress={() => handleRateHelpful(faq.id, "no")}
                          >
                            <Ionicons
                              name="thumbs-down-outline"
                              size={14}
                              color={rating === "no" ? COLORS.navy : COLORS.textSecondary}
                            />
                            <Text
                              style={[
                                styles.feedbackBtnText,
                                rating === "no" && styles.feedbackBtnTextActive,
                              ]}
                            >
                              No
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {rating && (
                        <Text style={styles.thankYouText}>
                          ✨ Thanks for your feedback!
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* BOTTOM CALLOUT BANNER */}
        <View style={styles.supportCallout}>
          <View style={styles.calloutIconCircle}>
            <Ionicons name="headset" size={26} color={COLORS.gold} />
          </View>
          <View style={styles.calloutContent}>
            <Text style={styles.calloutTitle}>Still need assistance?</Text>
            <Text style={styles.calloutSub}>
              Our dedicated GetStay Concierge Team is online 24/7 to solve your inquiries.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.calloutBtn}
            onPress={() => router.push("/contact-support")}
          >
            <Text style={styles.calloutBtnText}>Ask Concierge</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SUBMIT INQUIRY / TICKET MODAL */}
      <Modal
        visible={ticketModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetTicketForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Support Concierge</Text>
              <TouchableOpacity onPress={resetTicketForm}>
                <Ionicons name="close" size={24} color={COLORS.navy} />
              </TouchableOpacity>
            </View>

            {ticketSubmitted ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconBox}>
                  <Ionicons name="checkmark-circle" size={54} color={COLORS.green} />
                </View>
                <Text style={styles.successTitle}>Inquiry Received!</Text>
                <Text style={styles.successSub}>
                  Thank you for contacting us. Ticket reference{" "}
                  <Text style={{ fontWeight: "700", color: COLORS.navy }}>
                    #GS-{(Math.floor(Math.random() * 89999) + 10000).toString()}
                  </Text>{" "}
                  has been created. A concierge specialist will reply to your registered email within 15 minutes.
                </Text>
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={resetTicketForm}
                >
                  <Text style={styles.modalPrimaryBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 16 }}
                >
                  {["Bookings", "Payments", "Cancellation", "Check-in", "Other"].map(
                    (cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.modalCatChip,
                          ticketCategory === cat && styles.modalCatChipActive,
                        ]}
                        onPress={() => setTicketCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.modalCatChipText,
                            ticketCategory === cat && styles.modalCatChipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>

                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., Request early check-in or invoice"
                  placeholderTextColor={COLORS.textMuted}
                  value={ticketSubject}
                  onChangeText={setTicketSubject}
                />

                <Text style={styles.inputLabel}>Message Details</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Provide any relevant booking references or details..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={ticketMessage}
                  onChangeText={setTicketMessage}
                />

                <TouchableOpacity
                  style={[
                    styles.modalPrimaryBtn,
                    isSubmitting && { opacity: 0.7 },
                  ]}
                  onPress={handleSendTicket}
                  disabled={isSubmitting}
                >
                  <Text style={styles.modalPrimaryBtnText}>
                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 28,
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
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navyMid,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  onlinePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.goldLight,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navyMid,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    padding: 0,
  },

  /* QUICK CONTACT CARDS */
  quickContactContainer: {
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
  contactCardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  contactIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
    textAlign: "center",
  },
  contactSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  cardTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
  },

  /* CATEGORY CHIPS */
  categorySection: {
    marginTop: 24,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.gold,
    fontWeight: "700",
  },

  /* FAQ ACCORDION */
  faqSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  faqHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  faqCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  categoryBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.navy,
    textTransform: "uppercase",
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  faqAnswerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  feedbackLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  feedbackButtons: {
    flexDirection: "row",
    gap: 8,
  },
  feedbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feedbackBtnActive: {
    backgroundColor: COLORS.goldLight,
    borderColor: COLORS.gold,
  },
  feedbackBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  feedbackBtnTextActive: {
    color: COLORS.navy,
    fontWeight: "700",
  },
  thankYouText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.green,
    marginTop: 8,
  },

  emptyFaqBox: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyFaqTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navy,
    marginTop: 10,
    marginBottom: 4,
  },
  emptyFaqSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyFaqBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyFaqBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy,
  },

  /* CALLOUT BANNER */
  supportCallout: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy,
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  calloutIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navyMid,
    justifyContent: "center",
    alignItems: "center",
  },
  calloutContent: {
    flex: 1,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 2,
  },
  calloutSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  calloutBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  calloutBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy,
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 28, 46, 0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.navy,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalCatChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  modalCatChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  modalCatChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  modalCatChipTextActive: {
    color: COLORS.navy,
    fontWeight: "800",
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  modalTextArea: {
    minHeight: 100,
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  modalPrimaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navy,
  },

  successContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIconBox: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  /* CHAT MODAL STYLES */
  chatSafeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.navyMid,
  },
  chatBackBtn: {
    padding: 4,
  },
  chatHeaderContent: {
    alignItems: "center",
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
  },
  chatHeaderStatus: {
    fontSize: 11,
    color: COLORS.green,
    fontWeight: "600",
    marginTop: 2,
  },
  chatScroll: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  chatScrollContent: {
    padding: 16,
    gap: 12,
  },
  chatBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chatBubbleAgent: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chatBubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.navy,
    borderBottomRightRadius: 4,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatTextAgent: {
    color: COLORS.textPrimary,
  },
  chatTextUser: {
    color: COLORS.white,
  },
  chatTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  chatTimeAgent: {
    color: COLORS.textMuted,
  },
  chatTimeUser: {
    color: COLORS.goldLight,
  },
  chatInputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
  },
});
