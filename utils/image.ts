export const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80";

/**
 * Converts relative upload paths (e.g. /uploads/property_images-123.jpeg)
 * into absolute HTTP URLs using EXPO_PUBLIC_API_BASE_URL.
 */
export const getFullImageUrl = (
  path?: string | null,
  fallback: string = DEFAULT_PROPERTY_IMAGE
): string => {
  if (!path || typeof path !== "string" || path.trim().length === 0) {
    return fallback;
  }
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const baseUrl = (
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.29.235:3005"
  ).replace(/\/$/, "");
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseUrl}${cleanPath}`;
};
