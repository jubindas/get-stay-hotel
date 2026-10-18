import PropertyCard from "@/components/search/PropertyCard";
import PropertySkeletonList from "@/components/search/PropertySkeleton";
import { searchProperties } from "@/services/propertyService";
import { Property } from "@/types/property";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const THEME = {
  bg: "#f8fafc",
  primary: "#10b981",
  inactive: "#94a3b8",
  white: "#ffffff",
  border: "#f1f5f9",
  textDark: "#0f172a",
};

export default function RoomsList() {
  const { category_id, q } = useLocalSearchParams<{
    category_id?: string;
    q?: string;
  }>();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await searchProperties({
          category_id: category_id || undefined,
          q: q || undefined,
        });
        if (response && Array.isArray(response.properties)) {
          setProperties(response.properties);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching rooms list:", error);
        setErrorMessage("Failed to load property listings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [category_id, q]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.listPadding}>
          <PropertySkeletonList count={4} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Error</Text>
          <Text style={styles.emptyText}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (properties.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Properties Found</Text>
          <Text style={styles.emptyText}>
            No property listings matched your criteria.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={properties}
        renderItem={({ item }) => <PropertyCard property={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },

  // --- Header Styling ---
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 14,
    color: THEME.inactive,
    fontWeight: "500",
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: "800",
    color: THEME.textDark,
    letterSpacing: -0.5,
  },
  profileWrapper: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16, // Modern squircle look
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  statusIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: THEME.primary,
    borderWidth: 3,
    borderColor: THEME.bg,
  },
  headerDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginTop: 20,
    width: "40%", // Decorative short line
    borderRadius: 1,
  },

  // --- Card Styling ---
  listPadding: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textDark,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: THEME.inactive,
    textAlign: "center",
  },
});

