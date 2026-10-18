import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export type ToastType = "success" | "error";

const COLORS = {
  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  successText: "#15803D",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
  error: "#EF4444",
};

export default function Toast({
  message,
  type,
  visible,
}: {
  message: string;
  type: ToastType;
  visible: boolean;
}) {
  const [translateY] = useState(() => new Animated.Value(-100));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  const isSuccess = type === "success";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: isSuccess ? COLORS.successBg : COLORS.errorBg,
          borderColor: isSuccess ? COLORS.successBorder : COLORS.errorBorder,
        },
      ]}
    >
      <View
        style={[
          styles.toastDot,
          { backgroundColor: isSuccess ? COLORS.successText : COLORS.error },
        ]}
      />
      <Text
        style={[
          styles.toastText,
          { color: isSuccess ? COLORS.successText : COLORS.error },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 54,
    left: 20,
    right: 20,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
});
