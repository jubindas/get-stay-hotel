import Categories from "@/components/Categories";
import OfferBanner from "@/components/OfferBanner";
import PopularDestinations from "@/components/PopularDestinations";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import React from "react";

import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeIndex() {
  const router = useRouter();

  const Divider = () => <View style={styles.divider} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerWrapper}>
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push("/search-bar")}
        >
          <View style={styles.searchInner}>
            <Ionicons name="search" size={20} color="#10b981" />
            <View style={styles.searchTextContainer}>
              <Text style={styles.searchPlaceholder}>
                Find your best Hotels
              </Text>
              <Text style={styles.searchSubtext}>
                Anywhere • Any week • Add guests
              </Text>
            </View>
          </View>

          <View style={styles.filterIconBox}>
            <Ionicons name="options-outline" size={18} color="#0f172a" />
          </View>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <OfferBanner />
        <Categories />
        <Divider />
        <PopularDestinations />
        <Divider />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 20,
    marginVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  searchTextContainer: {
    marginLeft: 12,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  searchSubtext: {
    fontSize: 11,
    color: "#64748b",
  },
  filterIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingTop: 10,
  },
  contentPlaceholder: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 15,
  },
  dummyCard: {
    height: 200,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    marginBottom: 20,
  },
});
