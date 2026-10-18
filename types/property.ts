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

export interface RoomUnit {
  id: string;
  room_id?: string;
  unit_number?: string;
  status?: string;
  created_at?: string;
}

export interface RoomDetail {
  id: string;
  room_name?: string;
  description?: string | null;
  base_price: number;
  extra_bed_price?: number;
  extra_bed_type?: string | null;
  extra_bed_capacity?: number | null;
  toilet_type?: string | null;
  room_heating?: string | null;
  max_guests?: number;
  max_occupancy?: number;
  room_capacity?: RoomCapacity;
  bed_category?: BedCategory[];
  amenities?: string[];
  room_images_url?: string[];
  room_category?: RoomCategoryDetail;
  check_in_time?: string;
  check_out_time?: string;
  room_units?: RoomUnit[];
  property?: Partial<Property> | null;
  property_id?: string | null;
  property_name?: string | null;
}

export interface HostInfo {
  full_name?: string;
  email?: string;
  phone?: string;
  image_url?: string;
  created_at?: string;
}

export interface SearchedProperty {
  id: string;
  property_name: string;
  description?: string | null;
  address?: string | null;
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

export type Property = SearchedProperty;

export interface PropertySearchParams {
  q?: string;
  category_id?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
}

export interface PopularPropertiesResponse {
  properties: Property[];
  message?: string;
}

export interface PropertySearchResponse {
  properties: Property[];
  message?: string;
}

export interface PropertyDetailsResponse {
  property?: Property;
  error?: string;
  message?: string;
}

export interface RoomDetailsResponse {
  room?: RoomDetail;
  error?: string;
  message?: string;
}

export interface RelatedPropertiesResponse {
  properties: Property[];
  message?: string;
}
