import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
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
  purple: "#7C3AED",
  cardBg: "#FFFFFF",
};

interface PrivacySection {
  id: string;
  sectionNumber: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  summary: string;
  content: string[];
  highlights?: string[];
  tags: string[];
}

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "priv-1",
    sectionNumber: "01",
    title: "Information We Collect",
    icon: "person-add-outline",
    summary:
      "We collect personal, booking, financial, and technical data necessary to provide luxury hospitality and secure reservations.",
    content: [
      "Personal Identity Data: Includes your full name, email address, mobile phone number, date of birth, and government identification details provided during account registration or property check-in.",
      "Booking & Stay Records: Details regarding your luxury hotel reservations, room preferences, special concierge requests, stay dates, guest counts, and check-in history.",
      "Financial Transaction Details: Encrypted payment card metadata, transaction timestamps, billing address, and GetStay reward points balances. We do not store raw 16-digit credit card CVV numbers on local servers.",
      "Device & Technical Data: IP address, device model, operating system version, browser type, notification tokens, and approximate location data utilized strictly for localized stay recommendations.",
    ],
    highlights: [
      "Strict data minimization principle",
      "Raw credit card CVVs are never stored on GetStay servers",
      "Optional location permissions for regional luxury suggestions",
    ],
    tags: ["Data Collection", "Identity", "Payments"],
  },
  {
    id: "priv-2",
    sectionNumber: "02",
    title: "How We Use Your Data",
    icon: "cog-outline",
    summary:
      "Your information powers instant booking confirmations, personalized concierge services, and secure app performance.",
    content: [
      "Reservation Fulfillment: Transmitting necessary guest manifest data to partner luxury hotels to guarantee room availability and process front-desk check-ins.",
      "24/7 Concierge Support: Assisting with stay modifications, special room requirements, airport transfers, and resolving guest inquiries.",
      "Security & Fraud Prevention: Utilizing automated anomaly detection to prevent fraudulent credit card bookings, unauthorized account logins, and account takeovers.",
      "Personalized Experiences: Recommending curated hotels, exclusive tier rewards, and room upgrades tailored to your previous travel preferences.",
    ],
    highlights: [
      "Real-time reservation synchronization with hotel partners",
      "24/7 Concierge access to resolve active booking requests",
      "Proactive automated anti-fraud monitoring",
    ],
    tags: ["Usage", "Concierge", "Security"],
  },
  {
    id: "priv-3",
    sectionNumber: "03",
    title: "Data Sharing & Third Parties",
    icon: "share-social-outline",
    summary:
      "GetStay never sells your personal data. We share information only with hotel partners and authorized service providers.",
    content: [
      "Hotel Partners & Resorts: When you complete a booking, relevant guest details (name, contact, stay dates, special requests) are securely shared with the specific destination property.",
      "Payment Processors & Banking Partners: Encrypted payment processing via PCI-DSS Level 1 certified gateways (Visa, MasterCard, Stripe, Apple Pay).",
      "Service Infrastructure: Trusted cloud hosting, security firewalls, and analytics providers operating under strict Data Processing Agreements (DPAs).",
      "Legal Compliance & Safety: Disclosing information only when required by valid court orders, subpoenas, or emergency situations involving personal safety.",
    ],
    highlights: [
      "Zero sale of personal data to third-party ad brokers",
      "All partners bound by strict Data Processing Agreements",
      "PCI-DSS Level 1 certified payment infrastructure",
    ],
    tags: ["Data Sharing", "Third Parties", "No Sale"],
  },
  {
    id: "priv-4",
    sectionNumber: "04",
    title: "Cookies, Tracking & Preferences",
    icon: "extension-puzzle-outline",
    summary:
      "We use essential cookies and tokens to keep you logged in securely and remember your currency and language preferences.",
    content: [
      "Essential Session Cookies: Required for secure account authentication, keeping active shopping sessions valid, and preventing session hijacking.",
      "Preference Cookies: Storing your selected currency, language preferences, and dark/light appearance settings across app restarts.",
      "Analytics & Performance Tokens: Privacy-preserving performance measurement to analyze app loading speeds and optimize luxury search features.",
      "Managing Preferences: You can customize or disable non-essential analytics tracking anytime via Profile > Preferences > Privacy Controls.",
    ],
    highlights: [
      "Essential cookies required for secure authentication",
      "Granular controls for optional analytics tracking",
      "No invasive cross-site advertising trackers",
    ],
    tags: ["Cookies", "Tracking", "Preferences"],
  },
  {
    id: "priv-5",
    sectionNumber: "05",
    title: "Bank-Grade Encryption & Security",
    icon: "shield-checkmark-outline",
    summary:
      "Your data is protected with AES-256 encryption at rest and TLS 1.3 transport security in transit.",
    content: [
      "Data Encryption Standards: All sensitive user data is encrypted at rest using AES-256 bit military-grade standards and transmitted over TLS 1.3 encrypted HTTPS channels.",
      "Access Control & Isolation: Internal administrative access to user databases is restricted on a strict need-to-know basis governed by multi-factor authentication (MFA) and zero-trust protocols.",
      "Infrastructure Monitoring: Continuous 24/7 intrusion detection, vulnerability assessments, and annual third-party cybersecurity audits.",
    ],
    highlights: [
      "AES-256 encryption at rest & TLS 1.3 encryption in transit",
      "Zero-Trust administrative access controls with mandatory MFA",
      "Regular external penetration testing & security audits",
    ],
    tags: ["Encryption", "Security", "Infrastructure"],
  },
  {
    id: "priv-6",
    sectionNumber: "06",
    title: "Global Compliance (GDPR & CCPA Rights)",
    icon: "globe-outline",
    summary:
      "Full compliance with GDPR (EU), CCPA/CPRA (California), and global privacy frameworks giving you total data ownership.",
    content: [
      "Right to Access & Portability: You have the right to request a complete copy of all personal data held by GetStay in a structured, machine-readable format (JSON/CSV).",
      "Right to Rectification: You can update incorrect or incomplete personal profile details directly within the GetStay mobile app.",
      "Right to Erasure ('Right to be Forgotten'): You may request permanent deletion of your account and associated personal data, subject to statutory tax retention laws.",
      "Right to Opt-Out: California residents and EU citizens can opt out of any non-essential data processing or promotional communications at any time.",
    ],
    highlights: [
      "Full GDPR, CCPA & CPRA compliance framework",
      "Instant self-service data export & erasure requests",
      "Dedicated Data Protection Officer (DPO) support",
    ],
    tags: ["GDPR", "CCPA", "Rights", "Compliance"],
  },
  {
    id: "priv-7",
    sectionNumber: "07",
    title: "Data Retention & Storage Limits",
    icon: "time-outline",
    summary:
      "We retain your data only for as long as necessary to provide services and fulfill legal tax and accounting requirements.",
    content: [
      "Active Account Data: Retained for the duration of your active account subscription to maintain your GetStay Gold status, vouchers, and reward points.",
      "Completed Transaction Records: Financial invoice records and booking receipts are retained for 7 years in accordance with international tax and legal compliance mandates.",
      "Inactive Accounts: Accounts with no login activity for over 36 consecutive months are automatically flagged for archival and eventual purging following user notification.",
    ],
    highlights: [
      "7-year statutory retention for financial invoices",
      "Automatic archival for long-inactive guest accounts",
      "Prompt purge upon verified account deletion requests",
    ],
    tags: ["Retention", "Storage", "Archival"],
  },
  {
    id: "priv-8",
    sectionNumber: "08",
    title: "Data Protection Officer & Privacy Inquiries",
    icon: "mail-outline",
    summary:
      "Our dedicated Privacy Office and Data Protection Officer are available 24/7 for privacy requests and compliance questions.",
    content: [
      "If you have any questions, concerns, or formal privacy requests regarding how your personal information is managed, our Data Protection Officer is ready to assist.",
      "Contact Channels:",
      "• Email: dpo@getstay.com",
      "• Legal Concierge: Privacy Office, GetStay Luxury Hospitality Inc., 500 Delaware Ave, Wilmington, DE 19801",
      "We commit to acknowledging all formal data privacy inquiries within 24 hours and completing data subject requests within 15 business days.",
    ],
    highlights: [
      "Direct email access to Data Protection Officer (dpo@getstay.com)",
      "24-hour response acknowledgment guarantee",
      "15-day maximum turnaround for data subject requests",
    ],
    tags: ["DPO", "Contact", "Support"],
  },
];

const TOC_CHIPS = [
  "All Sections",
  "Data Collection",
  "Usage",
  "Data Sharing",
  "Cookies",
  "Encryption",
  "GDPR & CCPA",
  "DPO",
];

export default function PrivacyPolicyScreen() {
  const [selectedChip, setSelectedChip] = useState("All Sections");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("priv-1");

  // Modal states for Data Subject Requests
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Filter sections based on chip and query
  const filteredSections = PRIVACY_SECTIONS.filter((sec) => {
    const matchesChip =
      selectedChip === "All Sections" ||
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

  const handleSharePolicy = async () => {
    try {
      await Share.share({
        title: "GetStay Privacy Policy",
        message:
          "Review GetStay's official Privacy Policy & Data Security Standards: https://getstay.com/legal/privacy",
      });
    } catch (error) {
      Alert.alert("Share Privacy Policy", "Link copied to clipboard: https://getstay.com/legal/privacy");
    }
  };

  const handleTriggerExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
    }, 1800);
  };

  const resetExportModal = () => {
    setExportModalVisible(false);
    setExportComplete(false);
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
          {/* Top Row */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Privacy Policy</Text>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleSharePolicy}
              hitSlop={10}
            >
              <Ionicons name="share-outline" size={20} color={COLORS.gold} />
            </TouchableOpacity>
          </View>

          {/* Compliance Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.complianceBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.navy} />
              <Text style={styles.complianceBadgeText}>GDPR & CCPA Compliant</Text>
            </View>
            <Text style={styles.updatedText}>Updated: Sept 2026</Text>
          </View>

          <Text style={styles.heroSubtitle}>
            Your privacy and data security are paramount. Discover how we protect your personal information.
          </Text>
        </View>

        {/* THREE CORE PRIVACY PILLARS */}
        <View style={styles.pillarsContainer}>
          <Text style={styles.sectionLabel}>Our Privacy Commitments</Text>
          <View style={styles.pillarsRow}>
            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconBox, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="lock-closed" size={20} color={COLORS.blue} />
              </View>
              <Text style={styles.pillarTitle}>AES-256 Encryption</Text>
              <Text style={styles.pillarSub}>Bank-grade protection for all data at rest</Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconBox, { backgroundColor: "#D1FAE5" }]}>
                <Ionicons name="shield-outline" size={20} color={COLORS.green} />
              </View>
              <Text style={styles.pillarTitle}>No Data Sales</Text>
              <Text style={styles.pillarSub}>We never sell guest data to advertisers</Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconBox, { backgroundColor: "#F3E8FF" }]}>
                <Ionicons name="finger-print" size={20} color={COLORS.purple} />
              </View>
              <Text style={styles.pillarTitle}>Total Ownership</Text>
              <Text style={styles.pillarSub}>Full rights to export or erase your data</Text>
            </View>
          </View>
        </View>

        {/* TOC CHIPS */}
        <View style={styles.tocSection}>
          <Text style={styles.sectionLabel}>Browse Privacy Topics</Text>
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

        {/* PRIVACY SECTIONS / ACCORDIONS */}
        <View style={styles.sectionsContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Privacy Policy Clauses</Text>
            <Text style={styles.sectionCountText}>
              Showing {filteredSections.length} of {PRIVACY_SECTIONS.length} Sections
            </Text>
          </View>

          {filteredSections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No privacy topics found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search criteria or choose 'All Sections' to browse our complete policy.
              </Text>
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSelectedChip("All Sections");
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

                  {/* Summary Callout Box */}
                  <View style={styles.summaryBox}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color={COLORS.gold}
                      style={{ marginTop: 1 }}
                    />
                    <Text style={styles.summaryText}>{item.summary}</Text>
                  </View>

                  {/* Expanded Content */}
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
                            ⚡ Key Security Guarantees
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

        {/* CONTACT DPO CALLOUT */}
        <View style={styles.dpoCallout}>
          <View style={styles.dpoIconCircle}>
            <Ionicons name="mail-open-outline" size={24} color={COLORS.gold} />
          </View>
          <View style={styles.dpoContentGroup}>
            <Text style={styles.dpoTitle}>Questions about your privacy?</Text>
            <Text style={styles.dpoSub}>
              Our Data Protection Officer (DPO) is available at{" "}
              <Text style={{ fontWeight: "700", color: COLORS.white }}>dpo@getstay.com</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dpoBtn}
            onPress={() => router.push("/contact-support")}
          >
            <Text style={styles.dpoBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DATA EXPORT MODAL */}
      <Modal
        visible={exportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetExportModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personal Data Export</Text>
              <TouchableOpacity onPress={resetExportModal}>
                <Ionicons name="close" size={24} color={COLORS.navy} />
              </TouchableOpacity>
            </View>

            {exportComplete ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconBox}>
                  <Ionicons name="checkmark-circle" size={54} color={COLORS.green} />
                </View>
                <Text style={styles.successTitle}>Data Package Ready!</Text>
                <Text style={styles.successSub}>
                  Your requested data export package (<Text style={{ fontWeight: "700", color: COLORS.navy }}>GetStay_Data_Export.zip</Text>) has been generated. An encrypted download link has also been sent to your registered email address.
                </Text>
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={resetExportModal}
                >
                  <Text style={styles.modalPrimaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalBodyContainer}>
                <Ionicons name="document-text-outline" size={44} color={COLORS.navy} style={{ alignSelf: "center", marginBottom: 12 }} />
                <Text style={styles.modalInfoTitle}>GDPR Article 20 Data Portability</Text>
                <Text style={styles.modalInfoSub}>
                  This export file includes your complete profile records, reservation receipts, concierge conversation logs, and saved preferences formatted in JSON and CSV.
                </Text>

                <View style={styles.modalFeatureList}>
                  <View style={styles.modalFeatureItem}>
                    <Ionicons name="shield-checkmark" size={16} color={COLORS.green} />
                    <Text style={styles.modalFeatureText}>Password-protected 256-bit ZIP archive</Text>
                  </View>
                  <View style={styles.modalFeatureItem}>
                    <Ionicons name="shield-checkmark" size={16} color={COLORS.green} />
                    <Text style={styles.modalFeatureText}>Delivered directly to your authenticated email</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modalPrimaryBtn,
                    isExporting && { opacity: 0.7 },
                  ]}
                  onPress={handleTriggerExport}
                  disabled={isExporting}
                >
                  <Text style={styles.modalPrimaryBtnText}>
                    {isExporting ? "Generating Archive..." : "Generate & Email My Data Archive"}
                  </Text>
                </TouchableOpacity>
              </View>
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
  complianceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  complianceBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.3,
  },
  updatedText: {
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

  /* THREE CORE PILLARS */
  pillarsContainer: {
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
  pillarsRow: {
    flexDirection: "row",
    gap: 10,
  },
  pillarCard: {
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
  pillarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  pillarTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  pillarSub: {
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

  /* SECTIONS CONTAINER */
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
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    color: "#166534",
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

  /* DATA RIGHTS CARD */
  dataRightsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 10,
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
  dataRightsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.navyMid,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  dataRightsContent: {
    marginBottom: 14,
  },
  dataRightsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  dataRightsSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  dataRightsButtonsRow: {
    flexDirection: "row",
  },
  exportDataBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  exportDataBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy,
  },

  /* DPO CALLOUT BANNER */
  dpoCallout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.navy,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  dpoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.navyMid,
    justifyContent: "center",
    alignItems: "center",
  },
  dpoContentGroup: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  dpoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 2,
  },
  dpoSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  dpoBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  dpoBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 28, 46, 0.65)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.navy,
  },
  modalBodyContainer: {
    paddingVertical: 16,
  },
  modalInfoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  modalInfoSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },
  modalFeatureList: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalFeatureText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalPrimaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.gold,
  },

  successContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIconBox: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
});
