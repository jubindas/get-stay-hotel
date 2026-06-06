import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

// Constants for layout
const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight : 0;

interface GuestData {
  rooms: number;
  adults: number;
  children: number;
}

interface GuestPickerProps extends GuestData {
  visible: boolean;
  onClose: () => void;
  onApply: (r: number, a: number, c: number) => void;
}

const COLORS = {
  white: "#ffffff",
  black: "#0f172a",
  grayText: "#64748b",
  lightGray: "#f1f5f9",
  green: "#10b981",
  border: "#e2e8f0",
  headerBg: "#0f172a",
  headerText: "#000000",
  greenLight: "#d1fae5",
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
};

const GuestPickerModal: React.FC<GuestPickerProps> = ({
  visible,
  rooms,
  adults,
  children,
  onClose,
  onApply,
}) => {
  const [r, setR] = useState(rooms);
  const [a, setA] = useState(adults);
  const [c, setC] = useState(children);

  const Counter = (
    label: string,
    value: number,
    setValue: (v: number) => void,
    min: number,
    max: number,
  ) => (
    <View style={gStyles.row}>
      <Text style={gStyles.label}>{label}</Text>
      <View style={gStyles.counterRow}>
        <TouchableOpacity
          style={[gStyles.btn, value <= min && gStyles.btnDisabled]}
          onPress={() => value > min && setValue(value - 1)}
        >
          <Ionicons
            name="remove"
            size={20}
            color={value <= min ? COLORS.grayText : COLORS.green}
          />
        </TouchableOpacity>
        <Text style={gStyles.value}>{value}</Text>
        <TouchableOpacity
          style={[gStyles.btn, value >= max && gStyles.btnDisabled]}
          onPress={() => value < max && setValue(value + 1)}
        >
          <Ionicons
            name="add"
            size={20}
            color={value >= max ? COLORS.grayText : COLORS.green}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={gStyles.overlay}>
        <View style={gStyles.sheet}>
          <Text style={gStyles.title}>Select Guests</Text>
          {Counter("Rooms", r, setR, 1, 10)}
          {Counter("Adults", a, setA, 1, 20)}
          {Counter("Children", c, setC, 0, 10)}
          <TouchableOpacity
            style={gStyles.apply}
            onPress={() => onApply(r, a, c)}
          >
            <Text style={gStyles.applyText}>Apply Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function OyoStyleSearchBar() {
  const [location, setLocation] = useState("");
  const [checkin, setCheckin] = useState(new Date());
  const [checkout, setCheckout] = useState(new Date(Date.now() + 86400000));
  const [guestData, setGuestData] = useState<GuestData>({
    rooms: 1,
    adults: 1,
    children: 0,
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<"in" | "out">("in");
  const [guestModalVisible, setGuestModalVisible] = useState(false);

  const handleSearch = () => {
    const payload = {
      location,
      checkin: formatDate(checkin),
      checkout: formatDate(checkout),
      ...guestData,
    };
    alert(`Searching for ${payload.location || "Nearby"}...`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.headerBg}
        translucent
      />

    
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerBack}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.headerText} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Find Hotels</Text>
            <Text style={styles.headerSubtitle}>
              Discover your perfect stay
            </Text>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons
              name="options-outline"
              size={22}
              color={COLORS.headerText}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body}>
        {/* Search Bar Input */}
        <View style={styles.searchHeader}>
          <Ionicons
            name="search-outline"
            size={20}
            color={COLORS.grayText}
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search for city, location or hotel"
            placeholderTextColor={COLORS.grayText}
            style={styles.searchInput}
            value={location}
            onChangeText={setLocation}
          />
          {location.length > 0 && (
            <TouchableOpacity onPress={() => setLocation("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.grayText} />
            </TouchableOpacity>
          )}
        </View>

        {/* Info Row (Check-in & Guests) */}
        <View style={styles.quickInfoRow}>
          <TouchableOpacity
            style={styles.infoSegment}
            onPress={() => {
              setActiveDateField("in");
              setDatePickerVisible(true);
            }}
          >
            <View style={styles.infoIconRow}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={COLORS.grayText}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.label}>CHECK-IN</Text>
            </View>
            <Text style={styles.greenText}>{formatDate(checkin)}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.infoSegment}
            onPress={() => setGuestModalVisible(true)}
          >
            <View style={styles.infoIconRow}>
              <Ionicons
                name="people-outline"
                size={13}
                color={COLORS.grayText}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.label}>GUESTS</Text>
            </View>
            <Text style={styles.greenText}>
              {guestData.rooms} R · {guestData.adults + guestData.children} G
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.white}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.searchBtnText}>Search Hotels</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        themeVariant="dark"
        onConfirm={(date) => {
          setDatePickerVisible(false);
          setCheckin(date);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />

      <GuestPickerModal
        visible={guestModalVisible}
        {...guestData}
        onClose={() => setGuestModalVisible(false)}
        onApply={(r, a, c) => {
          setGuestData({ rooms: r, adults: a, children: c });
          setGuestModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop:
      Platform.OS === "android" && STATUS_BAR_HEIGHT
        ? STATUS_BAR_HEIGHT + 10
        : 50,
    paddingBottom: 20,
    borderBottomColor: "black",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "black",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.green,
    fontWeight: "600",
    marginTop: 2,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 13,
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    fontWeight: "500",
  },
  quickInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
    marginTop: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoSegment: { flex: 1 },
  infoIconRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  label: {
    fontSize: 10,
    color: COLORS.grayText,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  greenText: { color: COLORS.green, fontSize: 14, fontWeight: "700" },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  buttonContainer: { padding: 16, marginTop: 10 },
  searchBtn: {
    backgroundColor: COLORS.green,
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBtnText: { color: COLORS.white, fontSize: 17, fontWeight: "700" },
});

const gStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  sheet: { backgroundColor: COLORS.white, borderRadius: 28, padding: 24 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  label: { fontSize: 16, fontWeight: "600", color: COLORS.black },
  counterRow: { flexDirection: "row", alignItems: "center" },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { borderColor: COLORS.border, opacity: 0.5 },
  value: {
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 15,
    color: COLORS.black,
  },
  apply: {
    backgroundColor: COLORS.green,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  applyText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
