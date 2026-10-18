import LoadingDots from "@/components/ui/LoadingDots";
import Toast, { type ToastType } from "@/components/ui/Toast";
import {
  requestForgotPasswordOtp,
  resetUserPassword,
  verifyPasswordResetOtp,
} from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

type Step = 1 | 2 | 3 | 4; // 1: Email, 2: OTP, 3: New Password, 4: Success

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Resend Countdown
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

  // Animations
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [slideAnim] = useState(() => new Animated.Value(0));

  const otpInputRef = useRef<TextInput>(null);

  const showToast = (message: string, type: ToastType = "error") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  const transitionToStep = (nextStep: Step) => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 15,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(-15);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (nextStep === 2) {
          setTimeout(() => otpInputRef.current?.focus(), 200);
        }
      });
    });
  };

  // Resend OTP countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showToast("Please enter your registered email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showToast("Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await requestForgotPasswordOtp(trimmedEmail);
      showToast(res.message || "OTP sent successfully to your email!", "success");
      setResendTimer(60);
      setCanResend(false);
      setOtp("");
      transitionToStep(2);
    } catch (err: any) {
      showToast(err.message || "Failed to send OTP. Please check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const trimmedOtp = otp.trim();
    if (trimmedOtp.length !== 6) {
      showToast("Please enter the complete 6-digit OTP code.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyPasswordResetOtp(email, trimmedOtp);
      showToast(res.message || "OTP verified! Please set a new password.", "success");
      transitionToStep(3);
    } catch (err: any) {
      showToast(err.message || "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      setIsLoading(true);
      const res = await requestForgotPasswordOtp(email);
      showToast(res.message || "A new 6-digit code has been sent!", "success");
      setResendTimer(60);
      setCanResend(false);
      setOtp("");
    } catch (err: any) {
      showToast(err.message || "Unable to resend OTP right now.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword) {
      showToast("Please enter your new password.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match. Please re-check.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetUserPassword(email, otp, newPassword);
      showToast(res.message || "Password reset successfully!", "success");
      transitionToStep(4);
    } catch (err: any) {
      showToast(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Header Bar */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                if (step === 2) transitionToStep(1);
                else if (step === 3) transitionToStep(2);
                else router.back();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.navy} />
            </TouchableOpacity>

            <View style={styles.logoPill}>
              <Ionicons name="sparkles" size={14} color={COLORS.gold} />
              <Text style={styles.logoPillText}>GetStay Security</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Progress Indicator */}
          {step !== 4 && (
            <View style={styles.stepperContainer}>
              <View style={[styles.stepBar, step >= 1 && styles.stepBarActive]} />
              <View style={[styles.stepBar, step >= 2 && styles.stepBarActive]} />
              <View style={[styles.stepBar, step >= 3 && styles.stepBarActive]} />
            </View>
          )}

          {/* Animated Card Content */}
          <Animated.View
            style={[
              styles.contentCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* ================= STEP 1: EMAIL ================= */}
            {step === 1 && (
              <View>
                <View style={styles.iconCircle}>
                  <Ionicons name="mail-unread-outline" size={32} color={COLORS.navy} />
                </View>
                <Text style={styles.cardTitle}>Forgot Password?</Text>
                <Text style={styles.cardSubtitle}>
                  Don't worry! Enter your registered email address and we will send you a secure 6-digit OTP to reset your password.
                </Text>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>REGISTERED EMAIL</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="you@example.com"
                      placeholderTextColor={COLORS.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, !email.trim() && styles.primaryBtnDisabled]}
                  onPress={handleSendOtp}
                  disabled={isLoading || !email.trim()}
                  activeOpacity={0.88}
                >
                  {isLoading ? (
                    <LoadingDots color={COLORS.white} />
                  ) : (
                    <View style={styles.btnRow}>
                      <Text style={styles.primaryBtnText}>Send OTP Code</Text>
                      <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchAuthBtn}
                  onPress={() => router.replace("/login")}
                >
                  <Text style={styles.switchAuthText}>
                    Remember your password?{" "}
                    <Text style={styles.switchAuthLink}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2: VERIFY OTP ================= */}
            {step === 2 && (
              <View>
                <View style={styles.iconCircle}>
                  <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.gold} />
                </View>
                <Text style={styles.cardTitle}>Verify Code</Text>
                <Text style={styles.cardSubtitle}>
                  Please enter the 6-digit verification code sent to{"\n"}
                  <Text style={styles.emailHighlight}>{email}</Text>
                </Text>

                {/* 6 Digit Visual Boxes */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => otpInputRef.current?.focus()}
                  style={styles.otpBoxesRow}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const digit = otp[index] || "";
                    const isCurrent = index === otp.length;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          digit ? styles.otpBoxFilled : null,
                          isCurrent ? styles.otpBoxFocused : null,
                        ]}
                      >
                        <Text style={styles.otpDigit}>{digit}</Text>
                      </View>
                    );
                  })}
                </TouchableOpacity>

                {/* Hidden Real Input for Native Keyboard & Autofill */}
                <TextInput
                  ref={otpInputRef}
                  style={styles.hiddenInput}
                  value={otp}
                  onChangeText={(val) => {
                    const clean = val.replace(/[^0-9]/g, "").slice(0, 6);
                    setOtp(clean);
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />

                {/* Resend Timer / Button */}
                <View style={styles.resendRow}>
                  {canResend ? (
                    <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
                      <Text style={styles.resendLinkText}>
                        Didn't receive code? <Text style={styles.resendBold}>Resend Code</Text>
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.timerText}>
                      Resend code in <Text style={styles.timerBold}>{resendTimer}s</Text>
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, otp.length !== 6 && styles.primaryBtnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                  activeOpacity={0.88}
                >
                  {isLoading ? (
                    <LoadingDots color={COLORS.white} />
                  ) : (
                    <View style={styles.btnRow}>
                      <Text style={styles.primaryBtnText}>Verify OTP</Text>
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.changeEmailBtn}
                  onPress={() => transitionToStep(1)}
                >
                  <Ionicons name="create-outline" size={15} color={COLORS.navy} />
                  <Text style={styles.changeEmailText}>Change Email Address</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 3: NEW PASSWORD ================= */}
            {step === 3 && (
              <View>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-closed-outline" size={32} color={COLORS.navy} />
                </View>
                <Text style={styles.cardTitle}>Set New Password</Text>
                <Text style={styles.cardSubtitle}>
                  Your identity has been verified. Enter and confirm your new secure password.
                </Text>

                {/* New Password */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="key-outline"
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
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((p) => !p)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
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
                      name="shield-outline"
                      size={20}
                      color={COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Repeat your password"
                      placeholderTextColor={COLORS.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword((p) => !p)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <Text style={styles.validationError}>Passwords do not match</Text>
                  )}
                </View>

                {/* Password tips */}
                <View style={styles.hintsBox}>
                  <View style={styles.hintItem}>
                    <Ionicons
                      name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={newPassword.length >= 6 ? COLORS.green : COLORS.textMuted}
                    />
                    <Text style={styles.hintText}>At least 6 characters</Text>
                  </View>
                  <View style={styles.hintItem}>
                    <Ionicons
                      name={
                        newPassword && confirmPassword && newPassword === confirmPassword
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={14}
                      color={
                        newPassword && confirmPassword && newPassword === confirmPassword
                          ? COLORS.green
                          : COLORS.textMuted
                      }
                    />
                    <Text style={styles.hintText}>Both passwords match</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    (!newPassword || newPassword !== confirmPassword) &&
                      styles.primaryBtnDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                  activeOpacity={0.88}
                >
                  {isLoading ? (
                    <LoadingDots color={COLORS.white} />
                  ) : (
                    <View style={styles.btnRow}>
                      <Text style={styles.primaryBtnText}>Reset Password</Text>
                      <Ionicons name="lock-closed" size={18} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 4: SUCCESS ================= */}
            {step === 4 && (
              <View style={styles.successContainer}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-done" size={42} color={COLORS.green} />
                </View>
                <Text style={styles.cardTitle}>Password Reset!</Text>
                <Text style={styles.cardSubtitle}>
                  Your GetStay account password has been updated successfully. You can now log in with your new credentials.
                </Text>

                <TouchableOpacity
                  style={[styles.primaryBtn, { width: "100%", marginTop: 24 }]}
                  onPress={() => router.replace("/login")}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryBtnText}>Proceed to Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
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
    marginBottom: 16,
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
  logoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  stepBarActive: {
    backgroundColor: COLORS.navy,
  },
  contentCard: {
    backgroundColor: COLORS.white,
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
    marginBottom: 24,
  },
  emailHighlight: {
    fontWeight: "800",
    color: COLORS.navy,
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
  primaryBtn: {
    backgroundColor: COLORS.navy,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
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
  switchAuthBtn: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 10,
  },
  switchAuthText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  switchAuthLink: {
    color: COLORS.navy,
    fontWeight: "800",
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFocused: {
    borderColor: COLORS.navy,
    backgroundColor: COLORS.white,
  },
  otpBoxFilled: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldLight + "30",
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.navy,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  resendRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  timerBold: {
    fontWeight: "800",
    color: COLORS.navy,
  },
  resendLinkText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  resendBold: {
    fontWeight: "800",
    color: COLORS.gold,
  },
  changeEmailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
    paddingVertical: 10,
  },
  changeEmailText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy,
  },
  hintsBox: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    gap: 6,
    marginBottom: 14,
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
  successContainer: {
    alignItems: "center",
    paddingTop: 20,
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
});
