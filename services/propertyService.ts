import {
  Property,
  PopularPropertiesResponse,
  PropertyDetailsResponse,
  PropertySearchParams,
  PropertySearchResponse,
  RelatedPropertiesResponse,
  RoomDetailsResponse,
} from "@/types/property";
import api from "./api";

/**
 * 1. Get Popular Properties for Home / Discover screen.
 * GET /api/public/properties/popular
 * Public (No Auth Required)
 */
export const getPopularProperties =
  async (): Promise<PopularPropertiesResponse> => {
    const response = await api.get<PopularPropertiesResponse>(
      "/api/public/properties/popular",
    );
    // console.log(
    //   "Popular properties API response:",
    //   JSON.stringify(response.data, null, 2),
    // );
    return response.data;
  };

/**
 * 2. Search properties with optional filters:
 * q, category_id, check_in (YYYY-MM-DD), check_out (YYYY-MM-DD), guests.
 * GET /api/public/properties/search
 * Public (No Auth Required)
 */
export const searchProperties = async (
  paramsOrQuery?: string | PropertySearchParams,
): Promise<PropertySearchResponse> => {
  const params: Record<string, string | number> = {};

  if (typeof paramsOrQuery === "string") {
    if (paramsOrQuery.trim().length > 0) {
      params.q = paramsOrQuery.trim();
    }
  } else if (paramsOrQuery && typeof paramsOrQuery === "object") {
    if (paramsOrQuery.q && paramsOrQuery.q.trim().length > 0) {
      params.q = paramsOrQuery.q.trim();
    }
    if (
      paramsOrQuery.category_id &&
      paramsOrQuery.category_id.trim().length > 0
    ) {
      params.category_id = paramsOrQuery.category_id.trim();
    }
    if (paramsOrQuery.check_in && paramsOrQuery.check_in.trim().length > 0) {
      params.check_in = paramsOrQuery.check_in.trim();
    }
    if (paramsOrQuery.check_out && paramsOrQuery.check_out.trim().length > 0) {
      params.check_out = paramsOrQuery.check_out.trim();
    }
    if (typeof paramsOrQuery.guests === "number" && paramsOrQuery.guests > 0) {
      params.guests = paramsOrQuery.guests;
    }
  }

  const response = await api.get<PropertySearchResponse>(
    "/api/public/properties/search",
    { params },
  );
  return response.data;
};

/**
 * 3. Get detailed information for a single property by ID.
 * GET /api/public/properties/:id
 * Public (No Auth Required)
 */
export const getPropertyById = async (
  id: string,
): Promise<PropertyDetailsResponse> => {
  try {
    console.log(
      `[getPropertyById] Requesting GET /api/public/properties/${id}`,
    );
    const response = await api.get<PropertyDetailsResponse>(
      `/api/public/properties/${id}`,
    );
    console.log(
      "[getPropertyById] Property details response:",
      JSON.stringify(response.data, null, 2),
    );
    return response.data;
  } catch (error: any) {
    const errorDetails = {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      responseData: error?.response?.data,
      url: `/api/public/properties/${id}`,
    };
    console.error(
      "[getPropertyById] Error fetching property details:",
      JSON.stringify(errorDetails, null, 2),
    );

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to load property details. Please try again later.";

    return {
      error: errorMessage,
      message: errorMessage,
    };
  }
};

/**
 * 4. Get a single room by ID.
 * GET /api/public/rooms/:id
 * Public (No Auth Required)
 */
export const getRoomById = async (id: string): Promise<RoomDetailsResponse> => {
  try {
    console.log(`[getRoomById] Requesting GET /api/public/rooms/${id}`);
    const response = await api.get<RoomDetailsResponse>(
      `/api/public/rooms/${id}`,
    );

    // console.log(
    //   "the data of the rooms are",
    //   JSON.stringify(response.data, null, 2),
    // );
    return response.data;
  } catch (error: any) {
    const errorDetails = {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      responseData: error?.response?.data,
      url: `/api/public/rooms/${id}`,
    };
    console.error(
      "[getRoomById] Error fetching room details:",
      JSON.stringify(errorDetails, null, 2),
    );

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to load room details. Please try again later.";

    return {
      error: errorMessage,
      message: errorMessage,
    };
  }
};

/**
 * 5. Get related properties for a given property ID.
 * GET /api/public/properties/:id/related
 * Public (No Auth Required)
 */
export const getRelatedProperties = async (
  id: string,
): Promise<RelatedPropertiesResponse> => {
  const response = await api.get<RelatedPropertiesResponse>(
    `/api/public/properties/${id}/related`,
  );
  return response.data;
};

/**
 * Get all saved properties for the logged-in user.
 * GET /api/user/profile/saved-properties
 * Auth Required
 */
export const getSavedProperties = async (): Promise<{
  properties: Property[];
  message?: string;
}> => {
  const response = await api.get<{ properties: Property[]; message?: string }>(
    "/api/user/profile/saved-properties",
  );
  return response.data;
};

/**
 * Toggle a property as saved/unsaved for the logged-in user.
 * POST /api/user/profile/saved-properties
 * Auth Required
 */
export const toggleSavedProperty = async (
  propertyId: string,
): Promise<{ saved: boolean; message?: string; [key: string]: any }> => {
  const response = await api.post<{ saved: boolean; message?: string }>(
    "/api/user/profile/saved-properties",
    { property_id: propertyId },
  );

  return response.data;
};

/**
 * Get all room categories (e.g. Suite, Deluxe Room, Standard Room).
 * GET /api/public/categories/rooms
 * Public (No Auth Required)
 */
export const getRoomCategories = async () => {
  const response = await api.get("/api/public/categories/rooms");
  return response.data;
};
