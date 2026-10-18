import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  navy: "#0F1C2E",
  gold: "#C9A84C",
  white: "#FFFFFF",
  surface: "#F8F9FB",
  border: "#E8EDF3",
  textPrimary: "#0F1C2E",
  textSecondary: "#8A9BB0",
  textMuted: "#B0BCC9",
  red: "#E05252",
};

interface MenuOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  color?: string;
  showArrow?: boolean;
  danger?: boolean;
  onPress?: () => void;
}

export default function MenuOption({
  icon,
  title,
  subtitle,
  color = COLORS.textPrimary,
  showArrow = true,
  danger = false,
  onPress,
}: MenuOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, danger && styles.menuItemDanger]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: danger
              ? COLORS.red + "15"
              : color === COLORS.gold
                ? COLORS.gold + "18"
                : COLORS.navy + "08",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            danger
              ? COLORS.red
              : color === COLORS.gold
                ? COLORS.gold
                : COLORS.navy
          }
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && { color: COLORS.red }]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
