export interface PropertyCategory {
  id: string;
  category_name?: string;
  name?: string;
  image_url?: string;
  description?: string | null;
}

export interface RoomCategoryDetail {
  id?: string;
  category_name?: string;
  name?: string;
  description?: string | null;
}

export interface PublicRoomCategoryItem {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
}

export interface RoomCapacity {
  adults?: number;
  persons?: number;
  children?: number;
}

export interface BedCategory {
  type?: string;
  count?: number;
}

export interface RoomDetail {
  id: string;
  room_name?: string;
  description?: string | null;
  base_price: number;
  extra_bed_price?: number;
  max_occupancy?: number;
  room_capacity?: RoomCapacity;
  bed_category?: BedCategory[];
  amenities?: string[];
  room_images_url?: string[];
  room_category?: RoomCategoryDetail;
  check_in_time?: string;
  check_out_time?: string;
}

export interface HostInfo {
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface SearchedProperty {
  id: string;
  property_name: string;
  city: string;
  state: string;
  district?: string | null;
  village?: string | null;
  address_display?: string | null;
  pincode?: number | string | null;
  post_office?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  image_url?: string;
  property_images?: string[];
  amenities?: string[];
  category?: PropertyCategory;
  category_id?: string;
  host?: HostInfo;
  host_id?: string;
  room_details?: RoomDetail[];
}

export interface PropertySearchResponse {
  properties: SearchedProperty[];
  message?: string;
}
