import { PropertySearchResponse } from "@/types/property";
import api from "./api";

/**
 * Search for active properties by keyword (name, city, state, or ID).
 * GET /api/public/properties/search?q=...
 * Public (No Auth Required)
 */
export const searchProperties = async (
  query?: string
): Promise<PropertySearchResponse> => {
  const params: Record<string, string> = {};
  if (query && query.trim().length > 0) {
    params.q = query.trim();
  }

  const response = await api.get<PropertySearchResponse>(
    "/api/public/properties/search",
    { params }
  );

  console.log("Search properties API response:", JSON.stringify(response.data, null, 2));
  console.log("Searched property IDs:", response.data?.properties?.map(p => p.id));

  return response.data;
};

/**
 * Get all room categories (e.g. Suite, Deluxe Room, Standard Room).
 * GET /api/public/categories/rooms
 * Public (No Auth Required)
 */
export const getRoomCategories = async () => {
  const response = await api.get("/api/public/categories/rooms");
  console.log("Room categories API response:", JSON.stringify(response.data, null, 2));
  return response.data;
};
