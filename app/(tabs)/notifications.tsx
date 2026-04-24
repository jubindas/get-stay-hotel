import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  white: "#FFFFFF",
  black: "#18181b",
  grayText: "#71717a",
  lightGray: "#f4f4f5",
  border: "#e4e4e7",
  blue: "#2563eb",
  amber: "#f59e0b",
  red: "#ef4444",
  green: "#10b981",
};

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "booking" | "offer" | "system";
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Booking Confirmed! 🎉",
    message: "Your stay at Radisson Blu, Guwahati has been successfully booked for Oct 24-26.",
    time: "2m ago",
    type: "booking",
    isRead: false,
  },
  {
    id: "2",
    title: "Flash Sale: 30% Off",
    message: "Get exclusive discounts on luxury resorts in Shillong this weekend only!",
    time: "1h ago",
    type: "offer",
    isRead: false,
  },
  {
    id: "3",
    title: "Refund Processed",
    message: "The refund for your cancelled booking at Blue Orchid has been initiated.",
    time: "Yesterday",
    type: "system",
    isRead: true,
  },
  {
    id: "4",
    title: "New Destination Added",
    message: "Explore the new hidden gems added in Kaziranga National Park.",
    time: "2 days ago",
    type: "system",
    isRead: true,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const getIcon = (type: string) => {
    switch (type) {
      case "booking": return { name: "calendar", color: COLORS.blue, bg: "#dbeafe" };
      case "offer": return { name: "pricetag", color: COLORS.green, bg: "#dcfce7" };
      default: return { name: "notifications", color: COLORS.amber, bg: "#fef3c7" };
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const iconData = getIcon(item.type);

    return (
      <TouchableOpacity 
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
          <Ionicons name={iconData.name as any} size={22} color={iconData.color} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.textHeader}>
            <Text style={[styles.notifTitle, !item.isRead && styles.boldText]}>
              {item.title}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={2}>
            {item.message}
          </Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            You have {notifications.filter(n => !n.isRead).length} unread messages
          </Text>
        </View>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 4,
  },
  markReadText: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  unreadCard: {
    backgroundColor: "#f8fafc", // Very subtle blue/gray tint for unread
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    marginLeft: 15,
  },
  textHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    color: COLORS.black,
    flex: 1,
    marginRight: 8,
  },
  boldText: {
    fontWeight: "700",
  },
  timeText: {
    fontSize: 12,
    color: COLORS.grayText,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.grayText,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 20,
  },
});