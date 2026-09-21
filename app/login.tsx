import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const C = {
  primary: "#111827",
  white: "#FFFFFF",
  surface: "rgba(255, 255, 255, 0.98)",
  border: "#E5E7EB",
  borderFocus: "#111827",
  inputBg: "#F9FAFB",
  inputBgFocus: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  error: "#EF4444",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  successText: "#15803D",
};

type ToastType = "success" | "error";

function Toast({
  message,
  type,
  visible,
}: {
  message: string;
  type: ToastType;
  visible: boolean;
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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
  }, [visible]);

  const isSuccess = type === "success";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: isSuccess ? C.successBg : C.errorBg,
          borderColor: isSuccess ? C.successBorder : C.errorBorder,
        },
      ]}
    >
      <View
        style={[
          styles.toastDot,
          { backgroundColor: isSuccess ? C.successText : C.error },
        ]}
      />
      <Text
        style={[
          styles.toastText,
          { color: isSuccess ? C.successText : C.error },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

function LoadingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    dots.forEach((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 130),
          Animated.timing(dot, {
            toValue: -5,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.delay(520),
        ]),
      ).start(),
    );
  }, []);
  return (
    <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: C.primary,
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
}

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  }>({
    message: "",
    type: "error",
    visible: false,
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { login } = useAuth()

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const keyboardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        Animated.timing(keyboardAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        Animated.timing(keyboardAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start(() => setKeyboardVisible(false));
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const androidPadding = keyboardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  const brandOpacity = keyboardAnim.interpolate({
    inputRange: [0, 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const identifierAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 45,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateFocus = (anim: Animated.Value, focused: boolean) => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      tension: 80,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const showToast = (message: string, type: ToastType) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, visible: true });
    toastTimer.current = setTimeout(
      () => setToast((p) => ({ ...p, visible: false })),
      type === "success" ? 1500 : 3500,
    );
  };

  const getErrorMessage = (error: any): string => {
    console.log("API Error:", error?.response?.data || error?.message);
    if (error?.response?.data) {
      const d = error.response.data;
      if (typeof d === "string") return d;
      if (typeof d.message === "string") return d.message;
      if (typeof d.error === "string") return d.error;
      if (Array.isArray(d.errors) && d.errors.length > 0) {
        return d.errors[0]?.message || d.errors[0]?.msg || JSON.stringify(d.errors[0]);
      }
      if (typeof d.error === "object" && d.error.message) return d.error.message;
      
      // Fallback for unknown object structure
      if (typeof d === "object") {
        const firstValue = Object.values(d)[0];
        if (typeof firstValue === "string") return firstValue;
      }
    }
    if (error?.message === "Network Error") return "No internet connection.";
    if (error?.code === "ECONNABORTED") return "Request timed out. Try again.";
    return "Something went wrong. Please try again.";
  };

  const handleLogin = async () => {
    if (!identifier || !password) return;
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
    setIsLoading(true);
    // Placeholder login logic matching previous
    const loginData: any = { password };
    if (identifier.includes("@")) {
      loginData.email = identifier;
    } else {
      loginData.phone = identifier;
    }
    console.log(loginData);
    try {
      const res = await login(loginData.email, loginData.password);
      console.log("the response is", res);
      showToast("Login successful!", "success");
      setTimeout(() => router.replace("/(tabs)"), 1500);
    } catch (e: any) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const identifierBorderColor = identifierAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.borderFocus],
  });
  const identifierBgColor = identifierAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.inputBg, C.inputBgFocus],
  });
  const identifierLabelColor = identifierAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.textSecondary, C.textPrimary],
  });

  const passwordBorderColor = passwordAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.borderFocus],
  });
  const passwordBgColor = passwordAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.inputBg, C.inputBgFocus],
  });
  const passwordLabelColor = passwordAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.textSecondary, C.textPrimary],
  });

  return (
    <ImageBackground
      source={{ uri: "https://i.pinimg.com/736x/0c/2f/b1/0c2fb1e4f17ce9378aa6d6b5ee30a4f4.jpg" }}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.overlay} />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.brandContainer, {
            opacity: brandOpacity,
            height: keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }),
            marginTop: keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [Platform.OS === "android" ? 40 : 50, 0] }),
            marginBottom: keyboardAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
            overflow: 'hidden'
          }]}>
            <Text style={styles.brandTitle}>GetStay</Text>
            <Text style={styles.brandSub}>Premium Hotel Booking</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              { opacity: fadeIn, transform: [{ translateY: slideUp }] },
            ]}
          >
            <Text style={styles.sheetTitle}>Welcome Back</Text>
            <Text style={styles.sheetSubtitle}>
              Sign in to your account
            </Text>

            {/* Email / Phone */}
            <View style={styles.fieldWrapper}>
              <Animated.Text style={[styles.fieldLabel, { color: identifierLabelColor }]}>
                EMAIL OR PHONE
              </Animated.Text>
              <Animated.View
                style={[
                  styles.inputRow,
                  { borderColor: identifierBorderColor, backgroundColor: identifierBgColor },
                ]}
              >
                <Ionicons
                  name={identifier.includes("@") ? "mail" : "call"}
                  size={20}
                  color={C.textSecondary}
                  style={styles.inputEmoji}
                />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={C.textMuted}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => animateFocus(identifierAnim, true)}
                  onBlur={() => animateFocus(identifierAnim, false)}
                />
              </Animated.View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrapper}>
              <Animated.Text style={[styles.fieldLabel, { color: passwordLabelColor }]}>
                PASSWORD
              </Animated.Text>
              <Animated.View
                style={[
                  styles.inputRow,
                  { borderColor: passwordBorderColor, backgroundColor: passwordBgColor },
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={C.textSecondary}
                  style={styles.inputEmoji}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={C.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => animateFocus(passwordAnim, true)}
                  onBlur={() => animateFocus(passwordAnim, false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={C.textSecondary}
                    style={styles.eyeToggle}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* CTA */}
            <Animated.View
              style={{ transform: [{ scale: buttonScale }], marginTop: 12 }}
            >
              <TouchableOpacity
                style={[styles.ctaBtn, (!identifier || !password) && styles.ctaBtnDisabled]}
                onPress={handleLogin}
                activeOpacity={0.88}
                disabled={isLoading || !identifier || !password}
              >
                {isLoading ? (
                  <LoadingDots />
                ) : (
                  <Text style={styles.ctaBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register link */}
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => router.replace("/register")}
              activeOpacity={0.7}
            >
              <Text style={styles.signInText}>
                Don't have an account?{"  "}
                <Text style={styles.signInLink}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
          {Platform.OS === "android" && <Animated.View style={{ height: androidPadding }} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.primary },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  brandContainer: {
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 40 : 50,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: C.white,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    letterSpacing: 0.5,
  },

  /* TOAST */
  toast: {
    position: "absolute",
    top: Platform.OS === "android" ? 40 : 60,
    left: 20,
    right: 20,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  toastDot: { width: 8, height: 8, borderRadius: 4 },
  toastText: { fontSize: 14, fontWeight: "500", flex: 1, lineHeight: 20 },

  scroll: { flexGrow: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
    paddingTop: 24,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginBottom: 16,
  },

  /* FIELDS */
  fieldWrapper: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
  },
  inputEmoji: { marginRight: 10 },
  input: { flex: 1, fontSize: 13, color: C.textPrimary, height: "100%" },
  eyeToggle: { padding: 4 },

  /* CTA */
  ctaBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  ctaBtnDisabled: { opacity: 0.6, shadowOpacity: 0, elevation: 0 },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.white,
    letterSpacing: 0.2,
  },

  /* DIVIDER */
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 13, color: C.textMuted, fontWeight: "500" },

  /* SIGN IN */
  signInBtn: { alignItems: "center" },
  signInText: { fontSize: 13, color: C.textSecondary },
  signInLink: { color: C.primary, fontWeight: "700" },
});
