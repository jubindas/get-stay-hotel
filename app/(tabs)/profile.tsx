import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  white: "#FFFFFF",
  black: "#18181b",
  grayText: "#71717a",
  lightGray: "#f4f4f5",
  border: "#e4e4e7",
  blue: "#2563eb",
  red: "#ef4444",
};

export default function Profile() {
  const MenuOption = ({
    icon,
    title,
    subtitle,
    color = COLORS.black,
    showArrow = true,
  }: any) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={[styles.iconBox, { backgroundColor: color + "10" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: color }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE HEADER */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Aman Kalita</Text>
          <Text style={styles.userEmail}>aman.kalita@example.com</Text>
        </View>

        {/* SETTINGS GROUPS */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <MenuOption
            icon="person-outline"
            title="Personal Information"
            subtitle="Name, email, phone number"
          />
          <MenuOption
            icon="shield-checkmark-outline"
            title="Login & Security"
            subtitle="Update password and security"
          />
          <MenuOption
            icon="card-outline"
            title="Payments & Payouts"
            subtitle="Your transactions and cards"
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuOption icon="help-circle-outline" title="Help Center" />
          <MenuOption
            icon="chatbubble-ellipses-outline"
            title="Contact Support"
          />
          <MenuOption icon="document-text-outline" title="Terms of Service" />
        </View>

        <View style={[styles.menuSection, { marginBottom: 40 }]}>
          <MenuOption
            icon="log-out-outline"
            title="Log Out"
            color={COLORS.red}
            showArrow={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.lightGray,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.blue,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.grayText,
    marginTop: 2,
  },
  editProfileBtn: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: "60%",
    backgroundColor: COLORS.border,
    alignSelf: "center",
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fafafa",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
    marginLeft: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
});
