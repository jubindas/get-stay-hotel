import PropertyCard from "@/components/search/PropertyCard";
import { Property } from "@/types/property";
import { ChevronRight } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

const CARD_WIDTH = 320;

export default function RelatedProperties({
  properties,
}: {
  properties: Property[];
}) {
  if (!properties.length) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>You may also like</Text>

              <View style={styles.count}>
                <Text style={styles.countText}>{properties.length}</Text>
              </View>
            </View>

            <Text style={styles.subtitle}>
              Similar properties picked for you
            </Text>
          </View>

          <View style={styles.swipeHint}>
            <ChevronRight size={16} color="#64748B" />
          </View>
        </View>

        {/* Properties */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          snapToAlignment="start"
        >
          {properties.map((property) => (
            <View key={property.id} style={styles.card}>
              <PropertyCard property={property} />
            </View>
          ))}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },

  container: {
    marginTop: 28,
    width: "100%",
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  titleContainer: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#0F172A",
  },

  count: {
    marginLeft: 9,
    minWidth: 28,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },

  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  /* Swipe indicator */
  swipeHint: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  /* Scroll */
  content: {
    paddingHorizontal: 20,
    paddingRight: 4,
  },

  card: {
    width: CARD_WIDTH,
    marginRight: 16,
  },
});
