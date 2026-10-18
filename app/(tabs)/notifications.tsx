import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

/* ----------------------------- Types & config ----------------------------- */

type NotificationType = "booking" | "offer" | "system";

// Shape returned by the backend (snake_case)
interface ApiNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
}

// Shape used by the UI
interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: NotificationType;
  isRead: boolean;
}

const COLORS = {
  white: "#FFFFFF",
  black: "#18181b",
  grayText: "#71717a",
  lightGray: "#f4f4f5",
  blue: "#2563eb",
  amber: "#f59e0b",
  green: "#10b981",
  red: "#ef4444",
  redBg: "#fef2f2",
};

const ICONS: Record<
  NotificationType,
  { name: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  booking: { name: "calendar", color: COLORS.blue, bg: "#dbeafe" },
  offer: { name: "pricetag", color: COLORS.green, bg: "#dcfce7" },
  system: { name: "notifications", color: COLORS.amber, bg: "#fef3c7" },
};

const BASE_URL = "/api/user/profile/notifications";

/* -------------------------------- Helpers --------------------------------- */

const toNotification = (n: ApiNotification): Notification => ({
  id: n.id,
  title: n.title,
  message: n.message,
  createdAt: n.created_at,
  isRead: n.is_read,
  type: n.type === "booking" || n.type === "offer" ? n.type : "system",
});

const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Turn any axios error into a short, readable message
const getErrorMessage = (err: any, fallback: string): string => {
  // No response at all -> network problem or server down
  if (!err?.response) {
    return "Cannot reach the server. Check your internet connection.";
  }

  const status: number = err.response.status;
  const serverMessage: string | undefined =
    err.response.data?.message || err.response.data?.error;

  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You don't have permission to view this.";
  if (status === 404) return "Notifications service was not found.";
  if (status >= 500) return "Server error. Please try again later.";

  // 400 and anything else: show what the server said
  return serverMessage || fallback;
};

// Log full details in dev so the real cause of a 400 is visible
const logError = (label: string, err: any) => {
  if (__DEV__) {
    console.log(label, {
      status: err?.response?.status,
      data: err?.response?.data,
      url: err?.config?.url,
      method: err?.config?.method,
    });
  }
};

/* -------------------------------- Screen ---------------------------------- */

export default function Notifications() {
  const { token, user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true); // first load only
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Check if user is logged in and has a valid token
  const isLoggedIn = Boolean(token && (isAuthenticated || !!user) && !isUnauthorized);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (token) {
      setIsUnauthorized(false);
    }
  }, [token]);

  // GET all notifications
  const fetchNotifications = useCallback(
    async (isInitial = false) => {
      if (!token) {
        setNotifications([]);
        setError(null);
        if (isInitial) setLoading(false);
        return;
      }

      if (isInitial) setLoading(true);

      try {
        const res = await api.get(BASE_URL);
        const list: ApiNotification[] = res.data?.notifications ?? [];
        setNotifications(list.map(toNotification));
        setError(null);
        setIsUnauthorized(false);
      } catch (err: any) {
        logError("Fetch notifications failed:", err);
        if (err?.response?.status === 401) {
          setIsUnauthorized(true);
          if (logout) {
            void logout();
          }
        } else {
          setError(getErrorMessage(err, "Could not load notifications."));
        }
      } finally {
        if (isInitial) setLoading(false);
        setRefreshing(false);
      }
    },
    [token, logout],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    void fetchNotifications(true);
  }, [authLoading, isLoggedIn, fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        void fetchNotifications(false);
      } else {
        setLoading(false);
      }
    }, [isLoggedIn, fetchNotifications]),
  );

  const onRefresh = async () => {
    if (!isLoggedIn) return;
    setRefreshing(true);
    await fetchNotifications(false);
  };

  const retry = async () => {
    await fetchNotifications(true);
  };

  // PATCH mark all as read (optimistic, rolls back on failure)
  const markAllRead = async () => {
    if (unreadCount === 0) return;

    const previous = notifications;
    setNotifications(previous.map((n) => ({ ...n, isRead: true })));

    try {
      await api.patch(`${BASE_URL}/mark-read`);
    } catch (err) {
      logError("Mark all read failed:", err);
      setNotifications(previous);
      Alert.alert("Error", getErrorMessage(err, "Could not mark all as read."));
    }
  };

  // PATCH mark one as read (optimistic, rolls back on failure)
  const markOneRead = async (item: Notification) => {
    if (item.isRead) return;

    const previous = notifications;
    setNotifications(
      previous.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
    );

    try {
      await api.patch(`${BASE_URL}/${item.id}/mark-read`);
    } catch (err) {
      logError("Mark one read failed:", err);
      setNotifications(previous);
      Alert.alert(
        "Error",
        getErrorMessage(err, "Could not update notification."),
      );
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = ICONS[item.type];

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        activeOpacity={0.7}
        onPress={() => markOneRead(item)}
      >
        <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={22} color={icon.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, !item.isRead && styles.titleUnread]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  // What to show when the list is empty: error with retry, or plain empty text
  const renderEmpty = () => {
    if (error) {
      return (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={44} color={COLORS.red} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerBox}>
        <Ionicons
          name="notifications-off-outline"
          size={44}
          color={COLORS.grayText}
        />
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {isLoggedIn
              ? `You have ${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`
              : "Log in to see notifications"}
          </Text>
        </View>
        {isLoggedIn && (
          <TouchableOpacity onPress={markAllRead} disabled={unreadCount === 0}>
            <Text
              style={[
                styles.markAll,
                unreadCount === 0 && styles.markAllDisabled,
              ]}
            >
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {authLoading || (loading && isLoggedIn) ? (
        <ActivityIndicator style={styles.loader} color={COLORS.blue} />
      ) : !isLoggedIn ? (
        <ScrollView
          contentContainerStyle={styles.unauthScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.unauthCard}>
            <View style={styles.unauthIconContainer}>
              <View style={styles.unauthIconCircle}>
                <Ionicons name="notifications" size={36} color={COLORS.blue} />
              </View>
              <View style={styles.unauthLockBadge}>
                <Ionicons name="lock-closed" size={13} color="#ffffff" />
              </View>
            </View>

            <Text style={styles.unauthTitle}>Log In to See Notifications</Text>
            <Text style={styles.unauthSubtitle}>
              Please log in to check your notifications, stay updates, and booking alerts.
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.blue} />
                </View>
                <Text style={styles.featureText}>
                  Booking confirmations & check-in alerts
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Ionicons name="pricetag-outline" size={16} color={COLORS.green} />
                </View>
                <Text style={styles.featureText}>
                  Exclusive deals, flash discounts & offers
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.amber} />
                </View>
                <Text style={styles.featureText}>
                  Important security & front-desk notices
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginCtaBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/login")}
            >
              <Ionicons name="log-in-outline" size={19} color="#ffffff" />
              <Text style={styles.loginCtaText}>Log In to See Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryExploreBtn}
              activeOpacity={0.7}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.secondaryExploreText}>
                Explore Properties First
              </Text>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/register")} activeOpacity={0.7}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Banner: shown when a refresh fails but old data is still on screen */}
          {error && notifications.length > 0 && (
            <TouchableOpacity style={styles.banner} onPress={retry}>
              <Text style={styles.bannerText}>{error} Tap to retry.</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={renderEmpty}
          />
        </>
      )}
    </SafeAreaView>
  );
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: -1,
  },
  headerSubtitle: { fontSize: 13, color: COLORS.grayText, marginTop: 4 },
  markAll: { fontSize: 14, color: COLORS.blue, fontWeight: "600" },
  markAllDisabled: { color: COLORS.grayText },
  loader: { marginTop: 40 },
  listContent: { flexGrow: 1, paddingBottom: 40 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.white,
  },
  unreadCard: { backgroundColor: "#f8fafc" },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { flex: 1, marginLeft: 15 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { flex: 1, marginRight: 8, fontSize: 15, color: COLORS.black },
  titleUnread: { fontWeight: "700" },
  time: { fontSize: 12, color: COLORS.grayText },
  message: { fontSize: 14, lineHeight: 20, color: COLORS.grayText },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
    backgroundColor: COLORS.blue,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
    backgroundColor: COLORS.lightGray,
  },

  // Empty + error states
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyText: { marginTop: 12, fontSize: 15, color: COLORS.grayText },
  errorTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.black,
  },
  errorText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.grayText,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.blue,
  },
  retryText: { color: COLORS.white, fontWeight: "600", fontSize: 14 },

  banner: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.redBg,
  },
  bannerText: { fontSize: 13, color: COLORS.red },

  // Unauthenticated screen styles
  unauthContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  unauthCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  unauthIconContainer: {
    position: "relative",
    marginBottom: 16,
  },
  unauthIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  unauthLockBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  unauthTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  unauthSubtitle: {
    fontSize: 13.5,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  featuresList: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 22,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
    flex: 1,
  },
  loginCtaBtn: {
    width: "100%",
    backgroundColor: "#0f172a",
    paddingVertical: 15,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginCtaText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  headerTextContainer: {
    flex: 1,
  },
  secondaryExploreBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryExploreText: {
    color: "#64748b",
    fontSize: 13.5,
    fontWeight: "600",
  },
  unauthScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  registerPrompt: {
    fontSize: 13.5,
    color: "#64748b",
  },
  registerLink: {
    fontSize: 13.5,
    color: COLORS.blue,
    fontWeight: "700",
  },
});
