import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
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
  cardBg: "#FFFFFF",
};

interface TermSection {
  id: string;
  sectionNumber: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  summary: string;
  content: string[];
  highlights?: string[];
  tags: string[];
}

const TERMS_SECTIONS: TermSection[] = [
  {
    id: "sec-1",
    sectionNumber: "01",
    title: "Acceptance of Terms & Services",
    icon: "document-text-outline",
    summary:
      "By creating an account, browsing properties, or completing a reservation via GetStay, you agree to be bound by these legal terms.",
    content: [
      "Welcome to GetStay. These Terms of Service ('Terms') govern your access to and use of the GetStay mobile application, website, and concierge services provided by GetStay Luxury Hospitality Inc.",
      "Please read these Terms carefully before proceeding with any booking or service request. By tapping 'Accept', creating an account, or completing a payment on GetStay, you enter into a legally binding contract with GetStay.",
      "If you do not agree with any part of these Terms, you must refrain from using the platform and booking services.",
    ],
    highlights: [
      "Legally binding agreement upon account registration or booking",
      "Applies to all guest users, account holders, and premier members",
      "Subject to periodic updates with standard notification",
    ],
    tags: ["Agreement", "General", "Contract"],
  },
  {
    id: "sec-2",
    sectionNumber: "02",
    title: "Reservation & Booking Verification",
    icon: "calendar-outline",
    summary:
      "All bookings are processed in real-time upon authorization of your chosen payment method. Instant confirmation voucher will be issued.",
    content: [
      "When placing a reservation request through GetStay, you guarantee that all guest details (full legal name, age, contact information, and government ID numbers) provided are truthful and accurate.",
      "GetStay acts as an authorized agent for premier luxury hotel partners. Once payment authorization is successfully processed, an official GetStay confirmation voucher and reservation code (e.g. #GS-94820) will be issued.",
      "Room allocation, floor placement, and bed configurations are subject to property availability, unless a specific luxury suite tier is guaranteed explicitly during checkout.",
    ],
    highlights: [
      "Instant real-time booking confirmation voucher",
      "Strict identity verification required at front desk",
      "Primary reservation holder must be at least 18 years of age",
    ],
    tags: ["Bookings", "Confirmation", "Vouchers"],
  },
  {
    id: "sec-3",
    sectionNumber: "03",
    title: "Pricing, Fees & Payment Methods",
    icon: "card-outline",
    summary:
      "Transparent pricing guarantee. All displayed rates include room charges, municipal taxes, and service fees without hidden costs.",
    content: [
      "All rates on GetStay are presented in the local currency or your chosen currency preference. Total booking costs clearly itemize room rates, applicable VAT/GST, municipal occupancy taxes, and resort service fees.",
      "We accept major credit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, and GetStay Reward Points. Payment card information is encrypted using industry-standard 256-bit SSL protocols.",
      "In the event of currency conversion, your financial institution may apply processing rates or cross-border fees for which GetStay bears no responsibility.",
    ],
    highlights: [
      "No hidden fees policy at checkout",
      "256-bit SSL bank-grade security for transactions",
      "GetStay Gold Reward points earn rate: 10 pts per $1 spent",
    ],
    tags: ["Payments", "Pricing", "Taxes", "Security"],
  },
  {
    id: "sec-4",
    sectionNumber: "04",
    title: "Cancellation & Refund Policies",
    icon: "refresh-circle-outline",
    summary:
      "Flexible cancellation options vary by room tariff. Free cancellation options provide full refund up to 24-48 hours before check-in.",
    content: [
      "Each property room rate displays a distinct cancellation policy prior to booking completion ('Free Cancellation' vs 'Non-Refundable Tariff').",
      "Free Cancellation bookings cancelled within the specified deadline (e.g., 24 or 48 hours prior to 3:00 PM check-in date) are entitled to a 100% full refund to the original payment method within 3 to 5 business days.",
      "Non-refundable rates offer lower discounted pricing; however, cancellations, no-shows, or early departures under non-refundable tariffs cannot be refunded for cash value, but may qualify for GetStay credit upon concierge review.",
    ],
    highlights: [
      "100% full refund on eligible 'Free Cancellation' tariffs",
      "Automated refund processing within 3-5 business days",
      "Emergency cancellations handled 24/7 by Concierge team",
    ],
    tags: ["Cancellation", "Refunds", "Tariffs"],
  },
  {
    id: "sec-5",
    sectionNumber: "05",
    title: "Check-in, Security Deposit & Guest Identification",
    icon: "shield-checkmark-outline",
    summary:
      "Physical photo identification and a credit card for incidental holds must be presented at property check-in.",
    content: [
      "Standard Check-in time is 3:00 PM local time. Standard Check-out is 11:00 AM. Early Check-in or Late Check-out requests can be submitted via the app but remain subject to hotel operational capacity.",
      "At front desk check-in, the lead guest must present a valid government-issued photo ID (Passport, Driver's License, or National Identity Card) matching the name on the GetStay reservation voucher.",
      "Hotel partners reserve the right to place a temporary pre-authorization hold on your credit card for incidental charges (mini-bar, room service, spa usage). This hold is released upon room inspection during check-out.",
    ],
    highlights: [
      "Mandatory original photo ID verification at hotel desk",
      "Temporary incidental security hold released at check-out",
      "Special requests (high floor, early check-in) prioritized",
    ],
    tags: ["Check-in", "Security Deposit", "ID Requirements"],
  },
  {
    id: "sec-6",
    sectionNumber: "06",
    title: "House Rules, Conduct & Liability Limitations",
    icon: "home-outline",
    summary:
      "Guests agree to abide by individual hotel rules, noise limits, smoking policies, and pet regulations during their stay.",
    content: [
      "Guests are required to respect property staff, fellow residents, and facility guidelines. Smoking in non-smoking suites or causing intentional property damage may result in immediate eviction without refund and fee penalties.",
      "GetStay operates as a luxury booking platform. While we strictly vet all partner properties, GetStay is not liable for personal injury, lost valuables, unexpected utility outages, or force majeure events occurring on property premises.",
      "In any dispute, GetStay's total aggregate financial liability shall not exceed the total booking fee paid by the guest for the specific reservation in question.",
    ],
    highlights: [
      "Strict compliance with hotel house policies and noise rules",
      "Property damage or unauthorized smoking subject to penalties",
      "Liability capped at maximum of total reservation value paid",
    ],
    tags: ["House Rules", "Liability", "Conduct"],
  },
  {
    id: "sec-7",
    sectionNumber: "07",
    title: "Account Security & Member Conduct",
    icon: "lock-closed-outline",
    summary:
      "Maintain the confidentiality of your account credentials. You are responsible for all activities originating from your account.",
    content: [
      "You are responsible for safeguarding your GetStay account credentials (password, biometrics, 2FA tokens). You must immediately notify GetStay support if you suspect unauthorized access.",
      "Users shall not attempt to reverse engineer, scrape, deploy automated bots, or compromise the stability of GetStay systems.",
      "GetStay reserves the right to suspend or terminate accounts that engage in fraudulent bookings, chargeback abuse, or disrespectful behavior toward hotel staff or concierge representatives.",
    ],
    highlights: [
      "Single user account responsibility & 2FA protection",
      "Prohibition of fraudulent chargebacks or automated scraping",
      "Zero tolerance for abusive conduct towards service agents",
    ],
    tags: ["Account", "Security", "Terms"],
  },
  {
    id: "sec-8",
    sectionNumber: "08",
    title: "Governing Law & Dispute Resolution",
    icon: "scale-outline",
    summary:
      "These terms are governed by commercial arbitration laws. Disputes are first routed through our 24/7 legal concierge service.",
    content: [
      "These Terms of Service are governed by and construed under the laws of Delaware, USA, without regard to conflict of law principles.",
      "Before initiating formal legal proceedings, parties agree to attempt informal resolution through GetStay Executive Concierge Support for a minimum period of 30 days.",
      "Any unresolved claims arising out of these Terms shall be settled through binding individual arbitration under the rules of the American Arbitration Association (AAA).",
    ],
    highlights: [
      "30-day informal concierge resolution period",
      "Binding individual arbitration standard",
      "Governed by international commercial standards",
    ],
    tags: ["Legal", "Arbitration", "Governance"],
  },
];

const TOC_CHIPS = [
  "All Terms",
  "Bookings",
  "Payments",
  "Cancellation",
  "Check-in",
  "House Rules",
  "Legal",
];

export default function TermsOfServiceScreen() {
  const [selectedChip, setSelectedChip] = useState("All Terms");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("sec-1");
  const [agreed, setAgreed] = useState(true);

  // Filter sections based on TOC chip and search query
  const filteredSections = TERMS_SECTIONS.filter((sec) => {
    const matchesChip =
      selectedChip === "All Terms" ||
      sec.tags.some(
        (t) => t.toLowerCase() === selectedChip.toLowerCase()
      ) ||
      sec.title.toLowerCase().includes(selectedChip.toLowerCase());

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      sec.title.toLowerCase().includes(query) ||
      sec.summary.toLowerCase().includes(query) ||
      sec.content.some((c) => c.toLowerCase().includes(query)) ||
      sec.tags.some((t) => t.toLowerCase().includes(query));

    return matchesChip && matchesSearch;
  });

  const toggleSection = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleShareTerms = async () => {
    try {
      await Share.share({
        title: "GetStay Terms of Service",
        message:
          "Review GetStay's official Terms of Service & Luxury Booking Guarantees: https://getstay.com/legal/terms",
      });
    } catch (error) {
      Alert.alert("Share Terms", "Link copied to clipboard: https://getstay.com/legal/terms");
    }
  };

  const handleDownloadPDF = () => {
    Alert.alert(
      "Download Terms (PDF)",
      "GetStay_Terms_of_Service_v2.4.pdf has been prepared. Would you like to save it to your device?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download PDF",
          onPress: () => {
            Alert.alert("Success", "PDF document saved to your Downloads folder.");
          },
        },
      ]
    );
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
          {/* Top header row */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Terms of Service</Text>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareTerms}
              hitSlop={10}
            >
              <Ionicons name="share-outline" size={20} color={COLORS.gold} />
            </TouchableOpacity>
          </View>

          {/* Version badge */}
          <View style={styles.badgeRow}>
            <View style={styles.versionBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.navy} />
              <Text style={styles.versionBadgeText}>Version 2.4</Text>
            </View>
            <Text style={styles.effectiveText}>Effective: Sept 2026</Text>
          </View>

          <Text style={styles.heroSubtitle}>
            Please review the terms and conditions governing your stays, payments, and account security.
          </Text>

          {/* Search bar */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.gold} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search legal clauses (e.g. cancellation, refund, deposit)..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* QUICK GUARANTEES HIGHLIGHT CARDS */}
        <View style={styles.highlightsContainer}>
          <Text style={styles.sectionLabel}>Key Guest Guarantees</Text>
          <View style={styles.highlightsRow}>
            <View style={styles.highlightCard}>
              <View style={[styles.highlightIconBox, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.gold} />
              </View>
              <Text style={styles.highlightCardTitle}>Transparent Pricing</Text>
              <Text style={styles.highlightCardSub}>No unexpected hidden checkout fees</Text>
            </View>

            <View style={styles.highlightCard}>
              <View style={[styles.highlightIconBox, { backgroundColor: "#D1FAE5" }]}>
                <Ionicons name="refresh" size={20} color={COLORS.green} />
              </View>
              <Text style={styles.highlightCardTitle}>Instant Refunds</Text>
              <Text style={styles.highlightCardSub}>3-5 business days processing</Text>
            </View>

            <View style={styles.highlightCard}>
              <View style={[styles.highlightIconBox, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="lock-closed" size={20} color={COLORS.blue} />
              </View>
              <Text style={styles.highlightCardTitle}>256-Bit SSL</Text>
              <Text style={styles.highlightCardSub}>Bank-level encrypted transactions</Text>
            </View>
          </View>
        </View>

        {/* TOC CATEGORY CHIPS */}
        <View style={styles.tocSection}>
          <Text style={styles.sectionLabel}>Quick Filter Topics</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tocScroll}
          >
            {TOC_CHIPS.map((chip) => {
              const isActive = selectedChip === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  style={[
                    styles.tocChip,
                    isActive && styles.tocChipActive,
                  ]}
                  onPress={() => setSelectedChip(chip)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tocChipText,
                      isActive && styles.tocChipTextActive,
                    ]}
                  >
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* CLAUSES / ACCORDION SECTIONS */}
        <View style={styles.sectionsContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Legal Terms & Clauses</Text>
            <Text style={styles.sectionCountText}>
              Showing {filteredSections.length} of {TERMS_SECTIONS.length} Sections
            </Text>
          </View>

          {filteredSections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No matching clauses found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search filter or select 'All Terms' to view the complete agreement.
              </Text>
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSelectedChip("All Terms");
                  setSearchQuery("");
                }}
              >
                <Text style={styles.resetFilterText}>Reset Search Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredSections.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <View key={item.id} style={styles.clauseCard}>
                  {/* Card Header Touch */}
                  <TouchableOpacity
                    style={styles.clauseHeader}
                    activeOpacity={0.7}
                    onPress={() => toggleSection(item.id)}
                  >
                    <View style={styles.secNumberBox}>
                      <Text style={styles.secNumberText}>{item.sectionNumber}</Text>
                    </View>

                    <View style={styles.clauseHeaderTitleBox}>
                      <Text style={styles.clauseTitle}>{item.title}</Text>
                      <View style={styles.tagsRow}>
                        {item.tags.map((tag) => (
                          <View key={tag} style={styles.tagBadge}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={isExpanded ? COLORS.gold : COLORS.textMuted}
                    />
                  </TouchableOpacity>

                  {/* Quick Summary Callout */}
                  <View style={styles.summaryBox}>
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color={COLORS.gold}
                      style={{ marginTop: 1 }}
                    />
                    <Text style={styles.summaryText}>{item.summary}</Text>
                  </View>

                  {/* Expanded Legal Content */}
                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      {item.content.map((paragraph, idx) => (
                        <Text key={idx} style={styles.paragraphText}>
                          {paragraph}
                        </Text>
                      ))}

                      {item.highlights && item.highlights.length > 0 && (
                        <View style={styles.highlightsBox}>
                          <Text style={styles.highlightsHeaderTitle}>
                            ⚡ Key Policy Takeaways
                          </Text>
                          {item.highlights.map((h, i) => (
                            <View key={i} style={styles.highlightBulletRow}>
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color={COLORS.green}
                              />
                              <Text style={styles.highlightBulletText}>{h}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* PDF DOWNLOAD & LEGAL CONCIERGE BANNER */}
        <View style={styles.actionBanner}>
          <View style={styles.actionLeft}>
            <View style={styles.pdfIconCircle}>
              <Ionicons name="document-attach-outline" size={24} color={COLORS.gold} />
            </View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.actionTitle}>Need a printable copy?</Text>
              <Text style={styles.actionSub}>Download our full legal terms in PDF format.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPDF}>
            <Ionicons name="download-outline" size={16} color={COLORS.navy} />
            <Text style={styles.downloadBtnText}>Download PDF</Text>
          </TouchableOpacity>
        </View>

        {/* ACCEPTANCE STATUS BAR & SUPPORT */}
        <View style={styles.acceptanceCard}>
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
          >
            <View
              style={[
                styles.checkbox,
                agreed && styles.checkboxChecked,
              ]}
            >
              {agreed && <Ionicons name="checkmark" size={14} color={COLORS.navy} />}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and acknowledge the GetStay Terms of Service & Guest Guarantees.
            </Text>
          </TouchableOpacity>

          <View style={styles.supportLinkRow}>
            <Text style={styles.supportPromptText}>Have legal questions?</Text>
            <TouchableOpacity onPress={() => router.push("/contact-support")}>
              <Text style={styles.supportLinkText}>Contact Concierge Support →</Text>
            </TouchableOpacity>
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
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.navyMid,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.3,
  },
  effectiveText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navyMid,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    padding: 0,
  },

  /* HIGHLIGHTS CARDS */
  highlightsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  highlightsRow: {
    flexDirection: "row",
    gap: 10,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  highlightIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  highlightCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  highlightCardSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 13,
  },

  /* TOC CHIPS */
  tocSection: {
    marginTop: 20,
  },
  tocScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tocChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tocChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  tocChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  tocChipTextActive: {
    color: COLORS.gold,
    fontWeight: "700",
  },

  /* CLAUSES SECTIONS */
  sectionsContainer: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  resetFilterBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gold,
  },

  clauseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  clauseHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  secNumberBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.navyMid,
    justifyContent: "center",
    alignItems: "center",
  },
  secNumberText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.gold,
  },
  clauseHeaderTitleBox: {
    flex: 1,
  },
  clauseTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tagBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  summaryBox: {
    flexDirection: "row",
    backgroundColor: "#FEFCE8",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FEF08A",
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    color: "#713F12",
    lineHeight: 17,
    fontWeight: "500",
  },

  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    paddingTop: 12,
  },
  paragraphText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  highlightsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  highlightsHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  highlightBulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  highlightBulletText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 1,
  },

  /* ACTION BANNER */
  actionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.navy,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  pdfIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.navyMid,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextGroup: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
  },

  /* ACCEPTANCE CARD */
  acceptanceCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
    fontWeight: "500",
  },
  supportLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  supportPromptText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  supportLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gold,
  },
});
