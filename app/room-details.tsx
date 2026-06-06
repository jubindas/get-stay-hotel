import { router } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Coffee,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  Wifi,
  Wind,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#10b981",
  secondary: "#0f172a",
  inactive: "#64748b",
  white: "#ffffff",
  border: "#f1f5f9",
  accent: "#f43f5e",
  bgLight: "#f8fafc",
};

const ROOM_IMAGES = [
  {
    id: "1",
    uri: "https://i.pinimg.com/1200x/57/1c/e1/571ce1019213ba03388fea7d8a05ce1c.jpg",
  },
  {
    id: "2",
    uri: "https://i.pinimg.com/736x/34/36/5a/34365aed3373049a3844bc5262747d20.jpg",
  },
  {
    id: "3",
    uri: "https://i.pinimg.com/736x/8d/84/3e/8d843e7f855cee936e12d7f40c3b1348.jpg",
  },
];

const AMENITIES = [
  {
    id: "1",
    name: "Fast WiFi",
    icon: <Wifi size={20} color={COLORS.secondary} />,
  },
  {
    id: "2",
    name: "Breakfast",
    icon: <Coffee size={20} color={COLORS.secondary} />,
  },
  {
    id: "3",
    name: "Air Conditioning",
    icon: <Wind size={20} color={COLORS.secondary} />,
  },
];

const GUEST_PHOTOS = [
  {
    id: "1",
    uri: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300",
  },
  {
    id: "2",
    uri: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=300",
  },
];

export default function RoomDetails() {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: any }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          <FlatList
            data={ROOM_IMAGES}
            renderItem={({ item }) => (
              <Image source={{ uri: item.uri }} style={styles.mainImage} />
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            keyExtractor={(item) => item.id}
          />

          <View style={styles.paginationRow}>
            {ROOM_IMAGES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === activeIndex
                        ? COLORS.white
                        : "rgba(255,255,255,0.5)",
                  },
                ]}
              />
            ))}
          </View>

          <SafeAreaView style={styles.topActions}>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => router.back()}
            >
              <ChevronLeft size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundBtn}>
              <Heart size={20} color={COLORS.accent} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.title}>HillCrest - Golden Horizon</Text>
          <Text style={styles.subTitle}>Entire suite in Shillong, India</Text>
          <Text style={styles.roomSpecs}>
            2 guests • 1 bedroom • 1 bed • 1 bath
          </Text>

        
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.row}>
                <Text style={styles.statValue}>4.98 </Text>
                <Star
                  size={14}
                  color={COLORS.secondary}
                  fill={COLORS.secondary}
                />
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>66</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          <View style={styles.fullDivider} />

       
          <SectionHeader title="About this space" />
          <Text style={styles.descriptionText}>
            Nestled in the quiet hills of Shillong, this artisanal suite offers
            panoramic views of the valley. Designed with a minimal aesthetic and
            organic textures, it’s the perfect retreat for creators and
            travelers seeking peace.
          </Text>

          <View style={styles.fullDivider} />

          
          <SectionHeader title="What this place offers" />
          {AMENITIES.map((item) => (
            <View key={item.id} style={styles.amenityItem}>
              {item.icon}
              <Text style={styles.amenityText}>{item.name}</Text>
            </View>
          ))}

          <View style={styles.fullDivider} />

          {/* Map Location */}
          <SectionHeader title="Where you'll be" />
          <View style={styles.mapPlaceholder}>
            <MapPin size={24} color={COLORS.primary} />
            <Text style={styles.mapText}>Guwahati-Shillong Rd, Meghalaya</Text>
          </View>

          <View style={styles.fullDivider} />

      
          <View style={styles.rowBetween}>
            <SectionHeader title="Reviews" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoList}
          >
            {GUEST_PHOTOS.map((photo) => (
              <Image
                key={photo.id}
                source={{ uri: photo.uri }}
                style={styles.guestPhoto}
              />
            ))}
          </ScrollView>

          <View style={styles.fullDivider} />

          <SectionHeader title="House Rules" />
          <View style={styles.ruleItem}>
            <Clock size={18} color={COLORS.inactive} />
            <Text style={styles.ruleText}>Check-in: 2:00 PM - 8:00 PM</Text>
          </View>
          <View style={styles.ruleItem}>
            <ShieldCheck size={18} color={COLORS.inactive} />
            <Text style={styles.ruleText}>No smoking or parties</Text>
          </View>

          <View style={styles.fullDivider} />


          <SectionHeader title="Similar properties" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2].map((item) => (
              <View key={item} style={styles.similarCard}>
                <Image
                  source={{ uri: ROOM_IMAGES[1].uri }}
                  style={styles.similarImage}
                />
                <Text style={styles.similarTitle}>Pine View Cottage</Text>
                <Text style={styles.similarPrice}>₹4,200 / night</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>₹6,848</Text>
          <Text style={styles.footerSub}>Total before taxes</Text>
        </View>
        <TouchableOpacity
          style={styles.reserveBtn}
          onPress={() => router.push("/review-booking-screen")}
        >
          <Text style={styles.reserveBtnText}>Reserve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingBottom: 140 },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  // Image Header
  imageContainer: { height: 400, position: "relative" },
  mainImage: { width: width, height: "100%" },
  paginationRow: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 4 },
  topActions: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  // Content
  contentCard: { padding: 24 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.secondary },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.secondary,
    marginTop: 4,
  },
  roomSpecs: { fontSize: 14, color: COLORS.inactive, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 12,
  },
  descriptionText: { fontSize: 15, color: COLORS.inactive, lineHeight: 22 },

  statsRow: {
    flexDirection: "row",
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.bgLight,
    borderRadius: 16,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 16, fontWeight: "800", color: COLORS.secondary },
  statLabel: { fontSize: 12, color: COLORS.inactive, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },

  amenityItem: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  amenityText: { marginLeft: 12, fontSize: 15, color: COLORS.secondary },

  mapPlaceholder: {
    height: 150,
    backgroundColor: COLORS.bgLight,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderColor: COLORS.border,
  },
  mapText: { marginTop: 8, fontSize: 13, color: COLORS.inactive },

  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ecfdf5",
  },
  uploadText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  photoList: { flexDirection: "row" },
  guestPhoto: { width: 120, height: 120, borderRadius: 12, marginRight: 12 },

  ruleItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ruleText: { marginLeft: 10, fontSize: 14, color: COLORS.secondary },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priceLabel: { fontSize: 14, color: COLORS.inactive },
  priceValue: { fontSize: 14, color: COLORS.secondary },

  similarCard: { width: 200, marginRight: 16 },
  similarImage: { width: 200, height: 130, borderRadius: 12 },
  similarTitle: { marginTop: 8, fontWeight: "700", color: COLORS.secondary },
  similarPrice: { fontSize: 13, color: COLORS.inactive },

  fullDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerPrice: { fontSize: 18, fontWeight: "800", color: COLORS.secondary },
  footerSub: { fontSize: 12, color: COLORS.inactive },
  reserveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  reserveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
