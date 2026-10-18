import MenuOption from "@/components/profile/MenuOption";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Platform,
  Image as RNImage,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  navy: "#0F1C2E",
  navyMid: "#1A2F4A",
  gold: "#C9A84C",
  goldLight: "#F0DFA0",
  white: "#FFFFFF",
  surface: "#F8F9FB",
  border: "#E8EDF3",
  textPrimary: "#0F1C2E",
  textSecondary: "#8A9BB0",
  textMuted: "#B0BCC9",
  red: "#E05252",
  green: "#2D9E6B",
};

export default function Profile() {
  const { token, user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO BANNER */}
        <View style={styles.heroBanner}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={styles.appLabel}>MY ACCOUNT</Text>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={COLORS.white}
              />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Avatar card */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarWrapper}>
              <RNImage
                source={{
                  uri: token
                    ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80"
                    : "https://ui-avatars.com/api/?name=Guest&background=C9A84C&color=fff&size=200",
                }}
                style={styles.profileImage}
              />
              {token && <View style={styles.onlineDot} />}
            </View>
            <Text style={styles.userName}>
              {token ? user?.full_name || "Welcome back" : "Guest User"}
            </Text>
            <Text style={styles.userEmail}>
              {token ? user?.email : "Sign in for the full experience"}
            </Text>

            {/* Member badge */}
            {token && (
              <View style={styles.memberBadge}>
                <Ionicons name="star" size={11} color={COLORS.navy} />
                <Text style={styles.memberBadgeText}>Gold Member</Text>
              </View>
            )}
          </View>
        </View>


        {/* LOGIN / LOGOUT CTA */}
        {!token ? (
          <View style={styles.authSection}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push("/login")}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={18} color={COLORS.navy} />
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </TouchableOpacity>
            <Text style={styles.authNote}>
              New here?{" "}
              <Text
                style={styles.authLink}
                onPress={() => router.push("/register")}
              >
                Create an account
              </Text>
            </Text>
          </View>
        ) : null}

        {/* ACCOUNT SETTINGS */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.menuCard}>
            <MenuOption
              icon="person-outline"
              title="Personal Information"
              subtitle="Name, phone & preferences"
            />
            <MenuOption
              icon="shield-checkmark-outline"
              title="Login & Security"
              subtitle="Password & security settings"
              showArrow
              onPress={() => router.push(token ? "/change-password" : "/login")}
            />
            <MenuOption
              icon="card-outline"
              title="Payments & Payouts"
              subtitle="Saved cards & transactions"
              color={COLORS.gold}
            />
            <MenuOption
              icon="bookmark-outline"
              title="My Bookings"
              subtitle="Current & past reservations"
              showArrow
              onPress={() => router.push("/bookings")}
            />
          </View>
        </View>

        {/* SUPPORT */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Help & Legal</Text>
          <View style={styles.menuCard}>
            <MenuOption
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => router.push("/help-center")}
            />
            <MenuOption
              icon="chatbubble-ellipses-outline"
              title="Contact Support"
              onPress={() => router.push("/contact-support")}
            />
            <MenuOption
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => router.push("/terms-of-service")}
            />
            <MenuOption
              icon="lock-closed-outline"
              title="Privacy Policy"
              onPress={() => router.push("/privacy-policy")}
            />
          </View>
        </View>

        {/* LOGOUT */}
        {token && (
          <View style={styles.menuSection}>
            <View style={styles.menuCard}>
              <TouchableOpacity
                style={styles.logoutItem}
                onPress={logout}
                activeOpacity={0.7}
              >
                <View style={styles.iconBoxDanger}>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={COLORS.red}
                  />
                </View>
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.versionText}>GetStay v1.0.0</Text>
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

  /* HERO */
  heroBanner: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  appLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: COLORS.gold,
  },
  notifBtn: {
    position: "relative",
    padding: 4,
  },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
  },
  avatarCard: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  onlineDot: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: COLORS.navy,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy,
    letterSpacing: 0.5,
  },

  /* STATS */
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: -18,
    paddingVertical: 18,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
    alignSelf: "center",
  },

  /* AUTH */
  authSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    gap: 8,
    width: "100%",
    marginBottom: 14,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.3,
  },
  authNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  authLink: {
    color: COLORS.gold,
    fontWeight: "700",
  },

  /* MENU */
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  menuItemDanger: {
    borderBottomColor: "transparent",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBoxDanger: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.red + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
    marginLeft: 13,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.red,
    marginLeft: 13,
  },

  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 28,
    letterSpacing: 0.5,
  },
});
