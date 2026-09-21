import { BookingsApiResponse } from "@/types/booking";
import api from "./api";

/**
 * Fetch all bookings made by the currently logged-in user.
 * GET /api/user/bookings
 * Auth: Bearer Token
 */
export const getUserBookings = async (authToken?: string): Promise<BookingsApiResponse> => {
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
  const response = await api.get<BookingsApiResponse>("/api/user/bookings", {
    headers,
  });
  return response.data;
};
