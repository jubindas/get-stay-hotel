import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor to attach token automatically if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token for request:", error);
    }

    // Debug logging for booking requests
    if (config.url?.includes("booking")) {
      const fullUrl = `${config.baseURL || ""}${config.url}`;
      console.log(`📡 [API REQUEST] ${config.method?.toUpperCase()} ${fullUrl}`, {
        hasToken: !!config.headers?.Authorization,
        params: config.params,
        body: config.data ? (typeof config.data === "string" ? config.data : "[Object]") : undefined,
      });
    }

    return config;
  },
  (error) => {
    if (error?.config?.url?.includes("booking")) {
      console.error("🔴 [API REQUEST ERROR] Failed to dispatch booking request:", error);
    }
    return Promise.reject(error);
  }
);

// Interceptor to log responses and errors for booking calls
api.interceptors.response.use(
  (response) => {
    if (response.config?.url?.includes("booking")) {
      const fullUrl = `${response.config.baseURL || ""}${response.config.url}`;
      console.log(`📥 [API RESPONSE] ${response.status} ${response.config.method?.toUpperCase()} ${fullUrl}`, {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
      });
    }
    return response;
  },
  (error) => {
    if (error?.config?.url?.includes("booking")) {
      const fullUrl = `${error.config.baseURL || ""}${error.config.url}`;
      console.log(`🔴 [API RESPONSE ERROR] ${error.response?.status ?? "NETWORK_ERROR"} ${error?.config?.method?.toUpperCase()} ${fullUrl}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
