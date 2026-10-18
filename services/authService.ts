import api from "./api";

export interface ForgotPasswordResponse {
  message: string;
  email?: string;
}

export interface VerifyOtpResponse {
  message: string;
  valid: boolean;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
}

/**
 * Helper to extract user-friendly error message from backend Axios errors
 */
export const extractAuthErrorMessage = (error: any, defaultMessage: string): string => {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      return typeof first === "string" ? first : first.message || JSON.stringify(first);
    }
  }
  if (error?.message) {
    if (error.message.includes("Network Error")) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    return error.message;
  }
  return defaultMessage;
};

/**
 * 1.1 Forgot Password (Send OTP)
 * POST /api/user/auth/forgot-password
 * Sends a 6-digit OTP to the registered user's email.
 */
export const requestForgotPasswordOtp = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  console.log("=================================================");
  console.log("📨 [AuthService.requestForgotPasswordOtp] Requesting OTP for:", email);
  console.log("📍 Endpoint: POST /api/user/auth/forgot-password");
  console.log("=================================================");

  try {
    const response = await api.post<ForgotPasswordResponse>(
      "/api/user/auth/forgot-password",
      { email: email.trim().toLowerCase() },
    );
    console.log("✅ [AuthService.requestForgotPasswordOtp] Success:", response.data);
    return response.data;
  } catch (error: any) {
    const errMsg = extractAuthErrorMessage(error, "Failed to send password reset OTP.");
    console.log(
      `\n==================== 🔴 [AuthService.requestForgotPasswordOtp] FAILED ====================\n` +
      `HTTP Status: ${error?.response?.status ?? "NO_RESPONSE"}\n` +
      `Message: ${errMsg}\n` +
      `Response: ${JSON.stringify(error?.response?.data, null, 2)}\n` +
      `==========================================================================================\n`
    );
    throw new Error(errMsg);
  }
};

/**
 * 1.2 Verify OTP
 * POST /api/user/auth/verify-otp
 * Checks whether the entered 6-digit OTP is correct and unexpired.
 */
export const verifyPasswordResetOtp = async (
  email: string,
  otp: string,
): Promise<VerifyOtpResponse> => {
  console.log("=================================================");
  console.log("🔢 [AuthService.verifyPasswordResetOtp] Verifying OTP for:", email);
  console.log("📍 Endpoint: POST /api/user/auth/verify-otp");
  console.log("=================================================");

  try {
    const response = await api.post<VerifyOtpResponse>(
      "/api/user/auth/verify-otp",
      { email: email.trim().toLowerCase(), otp: otp.trim() },
    );
    console.log("✅ [AuthService.verifyPasswordResetOtp] Success:", response.data);
    return response.data;
  } catch (error: any) {
    const errMsg = extractAuthErrorMessage(error, "Invalid or expired OTP.");
    console.log(
      `\n==================== 🔴 [AuthService.verifyPasswordResetOtp] FAILED ====================\n` +
      `HTTP Status: ${error?.response?.status ?? "NO_RESPONSE"}\n` +
      `Message: ${errMsg}\n` +
      `Response: ${JSON.stringify(error?.response?.data, null, 2)}\n` +
      `========================================================================================\n`
    );
    throw new Error(errMsg);
  }
};

/**
 * 1.3 Reset Password
 * POST /api/user/auth/reset-password
 * Sets the new password and invalidates the OTP.
 */
export const resetUserPassword = async (
  email: string,
  otp: string,
  newPassword: string,
): Promise<ResetPasswordResponse> => {
  console.log("=================================================");
  console.log("🔒 [AuthService.resetUserPassword] Resetting password for:", email);
  console.log("📍 Endpoint: POST /api/user/auth/reset-password");
  console.log("=================================================");

  try {
    const response = await api.post<ResetPasswordResponse>(
      "/api/user/auth/reset-password",
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        new_password: newPassword,
      },
    );
    console.log("✅ [AuthService.resetUserPassword] Success:", response.data);
    return response.data;
  } catch (error: any) {
    const errMsg = extractAuthErrorMessage(error, "Failed to reset password. Please try again.");
    console.log(
      `\n==================== 🔴 [AuthService.resetUserPassword] FAILED ====================\n` +
      `HTTP Status: ${error?.response?.status ?? "NO_RESPONSE"}\n` +
      `Message: ${errMsg}\n` +
      `Response: ${JSON.stringify(error?.response?.data, null, 2)}\n` +
      `==================================================================================\n`
    );
    throw new Error(errMsg);
  }
};

/**
 * 1.4 Change Password (When Already Logged In)
 * POST /api/user/auth/change-password
 * Used inside app settings/profile when user is logged in.
 */
export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string,
  authToken?: string,
): Promise<ChangePasswordResponse> => {
  console.log("=================================================");
  console.log("🔐 [AuthService.changeUserPassword] Changing password");
  console.log("📍 Endpoint: POST /api/user/auth/change-password");
  console.log("🔑 Auth token provided explicitly:", !!authToken);
  console.log("=================================================");

  const headers = authToken
    ? { Authorization: `Bearer ${authToken}` }
    : undefined;

  try {
    const response = await api.post<ChangePasswordResponse>(
      "/api/user/auth/change-password",
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
      { headers },
    );
    console.log("✅ [AuthService.changeUserPassword] Success:", response.data);
    return response.data;
  } catch (error: any) {
    const errMsg = extractAuthErrorMessage(error, "Failed to change password. Please verify current password.");
    console.log(
      `\n==================== 🔴 [AuthService.changeUserPassword] FAILED ====================\n` +
      `HTTP Status: ${error?.response?.status ?? "NO_RESPONSE"}\n` +
      `Message: ${errMsg}\n` +
      `Response: ${JSON.stringify(error?.response?.data, null, 2)}\n` +
      `===================================================================================\n`
    );
    throw new Error(errMsg);
  }
};
