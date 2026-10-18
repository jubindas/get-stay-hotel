export interface RoomCategory {
  name: string;
}

export interface Room {
  room_category?: RoomCategory;
  name?: string;
  base_price?: number;
}

export interface BookingItem {
  id: string;
  room?: Room;
  number_of_rooms?: number;
  base_price_booked?: number;
  total_room_amount?: number;
  room_tariff?: number;
  total_guest_payment?: number;
}

export interface Property {
  property_name: string;
  address_display?: string;
  city?: string;
  state?: string;
  image_url?: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  grand_total: number;
  amount_paid: number;
  booking_status: string; // 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed' etc.
  payment_status: string; // 'Paid' | 'Unpaid' | 'Partial' | 'Refunded' etc.
  property: Property;
  booking_items: BookingItem[];
  payment_method?: string;
}

export interface BookingsApiResponse {
  data: Booking[];
  message?: string;
  status?: boolean | number;
}
