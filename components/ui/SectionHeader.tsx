import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";

export default function SectionHeader({
  title,
  style,
}: {
  title: string;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.sectionTitle, style]}>{title}</Text>;
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
  },
});
