import { Ionicons } from "@expo/vector-icons"; // Or your preferred icon library

import React from "react";

import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";




const ReviewBookingScreen = () => {




  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Review and continue</Text>

      <View style={styles.card}>
        {/* Property Info */}
        <View style={styles.propertyRow}>
          <Image
            source={{
              uri: "https://i.pinimg.com/736x/8d/84/3e/8d843e7f855cee936e12d7f40c3b1348.jpg",
            }}
            style={styles.propertyImage}
          />
          <View style={styles.propertyTextContainer}>
            <Text style={styles.propertyName}>HillCrest - Golden Horizon</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>★ 4.98 (66)</Text>
              <Text style={styles.badgeText}> • Guest favourite</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Dates Row */}
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Dates</Text>
            <Text style={styles.value}>21–23 Nov 2025</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Guests</Text>
            <Text style={styles.value}>1 adult</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Total price</Text>
            <Text style={styles.value}>
              ₹7,147.06 <Text style={styles.subValue}>including taxes INR</Text>
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.policyText}>
          Cancel before check-in on 21 November for a partial refund.
          <Text style={styles.linkText}> Full policy</Text>
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  header: { paddingVertical: 10, alignItems: "flex-end" },
  title: { fontSize: 28, fontWeight: "700", marginVertical: 20, color: "#222" },
  card: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#fff",
  },
  propertyRow: { flexDirection: "row", marginBottom: 20 },
  propertyImage: { width: 80, height: 80, borderRadius: 12 },
  propertyTextContainer: { marginLeft: 15, justifyContent: "center", flex: 1 },
  propertyName: { fontSize: 18, fontWeight: "600" },
  ratingRow: { flexDirection: "row", marginTop: 4 },
  ratingText: { fontSize: 14, fontWeight: "500" },
  badgeText: { fontSize: 14, color: "#666" },
  divider: { height: 1, backgroundColor: "#F0F0F0" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: { fontSize: 16, fontWeight: "600", color: "#222" },
  value: { fontSize: 15, color: "#444", marginTop: 2 },
  subValue: { fontSize: 13, fontWeight: "400", color: "#666" },
  changeBtn: {
    fontWeight: "600",
    textDecorationLine: "underline",
    color: "#222",
  },
  policyText: { fontSize: 14, color: "#444", lineHeight: 20, marginTop: 15 },
  linkText: { fontWeight: "700", textDecorationLine: "underline" },
  footer: { position: "absolute", bottom: 30, left: 20, right: 20 },
  nextButton: {
    backgroundColor: "#222",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});

export default ReviewBookingScreen;
