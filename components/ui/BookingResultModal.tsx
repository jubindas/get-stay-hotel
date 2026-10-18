import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
};

const BookingResultModal: React.FC<Props> = ({
  visible,
  title,
  message,
  onClose,
  primaryLabel = "OK",
  onPrimary,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnOutline} onPress={onClose}>
              <Text style={styles.btnOutlineText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={onPrimary ?? onClose}
            >
              <Text style={styles.btnPrimaryText}>{primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "86%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 8, color: "#111" },
  message: { fontSize: 14, color: "#444", lineHeight: 20, marginBottom: 16 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  btnPrimary: {
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  btnOutlineText: { color: "#111", fontWeight: "700" },
});

export default BookingResultModal;
