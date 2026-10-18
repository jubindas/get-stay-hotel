import LoadingDots from "@/components/ui/LoadingDots";
import Toast, { type ToastType } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { changeUserPassword } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  navy: "#0F1C2E",
  navyMid: "#1A2F4A",
  gold: "#C9A84C",
  goldLight: "#F5EDD6",
  white: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  borderFocus: "#0F1C2E",
  textPrimary: "#0F1C2E",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  green: "#10B981",
  greenBg: "#ECFDF5",
  greenBorder: "#A7F3D0",
  red: "#EF4444",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
};

export default function ChangePasswordScreen() {
  const { user, token, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  }>({
    message: "",
    type: "error",
    visible: false,
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: ToastType = "error") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  const handleUpdatePassword = async () => {
    Keyboard.dismiss();

    if (!currentPassword.trim()) {
      showToast("Please enter your current password.");
      return;
    }
    if (!newPassword.trim()) {
      showToast("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters long.");
      return;
    }
    if (currentPassword === newPassword) {
      showToast("New password cannot be identical to current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match. Please verify.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await changeUserPassword(currentPassword, newPassword, token || undefined);
      showToast(res.message || "Password changed successfully!", "success");
      setIsSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errMsg = err?.message || "Failed to update password. Please check your current password.";
      showToast(errMsg, "error");
      if (errMsg.toLowerCase().includes("unauthorized") || errMsg.toLowerCase().includes("session")) {
        setTimeout(async () => {
          await logout();
          router.replace("/login");
        }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not logged in
  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.notLoggedInContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={32} color={COLORS.navy} />
          </View>
          <Text style={styles.cardTitle}>Sign In Required</Text>
          <Text style={styles.cardSubtitle}>
            You must be logged into your account to change your password.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { width: "100%", marginTop: 16 }]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.primaryBtnText}>Sign In Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.navy} />
            </TouchableOpacity>

            <Text style={styles.navTitle}>Login & Security</Text>

            <View style={styles.badgePill}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
              <Text style={styles.badgePillText}>Secure</Text>
            </View>
          </View>

          {isSuccess ? (
            /* Success View */
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-done" size={42} color={COLORS.green} />
              </View>
              <Text style={styles.cardTitle}>Password Updated</Text>
              <Text style={styles.cardSubtitle}>
                Your password has been changed successfully. Your account is now secured with your new password.
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { width: "100%", marginTop: 24 }]}
                onPress={() => router.back()}
              >
                <Text style={styles.primaryBtnText}>Back to Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeAgainBtn}
                onPress={() => setIsSuccess(false)}
              >
                <Text style={styles.changeAgainText}>Change Password Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Form View */
            <View>
              {/* Account summary banner */}
              <View style={styles.accountBanner}>
                <View style={styles.accountAvatar}>
                  <Ionicons name="person" size={20} color={COLORS.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountName}>
                    {user?.full_name || "GetStay User"}
                  </Text>
                  <Text style={styles.accountEmail}>{user?.email}</Text>
                </View>
                <Ionicons name="lock-closed" size={16} color={COLORS.gold} />
              </View>

              <Text style={styles.cardTitle}>Change Password</Text>
              <Text style={styles.cardSubtitle}>
                Ensure your account stays secure by using a strong password with at least 6 characters.
              </Text>

              {/* Current Password Field */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>CURRENT PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter current password"
                    placeholderTextColor={COLORS.textMuted}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrent}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrent((p) => !p)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showCurrent ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.forgotInlineBtn}
                  onPress={() => router.push("/forgot-password")}
                >
                  <Text style={styles.forgotInlineText}>
                    Forgot your current password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* New Password Field */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor={COLORS.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew((p) => !p)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showNew ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm New Password Field */}
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>CONFIRM NEW PASSWORD</Text>
                <View
                  style={[
                    styles.inputContainer,
                    confirmPassword &&
                      newPassword !== confirmPassword &&
                      styles.inputContainerError,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Repeat new password"
                    placeholderTextColor={COLORS.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm((p) => !p)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <Text style={styles.validationError}>Passwords do not match</Text>
                )}
              </View>

              {/* Requirements Checklist */}
              <View style={styles.hintsBox}>
                <View style={styles.hintItem}>
                  <Ionicons
                    name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                    size={15}
                    color={newPassword.length >= 6 ? COLORS.green : COLORS.textMuted}
                  />
                  <Text style={styles.hintText}>At least 6 characters long</Text>
                </View>

                <View style={styles.hintItem}>
                  <Ionicons
                    name={
                      newPassword && currentPassword && newPassword !== currentPassword
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={15}
                    color={
                      newPassword && currentPassword && newPassword !== currentPassword
                        ? COLORS.green
                        : COLORS.textMuted
                    }
                  />
                  <Text style={styles.hintText}>Different from current password</Text>
                </View>

                <View style={styles.hintItem}>
                  <Ionicons
                    name={
                      newPassword && confirmPassword && newPassword === confirmPassword
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={15}
                    color={
                      newPassword && confirmPassword && newPassword === confirmPassword
                        ? COLORS.green
                        : COLORS.textMuted
                    }
                  />
                  <Text style={styles.hintText}>Passwords match</Text>
                </View>
              </View>

              {/* Submit CTA */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!currentPassword ||
                    !newPassword ||
                    newPassword.length < 6 ||
                    newPassword !== confirmPassword ||
                    newPassword === currentPassword) &&
                    styles.primaryBtnDisabled,
                ]}
                onPress={handleUpdatePassword}
                disabled={
                  isLoading ||
                  !currentPassword ||
                  !newPassword ||
                  newPassword.length < 6 ||
                  newPassword !== confirmPassword ||
                  newPassword === currentPassword
                }
                activeOpacity={0.88}
              >
                {isLoading ? (
                  <LoadingDots color={COLORS.white} />
                ) : (
                  <View style={styles.btnRow}>
                    <Text style={styles.primaryBtnText}>Update Password</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 0,
  },
  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  badgePillText: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: "800",
  },
  accountBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 12,
  },
  accountAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy,
  },
  accountEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.navy,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 22,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputContainerError: {
    borderColor: COLORS.red,
    backgroundColor: COLORS.redBg,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.navy,
    fontWeight: "600",
  },
  validationError: {
    fontSize: 12,
    color: COLORS.red,
    fontWeight: "600",
    marginTop: 4,
  },
  forgotInlineBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
    paddingVertical: 2,
  },
  forgotInlineText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: "700",
  },
  hintsBox: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hintItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: COLORS.navy,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  successCard: {
    alignItems: "center",
    paddingTop: 30,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.greenBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.greenBorder,
  },
  changeAgainBtn: {
    marginTop: 16,
    paddingVertical: 10,
  },
  changeAgainText: {
    fontSize: 13,
    color: COLORS.navy,
    fontWeight: "700",
  },
  notLoggedInContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
