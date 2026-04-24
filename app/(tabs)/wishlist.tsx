import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 50) / 2;

const COLORS = {
  white: "#FFFFFF",
  black: "#18181b",
  grayText: "#71717a",
  lightGray: "#f4f4f5",
  border: "#e4e4e7",
  blue: "#2563eb",
  red: "#ef4444",
  amber: "#f59e0b",
  overlay: "rgba(0, 0, 0, 0.6)",
  glass: "rgba(255, 255, 255, 0.9)",
};

interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
}

const MOCK_WISHES: Hotel[] = [
  { id: "1", name: "Radisson Blu", location: "Guwahati", price: 8500, rating: 4.8, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" },
  { id: "2", name: "Blue Orchid", location: "Tezpur", price: 3200, rating: 4.5, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" },
  { id: "3", name: "Heritage Resort", location: "Kaziranga", price: 5500, rating: 4.9, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80" },
  { id: "4", name: "Mayfair Resort", location: "Shillong", price: 7200, rating: 4.7, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80" },
];

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<Hotel[]>(MOCK_WISHES);

  const removeItem = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const renderGalleryItem = ({ item }: { item: Hotel }) => (
    <View style={styles.galleryCard}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.galleryImage} />
        
        <TouchableOpacity 
          style={styles.heartOverlay} 
          onPress={() => removeItem(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={18} color={COLORS.red} />
        </TouchableOpacity>

        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>₹{item.price.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.galleryContent}>
        <Text style={styles.galleryHotelName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.gallerySubRow}>
          <Ionicons name="location-outline" size={12} color={COLORS.grayText} />
          <Text style={styles.galleryLocationText} numberOfLines={1}>{item.location}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color={COLORS.amber} />
            <Text style={styles.galleryRating}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* REFINED HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Saved</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{wishlist.length} properties</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerCircleBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        {wishlist.length > 0 ? (
          <FlatList
            data={wishlist}
            keyExtractor={(item) => item.id}
            renderItem={renderGalleryItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={40} color={COLORS.grayText} />
            </View>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on properties you love to see them here.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.white,
    // Fixes Android status bar overlap
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { 
    flex: 1, 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingTop: 15,
    paddingBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: { 
    fontSize: 34, 
    fontWeight: "900", 
    color: COLORS.black, 
    letterSpacing: -1.2 
  },
  countBadge: {
    marginTop: 2,
  },
  countText: { 
    fontSize: 14, 
    color: COLORS.grayText, 
    fontWeight: "500" 
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContent: { 
    paddingHorizontal: 15, 
    paddingBottom: 40 
  },
  columnWrapper: { 
    justifyContent: "space-between" 
  },
  
  galleryCard: { 
    width: COLUMN_WIDTH, 
    marginBottom: 25 
  },
  imageWrapper: {
    width: '100%',
    height: COLUMN_WIDTH * 1.3,
    borderRadius: 28, // Slightly rounder for premium feel
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  galleryImage: { 
    width: '100%', 
    height: '100%' 
  },
  heartOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.glass,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.overlay,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  priceTagText: { 
    color: COLORS.white, 
    fontSize: 12, 
    fontWeight: '700' 
  },
  
  galleryContent: { 
    marginTop: 10, 
    paddingHorizontal: 4 
  },
  galleryHotelName: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: COLORS.black 
  },
  gallerySubRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4, 
    justifyContent: 'space-between' 
  },
  galleryLocationText: { 
    fontSize: 12, 
    color: COLORS.grayText, 
    marginLeft: 2, 
    flex: 1 
  },
  ratingBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.lightGray, 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 6 
  },
  galleryRating: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: COLORS.black, 
    marginLeft: 2 
  },

  emptyState: { 
    flex: 0.8, 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 40 
  },
  emptyIconCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: COLORS.lightGray, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20 
  },
  emptyTitle: { 
    fontSize: 22, 
    fontWeight: "700", 
    color: COLORS.black 
  },
  emptySubtitle: { 
    fontSize: 15, 
    color: COLORS.grayText, 
    textAlign: "center", 
    marginTop: 10, 
    lineHeight: 22 
  },
});