import { BookingsApiResponse } from "@/types/booking";
import api from "./api";

export interface CreateBookingRoomInput {
  room_details_id: string;
  number_of_rooms: number;
  adults: number;
  children?: number;
  extra_beds?: number;
  assigned_room_unit_ids?: string[];
}

export interface CreateBookingPayload {
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  rooms: CreateBookingRoomInput[];
  total_adults?: number | null;
  total_children?: number | null;
  has_extra_bed?: boolean | null;
  extra_beds_count?: number | null;
  payment_type?: "FULL" | "ADVANCE" | "PAY_AT_CHECKIN" | string;
  breakfast_included?: boolean;
  tax_included?: boolean;
  payment_method?: string;
  advance_payment?: number;
  user_id?: string | null;
}

export interface BookingCreationResponse {
  message?: string;
  data?: {
    id?: string;
    booking_reference?: string;
    payment_gateway_id?: string;
    grand_total?: number;
    [key: string]: any;
  };
  error?: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Create a new booking.
 * POST /api/user/bookings
 * Auth: Bearer Token
 */
export const createBooking = async (
  payload: CreateBookingPayload,
  authToken?: string,
): Promise<BookingCreationResponse> => {
  console.log("=================================================");
  console.log("🚀 [BookingService.createBooking] Initiating booking request");
  console.log("📍 Endpoint: POST /api/user/bookings");
  console.log("🔑 Auth token provided:", !!authToken);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));
  console.log("=================================================");

  const headers = authToken
    ? { Authorization: `Bearer ${authToken}` }
    : undefined;

  try {
    const response = await api.post<BookingCreationResponse>(
      "/api/user/bookings",
      payload,
      { headers },
    );
    console.log("✅ [BookingService.createBooking] Success (HTTP " + response.status + "):", {
      message: response.data?.message,
      bookingId: response.data?.data?.id,
      bookingRef: response.data?.data?.booking_reference,
      gatewayOrderId: response.data?.data?.payment_gateway_id,
      grandTotal: response.data?.data?.grand_total,
    });
    return response.data;
  } catch (error: any) {
    console.log(
      `\n==================== 🔴 [BookingService.createBooking] FAILED ====================\n` +
      `HTTP Status: ${error?.response?.status ?? "NO_RESPONSE"}\n` +
      `URL: ${error?.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error?.config?.url}\n` +
      `Axios Error: ${error?.message}\n` +
      `Server Error Response: ${JSON.stringify(error?.response?.data, null, 2)}\n` +
      `Payload: ${JSON.stringify(payload, null, 2)}\n` +
      `==================================================================================\n`
    );
    throw error;
  }
};

/**
 * Verify Razorpay payment for a booking.
 * POST /api/user/bookings/:id/verify-payment
 * Auth: Bearer Token
 */

/**
 * Cancel or discard an unpaid/incomplete booking so it does not remain pending.
 * POST /api/user/bookings/:id/cancel
 * Auth: Bearer Token
 */
export const cancelUnpaidBooking = async (
  bookingId: string,
  authToken?: string,
): Promise<any> => {
  const headers = authToken
    ? { Authorization: `Bearer ${authToken}` }
    : undefined;

  try {
    const response = await api.post(
      `/api/user/bookings/${bookingId}/cancel`,
      {},
      { headers },
    );
    return response.data;
  } catch (error: any) {
    console.warn("Could not discard unpaid booking:", error?.message);
    return null;
  }
};

export const verifyBookingPayment = async (
  bookingId: string,
  payload: VerifyPaymentPayload,
  authToken?: string,
): Promise<VerifyPaymentResponse> => {
  console.log("=================================================");
  console.log(`🚀 [BookingService.verifyBookingPayment] Verifying payment for booking ${bookingId}`);
  console.log(`📍 Endpoint: POST /api/user/bookings/${bookingId}/verify-payment`);
  console.log("🔑 Auth token provided:", !!authToken);
  console.log("💳 Payment Verification Payload:", JSON.stringify(payload, null, 2));
  console.log("=================================================");

  const headers = authToken
    ? { Authorization: `Bearer ${authToken}` }
    : undefined;

  try {
    const response = await api.post<VerifyPaymentResponse>(
      `/api/user/bookings/${bookingId}/verify-payment`,
      payload,
      { headers },
    );
    console.log("✅ [BookingService.verifyBookingPayment] Success (HTTP " + response.status + "):", response.data);
    return response.data;
  } catch (error: any) {
    console.log(
      `\n==================== 🔴 [BookingService.verifyBookingPayment] FAILED ====================\n` +
      `Booking ID: ${bookingId}\n` +
      `HTTP Status: ${error?.response?.status ?? "NO_RESPONSE"}\n` +
      `URL: ${error?.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error?.config?.url}\n` +
      `Axios Error: ${error?.message}\n` +
      `Server Error Response: ${JSON.stringify(error?.response?.data, null, 2)}\n` +
      `========================================================================================\n`
    );
    throw error;
  }
};

/**
 * Fetch all bookings made by the currently logged-in user.
 * GET /api/user/bookings
 * Auth: Bearer Token
 */
export const getUserBookings = async (
  authToken?: string,
): Promise<BookingsApiResponse> => {
  console.log("=================================================");
  console.log("🚀 [BookingService.getUserBookings] Fetching user bookings");
  console.log("📍 Endpoint: GET /api/user/bookings");
  console.log("🔑 Auth token provided:", !!authToken);
  console.log("=================================================");

  const headers = authToken
    ? { Authorization: `Bearer ${authToken}` }
    : undefined;

  try {
    const response = await api.get<BookingsApiResponse>("/api/user/bookings", {
      headers,
    });
    const count = Array.isArray(response.data?.data)
      ? response.data.data.length
      : Array.isArray(response.data)
      ? (response.data as any).length
      : "unknown";
    console.log(`✅ [BookingService.getUserBookings] Success (HTTP ${response.status}) - ${count} bookings received`);
    return response.data;
  } catch (error: any) {
    console.log(
      `\n==================== 🔴 [BookingService.getUserBookings] FAILED ====================\n` +
      `HTTP Status: ${error?.response?.status ?? "NO_RESPONSE"}\n` +
      `URL: ${error?.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error?.config?.url}\n` +
      `Axios Error: ${error?.message}\n` +
      `Server Error Response: ${JSON.stringify(error?.response?.data, null, 2)}\n` +
      `====================================================================================\n`
    );
    throw error;
  }
};

export interface BookingItemBreakdown {
  id: string;
  room?: {
    room_category?: {
      name?: string;
    };
  };
  room_tariff: number;
  gst_on_room_tariff: number;
  platform_fee: number;
  gst_on_platform_fee: number;
  total_guest_payment: number;
  [key: string]: any;
}

export interface BookingPaymentBreakdown {
  id: string;
  booking_reference: string;
  grand_total: number;
  booking_items: BookingItemBreakdown[];
  [key: string]: any;
}

export interface BookingPaymentBreakdownResponse {
  status?: string;
  message?: string;
  data: BookingPaymentBreakdown;
}

/**
 * Fetch detailed user payment breakdown for a specific booking.
 * GET /api/user/bookings/:id/payment-breakdown
 * Auth: Bearer Token
 */
export const getBookingPaymentBreakdown = async (
  bookingId: string,
  authToken?: string,
): Promise<BookingPaymentBreakdownResponse> => {
  console.log("=================================================");
  console.log(`🚀 [BookingService.getBookingPaymentBreakdown] Fetching breakdown for ${bookingId}`);
  console.log(`📍 Endpoint: GET /api/user/bookings/${bookingId}/payment-breakdown`);
  console.log("🔑 Auth token provided:", !!authToken);
  console.log("=================================================");

  const headers = authToken
    ? { Authorization: `Bearer ${authToken}` }
    : undefined;

  try {
    const response = await api.get<BookingPaymentBreakdownResponse>(
      `/api/user/bookings/${bookingId}/payment-breakdown`,
      { headers },
    );
    console.log("✅ [BookingService.getBookingPaymentBreakdown] Success (HTTP " + response.status + "):", {
      bookingReference: response.data?.data?.booking_reference,
      grandTotal: response.data?.data?.grand_total,
      itemCount: response.data?.data?.booking_items?.length || 0,
    });
    return response.data;
  } catch (error: any) {
    console.log(
      `\n==================== 🔴 [BookingService.getBookingPaymentBreakdown] FAILED ====================\n` +
      `Booking ID: ${bookingId}\n` +
      `HTTP Status: ${error?.response?.status ?? "NO_RESPONSE"}\n` +
      `URL: ${error?.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error?.config?.url}\n` +
      `Axios Error: ${error?.message}\n` +
      `Server Error Response: ${JSON.stringify(error?.response?.data, null, 2)}\n` +
      `==============================================================================================\n`
    );
    throw error;
  }
};


