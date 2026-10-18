import { Ionicons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  NativeModules,
  Platform,
  Image as RNImage,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePickerModal from "react-native-modal-datetime-picker";

import RazorpayCheckout from "react-native-razorpay";

import RazorpayPaymentModal from "@/components/bookings/RazorpayPaymentModal";

import BookingResultModal from "@/components/ui/BookingResultModal";

import { useAuth } from "@/context/AuthContext";

import { cancelUnpaidBooking, createBooking, verifyBookingPayment } from "@/services/bookingService";
import { getPropertyById } from "@/services/propertyService";

export type PaymentMethod =
  | "razorpay"
  | "cash"
  | "upi"
  | "card"
  | "pos"
  | "offline"
  | "counter";

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isOnline: boolean;
  badge?: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "razorpay",
    label: "Razorpay (Online Payment)",
    description: "UPI (Google Pay, PhonePe, Paytm), Cards & NetBanking",
    icon: "shield-checkmark-outline",
    isOnline: true,
    badge: "100% Secure",
  },
];

type WizardStep = 1 | 2 | 3;

const ReviewBookingScreen = () => {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    price?: string;
    image?: string;
    check_in_date?: string;
    check_out_date?: string;
    rooms?: any;
    roomId?: string;
    adults?: string;
    children?: string;
    provides_breakfast?: string;
    property_amenities?: string;
    room_amenities?: string;
  }>();

  const { token, user, isAuthenticated } = useAuth();

  // Wizard active step (1: User Details, 2: Dates & Stay Info, 3: Payment Breakdown)
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Property info
  const propertyName = params.name || "Stay Booking";
  const propertyImage =
    params.image ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300";

  // Rooms info
  const fallbackRooms = [
    {
      room_details_id: "8d4ad1d7-3d52-456d-9fd5-7bbf6d9d4f11",
      number_of_rooms: 1,
      adults: 2,
      children: 0,
      extra_beds: 0,
    },
  ];

  let initialRooms: any[] = [];
  if ((params as any).rooms) {
    try {
      const raw = (params as any).rooms;
      initialRooms = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(initialRooms)) initialRooms = [];
    } catch {
      initialRooms = [];
    }
  }

  const rooms = initialRooms.length ? initialRooms : fallbackRooms;

  // Property info fetched asynchronously
  const [fetchedProperty, setFetchedProperty] = useState<any>(null);

  useEffect(() => {
    if (!params.id) return;
    getPropertyById(params.id)
      .then((res) => {
        if (res?.property) {
          setFetchedProperty(res.property);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch property in review screen:", err);
      });
  }, [params.id]);

  // Target room ID from params or default rooms list
  const targetRoomId = (params as any).roomId || rooms[0]?.room_details_id;

  const matchedRoom = useMemo(() => {
    if (fetchedProperty && Array.isArray(fetchedProperty.room_details)) {
      const found = fetchedProperty.room_details.find(
        (r: any) => String(r.id) === String(targetRoomId),
      );
      if (found) return found;
      if (fetchedProperty.room_details.length > 0) {
        return fetchedProperty.room_details[0];
      }
    }
    if (rooms && rooms[0]) {
      return rooms[0];
    }
    return null;
  }, [fetchedProperty, targetRoomId, rooms]);

  const parsedParamRoomCapacity = useMemo(() => {
    if ((params as any).room_capacity) {
      try {
        const val = (params as any).room_capacity;
        return typeof val === "string" ? JSON.parse(val) : val;
      } catch {
        return null;
      }
    }
    return null;
  }, [params]);

  // Extra beds selection
  const [needsExtraBed, setNeedsExtraBed] = useState(false);
  const [extraBeds, setExtraBeds] = useState(1);

  // Dynamic capacity limits based on API response & room details
  const capacityLimits = useMemo(() => {
    let rc = matchedRoom?.room_capacity;
    if (typeof rc === "string") {
      try {
        rc = JSON.parse(rc);
      } catch {
        rc = null;
      }
    }
    if (!rc) {
      rc = parsedParamRoomCapacity;
    }

    const nr = Number(rooms[0]?.number_of_rooms) || 1;

    // Adults allowed (per room)
    const rawAdults =
      rc?.adults ??
      (matchedRoom as any)?.max_adults ??
      (params as any).max_adults;
    const numAdults =
      rawAdults !== undefined && rawAdults !== null && !isNaN(Number(rawAdults))
        ? Number(rawAdults)
        : null;

    // Children allowed (per room)
    const rawChildren =
      rc?.children ??
      (matchedRoom as any)?.max_children ??
      (params as any).max_children;
    const numChildren =
      rawChildren !== undefined && rawChildren !== null && !isNaN(Number(rawChildren))
        ? Number(rawChildren)
        : null;

    // Total persons / max guests allowed (per room)
    const rawPersons =
      rc?.persons ??
      matchedRoom?.max_guests ??
      matchedRoom?.max_occupancy ??
      (params as any).max_guests ??
      fetchedProperty?.max_guests;
    const numPersons =
      rawPersons !== undefined && rawPersons !== null && !isNaN(Number(rawPersons))
        ? Number(rawPersons)
        : null;

    const maxAdultsPerRoom = numAdults && numAdults > 0 ? numAdults : 15;
    const maxChildrenPerRoom =
      numChildren !== null && numChildren !== undefined && numChildren >= 0
        ? numChildren
        : 10;

    const maxGuestsPerRoom =
      numPersons && numPersons > 0
        ? numPersons
        : numAdults && numChildren !== null && numChildren !== undefined
          ? numAdults + numChildren
          : numAdults || 15;

    const totalMaxGuests = Math.max(1, maxGuestsPerRoom * nr);
    const totalMaxAdults = Math.max(1, Math.min(maxAdultsPerRoom * nr, totalMaxGuests));
    const totalMaxChildren = Math.max(0, Math.min(maxChildrenPerRoom * nr, totalMaxGuests));

    return {
      maxAdultsPerRoom,
      maxChildrenPerRoom,
      maxGuestsPerRoom,
      totalMaxGuests,
      totalMaxAdults,
      totalMaxChildren,
    };
  }, [matchedRoom, parsedParamRoomCapacity, params, rooms, fetchedProperty]);

  const maxGuests = useMemo(() => {
    return capacityLimits.totalMaxGuests + (needsExtraBed ? extraBeds : 0);
  }, [capacityLimits.totalMaxGuests, needsExtraBed, extraBeds]);

  const incrementExtraBeds = () =>
    setExtraBeds((b) => Math.min(b + 1, 3));
  const decrementExtraBeds = () =>
    setExtraBeds((b) => Math.max(1, b - 1));

  /* -------------------------------------------------------------
   * STEP 1 STATE: MANUAL GUEST DETAILS
   * ------------------------------------------------------------- */
  const [guestName, setGuestName] = useState(user?.full_name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState(
    (user?.phone || (user as any)?.phone_number || "").trim(),
  );
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    guests?: string;
  }>({});
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Sync from logged-in user if loaded asynchronously
  useEffect(() => {
    if (user) {
      if (!guestName && user.full_name) setGuestName(user.full_name);
      if (!guestEmail && user.email) setGuestEmail(user.email);
      const userPh = (user.phone || (user as any)?.phone_number || "").trim();
      if (!guestPhone && userPh) setGuestPhone(userPh);
    }
  }, [user]);

  /* -------------------------------------------------------------
   * STEP 2 STATE: DATES & GUESTS INFORMATION
   * ------------------------------------------------------------- */
  const [checkIn, setCheckIn] = useState<Date | null>(
    params.check_in_date ? new Date(String(params.check_in_date)) : null,
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    params.check_out_date ? new Date(String(params.check_out_date)) : null,
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setCheckIn((prev) => prev ?? new Date());
      setCheckOut((prev) => prev ?? new Date(Date.now() + 24 * 60 * 60 * 1000));
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const [isCheckInPickerVisible, setCheckInPickerVisible] = useState(false);
  const [isCheckOutPickerVisible, setCheckOutPickerVisible] = useState(false);

  const initialAdults = useMemo(() => {
    const fromParam = Number((params as any).adults);
    if (Number.isFinite(fromParam) && fromParam > 0) return fromParam;
    const fromRoom = Number(rooms[0]?.adults);
    if (Number.isFinite(fromRoom) && fromRoom > 0) return fromRoom;
    return 1;
  }, [params, rooms]);

  const initialChildren = useMemo(() => {
    const fromParam = Number((params as any).children);
    if (Number.isFinite(fromParam) && fromParam >= 0) return fromParam;
    const fromRoom = Number(rooms[0]?.children);
    if (Number.isFinite(fromRoom) && fromRoom >= 0) return fromRoom;
    return 0;
  }, [params, rooms]);

  const [adultsCount, setAdultsCount] = useState<number>(initialAdults);
  const [childrenCount, setChildrenCount] = useState<number>(initialChildren);

  // Keep guest counts bounded when API limits load
  useEffect(() => {
    if (capacityLimits.totalMaxGuests > 0) {
      if (adultsCount > capacityLimits.totalMaxAdults) {
        setAdultsCount(Math.max(1, capacityLimits.totalMaxAdults));
      }
      if (childrenCount > capacityLimits.totalMaxChildren) {
        setChildrenCount(Math.max(0, capacityLimits.totalMaxChildren));
      }
      if (adultsCount + childrenCount > capacityLimits.totalMaxGuests) {
        const excess = adultsCount + childrenCount - capacityLimits.totalMaxGuests;
        if (childrenCount >= excess) {
          setChildrenCount(childrenCount - excess);
        } else {
          setChildrenCount(0);
          setAdultsCount(Math.max(1, capacityLimits.totalMaxGuests));
        }
      }
    }
  }, [capacityLimits.totalMaxGuests, capacityLimits.totalMaxAdults, capacityLimits.totalMaxChildren]);

  const guests = adultsCount + childrenCount;

  // Breakfast selection state (default: false)
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);

  const propertyProvidesBreakfast = useMemo(() => {
    if (params.provides_breakfast === "true") return true;
    if (params.provides_breakfast === "false") return false;

    if ((params as any).property_amenities) {
      try {
        const arr = JSON.parse((params as any).property_amenities);
        if (
          Array.isArray(arr) &&
          arr.some(
            (a: string) =>
              typeof a === "string" && a.toLowerCase().includes("breakfast"),
          )
        ) {
          return true;
        }
      } catch { }
    }

    if ((params as any).room_amenities) {
      try {
        const arr = JSON.parse((params as any).room_amenities);
        if (
          Array.isArray(arr) &&
          arr.some(
            (a: string) =>
              typeof a === "string" && a.toLowerCase().includes("breakfast"),
          )
        ) {
          return true;
        }
      } catch { }
    }

    if (fetchedProperty) {
      if (
        fetchedProperty.provides_breakfast ||
        fetchedProperty.has_breakfast ||
        fetchedProperty.breakfast_available ||
        fetchedProperty.breakfast_included
      ) {
        return true;
      }
      if (
        Array.isArray(fetchedProperty.amenities) &&
        fetchedProperty.amenities.some(
          (a: string) =>
            typeof a === "string" && a.toLowerCase().includes("breakfast"),
        )
      ) {
        return true;
      }
      if (Array.isArray(fetchedProperty.room_details)) {
        const matchedRoom = fetchedProperty.room_details.find(
          (r: any) =>
            r.id === ((params as any).roomId || rooms[0]?.room_details_id),
        );
        if (
          matchedRoom?.provides_breakfast ||
          matchedRoom?.has_breakfast ||
          matchedRoom?.breakfast_available ||
          matchedRoom?.breakfast_included ||
          (Array.isArray(matchedRoom?.amenities) &&
            matchedRoom.amenities.some(
              (a: string) =>
                typeof a === "string" && a.toLowerCase().includes("breakfast"),
            ))
        ) {
          return true;
        }
      }
    }

    if (
      rooms.some(
        (r: any) =>
          r.breakfast_included ||
          r.has_breakfast ||
          r.provides_breakfast ||
          (Array.isArray(r.amenities) &&
            r.amenities.some(
              (a: string) =>
                typeof a === "string" && a.toLowerCase().includes("breakfast"),
            )),
      )
    ) {
      return true;
    }

    return false;
  }, [params, fetchedProperty, rooms]);

  // Nights calculation
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }, [checkIn, checkOut]);

  /* -------------------------------------------------------------
   * STEP 3 STATE: PAYMENT & PRICE BREAKDOWN
   * ------------------------------------------------------------- */
  // Host extra bed price if configured, otherwise fallback to static price (₹500 per bed / night)
  const STATIC_EXTRA_BED_PRICE = 500;
  const hostExtraBedPrice = Number(
    (params as any).extra_bed_price || rooms[0]?.extra_bed_price || 0,
  );
  const extraBedPrice =
    hostExtraBedPrice > 0 ? hostExtraBedPrice : STATIC_EXTRA_BED_PRICE;
  const extraBedsTotal = needsExtraBed ? extraBedPrice * extraBeds * nights : 0;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const basePricePerNight = Number(params.price) || 2000;
  const numberOfRooms = rooms[0]?.number_of_rooms ?? 1;
  const roomSubtotal = basePricePerNight * nights * numberOfRooms;
  const roomTariffSubtotal = roomSubtotal + extraBedsTotal;

  // GST on Room: 5% (for <= ₹7,500/day per room), 12% if > ₹7,500/day
  const perDayRate =
    numberOfRooms > 0 && nights > 0
      ? Math.round(roomTariffSubtotal / (numberOfRooms * nights))
      : basePricePerNight;
  const isRoomLowSlab = perDayRate <= 7500;
  const roomGSTRate = isRoomLowSlab ? 0.05 : 0.12;
  const roomGSTPercent = isRoomLowSlab ? 5 : 12;
  const roomGSTAmount = Math.round(roomTariffSubtotal * roomGSTRate);

  // Platform Fee: 10% of Room Tariff
  const platformFeeRate = 0.1;
  const platformFee = Math.round(roomTariffSubtotal * platformFeeRate);

  // GST on Platform Fee: 18% of Platform Fee
  const platformFeeGSTRate = 0.18;
  const platformFeeGST = Math.round(platformFee * platformFeeGSTRate);
  const platformFeeWithGST = platformFee + platformFeeGST;

  // Combined Taxes for reference
  const taxesAmount = roomGSTAmount + platformFeeGST;

  // Total Guest Payment = Room Tariff + GST on Room + Platform Fee with GST
  const grandTotal =
    roomTariffSubtotal + roomGSTAmount + platformFeeWithGST;
  const priceVal = formatCurrency(grandTotal);

  // Advance Payment Mode: FULL vs ADVANCE (40% advance)
  const [paymentPlan, setPaymentPlan] = useState<"FULL" | "ADVANCE">("FULL");
  const ADVANCE_PERCENT = 0.4; // 40% advance
  const advanceAmount = Math.round(grandTotal * ADVANCE_PERCENT);
  const remainingAmount = grandTotal - advanceAmount;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");

  const [isBooking, setIsBooking] = useState(false);

  // Razorpay payment modal state
  const [razorpayModalVisible, setRazorpayModalVisible] = useState(false);
  const [razorpayBookingData, setRazorpayBookingData] = useState<any>(null);

  // Result modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalMessage, setModalMessage] = useState<string | undefined>(undefined);
  const [modalPrimaryLabel, setModalPrimaryLabel] = useState<string>("OK");
  const [modalPrimaryAction, setModalPrimaryAction] = useState<
    (() => void) | undefined
  >(undefined);

  /* -------------------------------------------------------------
   * DATE PICKER HANDLERS
   * ------------------------------------------------------------- */
  const showCheckInPicker = () => setCheckInPickerVisible(true);
  const hideCheckInPicker = () => setCheckInPickerVisible(false);
  const showCheckOutPicker = () => setCheckOutPickerVisible(true);
  const hideCheckOutPicker = () => setCheckOutPickerVisible(false);

  const handleConfirmCheckIn = (date: Date) => {
    setCheckIn(date);
    setAvailabilityError(null);
    if (!checkOut || date >= checkOut) {
      const next = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      setCheckOut(next);
    }
    hideCheckInPicker();
  };

  const handleConfirmCheckOut = (date: Date) => {
    setAvailabilityError(null);
    if (checkIn && date <= checkIn) {
      const next = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      setCheckOut(next);
    } else {
      setCheckOut(date);
    }
    hideCheckOutPicker();
  };

  const incrementAdults = () => {
    if (
      adultsCount < capacityLimits.totalMaxAdults &&
      adultsCount + childrenCount < capacityLimits.totalMaxGuests
    ) {
      setAdultsCount((a) => a + 1);
      if (formErrors.guests) setFormErrors((e) => ({ ...e, guests: undefined }));
    } else {
      setFormErrors((e) => ({
        ...e,
        guests: `Maximum ${capacityLimits.totalMaxGuests} guests allowed (${capacityLimits.totalMaxAdults} adults max).`,
      }));
    }
  };

  const decrementAdults = () => {
    if (adultsCount > 1) {
      setAdultsCount((a) => a - 1);
      if (formErrors.guests) setFormErrors((e) => ({ ...e, guests: undefined }));
    }
  };

  const incrementChildren = () => {
    if (
      childrenCount < capacityLimits.totalMaxChildren &&
      adultsCount + childrenCount < capacityLimits.totalMaxGuests
    ) {
      setChildrenCount((c) => c + 1);
      if (formErrors.guests) setFormErrors((e) => ({ ...e, guests: undefined }));
    } else {
      setFormErrors((e) => ({
        ...e,
        guests: `Maximum ${capacityLimits.totalMaxGuests} guests allowed (${capacityLimits.totalMaxChildren} children max).`,
      }));
    }
  };

  const decrementChildren = () => {
    if (childrenCount > 0) {
      setChildrenCount((c) => c - 1);
      if (formErrors.guests) setFormErrors((e) => ({ ...e, guests: undefined }));
    }
  };

  const incrementGuests = incrementAdults;
  const decrementGuests = decrementAdults;

  const formatDateDisplay = (d: Date | null) => {
    if (!d) return "-";
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* -------------------------------------------------------------
   * VALIDATIONS & STEP NAVIGATION
   * ------------------------------------------------------------- */
  const validateStep1 = () => {
    const errs: { name?: string; email?: string; phone?: string; guests?: string } = {};

    if (!guestName.trim()) {
      errs.name = "Please enter guest's full name";
    } else if (guestName.trim().length < 2) {
      errs.name = "Full name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!guestEmail.trim()) {
      errs.email = "Please enter guest's email address";
    } else if (!emailRegex.test(guestEmail.trim())) {
      errs.email = "Please enter a valid email address";
    }

    const cleanPhone = guestPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      errs.phone = "Please enter a contact phone number";
    } else if (cleanPhone.length < 10) {
      errs.phone = "Phone number must be at least 10 digits";
    }

    // Guest capacity validation based on API response
    const totalGuests = adultsCount + childrenCount;
    if (adultsCount < 1) {
      errs.guests = "At least 1 adult is required for check-in.";
    } else if (adultsCount > capacityLimits.totalMaxAdults) {
      errs.guests = `Maximum ${capacityLimits.totalMaxAdults} ${capacityLimits.totalMaxAdults === 1 ? "adult" : "adults"
        } allowed for this room.`;
    } else if (childrenCount > capacityLimits.totalMaxChildren) {
      errs.guests = `Maximum ${capacityLimits.totalMaxChildren} ${capacityLimits.totalMaxChildren === 1 ? "child" : "children"
        } allowed for this room.`;
    } else if (totalGuests > capacityLimits.totalMaxGuests) {
      errs.guests = `Maximum capacity exceeded: this room allows up to ${capacityLimits.totalMaxGuests} guests.`;
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleNextFromStep2 = () => {
    if (!checkIn || !checkOut) {
      Alert.alert("Dates required", "Please select valid check-in and check-out dates.");
      return;
    }
    setCurrentStep(3);
  };

  /* -------------------------------------------------------------
   * RAZORPAY & BOOKING SUBMISSION
   * ------------------------------------------------------------- */
  const handlePaymentSuccess = (verifiedBooking: any) => {
    setRazorpayModalVisible(false);
    const reference =
      verifiedBooking?.booking_reference ||
      verifiedBooking?.id ||
      razorpayBookingData?.booking_reference ||
      razorpayBookingData?.id ||
      "-";

    setModalTitle("Payment & Booking Confirmed!");
    setModalMessage(
      `Your reservation is confirmed and paid.\n\nBooking Reference: ${reference}\nGuest: ${guestName.trim()}\nStatus: Confirmed / Paid`,
    );
    setModalPrimaryLabel("View Bookings");
    setModalPrimaryAction(() => () => {
      setModalVisible(false);
      router.push("/bookings");
    });
    setModalVisible(true);
  };

  const launchRazorpayCheckout = async (created: any, payload: any) => {
    const orderId = created.payment_gateway_id;
    const bookingId = created.id;
    const amountToCharge = (created.payment_type === "ADVANCE" && created.advance_payment > 0)
      ? created.advance_payment
      : (payload.advance_payment > 0 ? payload.advance_payment : (created.grand_total || grandTotal));

    const amountInPaise = Math.round(Number(amountToCharge) * 100);

    const razorpayKey =
      created?.razorpay_key_id ||
      process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_TosDsYNmVRvaSg";

    setRazorpayBookingData({
      id: bookingId,
      booking_reference: created.booking_reference,
      payment_gateway_id: orderId,
      grand_total: created.grand_total || grandTotal,
      guest_name: payload.guest_name,
      guest_email: payload.guest_email,
      guest_phone: payload.guest_phone,
      property_name: propertyName,
    });

    const isRealRazorpayOrder =
      orderId &&
      typeof orderId === "string" &&
      orderId.startsWith("order_") &&
      !orderId.startsWith("order_dev_");

    const options: any = {
      description: `Payment for ${propertyName || "Stay Booking"}`,
      currency: "INR",
      key: razorpayKey,
      amount: amountInPaise,
      name: "GetStay",
      ...(isRealRazorpayOrder ? { order_id: orderId } : {}),
      prefill: {
        email: payload.guest_email || "",
        contact: payload.guest_phone || "",
        name: payload.guest_name || "",
      },
      theme: { color: "#10b981" },
    };

    let paymentData: any = null;
    try {
      setIsBooking(true);
      console.log("Launching Razorpay checkout:", options);
      paymentData = await RazorpayCheckout.open(options);
      console.log("Razorpay payment succeeded:", paymentData);
    } catch (checkoutErr: any) {
      console.warn("Razorpay checkout cancelled or failed before payment:", checkoutErr);
      // Immediately discard uncompleted booking so it is NEVER saved as Pending
      try {
        await cancelUnpaidBooking(bookingId, token || undefined);
      } catch (cancelErr) {
        console.warn("Failed to discard cancelled booking:", cancelErr);
      }

      const isCancelled =
        checkoutErr?.code === 0 ||
        checkoutErr?.code === 2 ||
        (checkoutErr?.description || "").toLowerCase().includes("cancelled") ||
        (checkoutErr?.description || "").toLowerCase().includes("dismissed");

      Alert.alert(
        isCancelled ? "Payment Cancelled" : "Payment Incomplete",
        isCancelled
          ? "Payment was cancelled. No booking was created."
          : (checkoutErr?.description || checkoutErr?.message || "Payment could not be completed.") +
            "\n\nNo booking was created.",
        [
          {
            text: "Try Again",
            onPress: () => {
              // Allow user to click Pay button again
            },
          },
          {
            text: "Close",
            style: "cancel",
          },
        ],
      );
      return;
    } finally {
      setIsBooking(false);
    }

    // Payment was successful on Razorpay! Verify payment with backend:
    try {
      setIsBooking(true);
      const signatureToVerify =
        paymentData?.razorpay_signature ||
        `sig_${paymentData?.razorpay_payment_id}`;

      const orderIdToVerify =
        paymentData?.razorpay_order_id ||
        orderId ||
        `order_${paymentData?.razorpay_payment_id}`;

      const verifyRes = await verifyBookingPayment(
        bookingId,
        {
          razorpay_order_id: orderIdToVerify,
          razorpay_payment_id: paymentData?.razorpay_payment_id,
          razorpay_signature: signatureToVerify,
        },
        token || undefined,
      );

      handlePaymentSuccess(verifyRes?.data || created);
    } catch (verifyErr: any) {
      console.error("Payment verification failed on server:", verifyErr);
      // DO NOT cancel the booking! Customer was charged!
      Alert.alert(
        "Payment Succeeded",
        `Your payment was successful (Payment ID: ${paymentData?.razorpay_payment_id}), but the server verification encountered an issue.\n\nYour booking reference is #${created?.booking_reference || bookingId.slice(0, 8)}. Please check My Bookings or contact support.`,
        [
          {
            text: "View Bookings",
            onPress: () => router.push("/bookings"),
          },
        ],
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!params.id) {
      Alert.alert("Missing property", "Property information is missing.");
      return;
    }

    if (!isAuthenticated || !token) {
      Alert.alert("Sign in required", "Please sign in to continue.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign in", onPress: () => router.push("/login") },
      ]);
      return;
    }

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    const roomDetailsId = (params as any).roomId || rooms[0]?.room_details_id;
    if (!roomDetailsId) {
      Alert.alert("Room missing", "No room selected for booking.");
      return;
    }

    const roomEntry = rooms[0];
    const number_of_rooms = Number(roomEntry?.number_of_rooms ?? 1);

    const formatDateIso = (d: Date | null) => {
      if (!d) return new Date().toISOString();
      return d.toISOString();
    };

    const isOnlinePayment = paymentMethod === "razorpay";
    const selectedPaymentType = !isOnlinePayment ? "PAY_AT_CHECKIN" : paymentPlan;
    const computedAdvance = selectedPaymentType === "ADVANCE" ? advanceAmount : 0;

    const roomsPayload = (rooms && rooms.length > 0 ? rooms : [{ room_details_id: roomDetailsId }]).map((r: any, idx: number) => ({
      room_details_id: r.room_details_id || roomDetailsId,
      number_of_rooms: Number(r.number_of_rooms ?? 1),
      adults: idx === 0 ? Number(adultsCount) : Number(r.adults ?? 1),
      children: idx === 0 ? Number(childrenCount) : Number(r.children ?? 0),
      extra_beds: needsExtraBed ? Number(extraBeds) : Number(r.extra_beds ?? 0),
    }));

    const payload = {
      property_id: params.id,
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim(),
      check_in_date: formatDateIso(checkIn),
      check_out_date: formatDateIso(checkOut),
      rooms: roomsPayload,
      payment_type: selectedPaymentType,
      advance_payment: computedAdvance,
      payment_method: paymentMethod,
      total_adults: Number(adultsCount),
      total_children: Number(childrenCount),
      has_extra_bed: Boolean(needsExtraBed),
      extra_beds_count: needsExtraBed ? Number(extraBeds) : 0,
      breakfast_included: Boolean(breakfastIncluded),
      tax_included: false,
    };

    console.log("=================================================");
    console.log("🚀 [ReviewBookingScreen] Submitting booking request");
    console.log("👤 Guest Name:", guestName.trim());
    console.log("📅 Check-in:", formatDateIso(checkIn), "-> Check-out:", formatDateIso(checkOut));
    console.log("💳 Payment Method:", paymentMethod, "| Type:", selectedPaymentType);
    console.log("🔑 Auth Token Present:", !!token);
    console.log("📦 Full Booking Payload:", JSON.stringify(payload, null, 2));
    console.log("=================================================");

    try {
      setIsBooking(true);
      const resp = await createBooking(payload as any, token);
      console.log("✅ [ReviewBookingScreen] Booking created response:", JSON.stringify(resp, null, 2));
      const created = resp?.data;
      if (!created) {
        const reason = resp?.message || resp?.data || "Booking failed: No booking data returned from server";
        console.error("❌ [ReviewBookingScreen] Booking creation returned empty data payload:", resp);
        throw new Error(String(reason));
      }

      console.log("🎉 [ReviewBookingScreen] Booking created successfully:", {
        id: created.id,
        reference: created.booking_reference,
        grandTotal: created.grand_total,
        orderId: created.payment_gateway_id,
      });

      if (paymentMethod === "razorpay") {
        await launchRazorpayCheckout(created, payload);
        return;
      }

      // Offline payment methods
      const reference = created.booking_reference || created.id || "-";
      const methodObj = PAYMENT_OPTIONS.find((p) => p.id === paymentMethod);
      setModalTitle("Booking Confirmed!");
      setModalMessage(
        `Booking Reference: ${reference}\nGuest: ${guestName.trim()}\nPayment Method: ${methodObj?.label || paymentMethod}\n\nPlease complete payment of ${priceVal} upon arrival at the property.`,
      );
      setModalPrimaryLabel("View Bookings");
      setModalPrimaryAction(() => () => {
        setModalVisible(false);
        router.push("/bookings");
      });
      setModalVisible(true);
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const requestUrl = err?.config?.baseURL
        ? `${err.config.baseURL}${err.config.url}`
        : err?.config?.url;

      console.log(
        `\n==================== 🔴 BOOKING CREATION FAILED ====================\n` +
        `HTTP Status: ${status ?? "NO_RESPONSE"}\n` +
        `Request URL: ${requestUrl}\n` +
        `Error Message: ${err?.message}\n` +
        `Server Error Data:\n${JSON.stringify(data, null, 2)}\n` +
        `Payload Sent:\n${JSON.stringify(payload, null, 2)}\n` +
        `====================================================================\n`
      );

      const rawServerMsg = (
        (typeof data === "string" ? data : "") ||
        data?.error ||
        data?.message ||
        err?.message ||
        ""
      ).toLowerCase();

      // Check if error is inventory / room availability related
      const isInventoryError =
        rawServerMsg.includes("not enough inventory") ||
        rawServerMsg.includes("inventory") ||
        rawServerMsg.includes("available: 0") ||
        rawServerMsg.includes("available:0") ||
        rawServerMsg.includes("not available in these days") ||
        rawServerMsg.includes("not available on these days") ||
        rawServerMsg.includes("no available room") ||
        rawServerMsg.includes("sold out") ||
        rawServerMsg.includes("fully booked");

      if (isInventoryError) {
        const notAvailableMsg =
          "Room will not be available in these days. Please choose different dates or select another room.";
        setAvailabilityError(notAvailableMsg);
        setModalTitle("Room Not Available");
        setModalMessage(notAvailableMsg);
        setModalPrimaryLabel("Change Dates");
        setModalPrimaryAction(() => () => {
          setModalVisible(false);
          setCurrentStep(2);
        });
        setModalVisible(true);
        return;
      }

      const errMsg =
        data?.message ||
        data?.error ||
        err?.message ||
        "Unable to complete booking. Please try again.";

      let title = "Booking Failed";
      let message = errMsg;

      if (status && status >= 500) {
        title = "Server Error (500)";
        if (
          rawServerMsg.includes("payment gateway") ||
          rawServerMsg.includes("razorpay") ||
          paymentMethod === "razorpay"
        ) {
          message = `${errMsg}\n\nPlease try again or use an alternate UPI/Card option in Razorpay.`;
        }
      } else if (!err.response) {
        title = "Network Connection Error";
        message = "Could not connect to the booking server. Please check your internet connection.";
      }

      setModalTitle(title);
      setModalMessage(message);
      setModalPrimaryLabel("Close");
      setModalPrimaryAction(() => () => setModalVisible(false));
      setModalVisible(true);
    } finally {
      setIsBooking(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <BookingResultModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        primaryLabel={modalPrimaryLabel}
        onPrimary={() => modalPrimaryAction?.()}
        onClose={() => setModalVisible(false)}
      />

      <RazorpayPaymentModal
        visible={razorpayModalVisible}
        booking={razorpayBookingData}
        authToken={token || undefined}
        onClose={() => setRazorpayModalVisible(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (currentStep > 1) {
              setCurrentStep((s) => (s - 1) as WizardStep);
            } else {
              router.back();
            }
          }}
          style={styles.headerBackBtn}
        >
          <Ionicons
            name={currentStep > 1 ? "arrow-back" : "close"}
            size={22}
            color="#0f172a"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Review & Book</Text>

        <View style={styles.headerStepBadge}>
          <Text style={styles.headerStepBadgeText}>Step {currentStep} of 3</Text>
        </View>
      </View>

      {/* 3-Step Wizard Indicator */}
      <View style={styles.wizardContainer}>
        {/* Step 1 */}
        <TouchableOpacity
          style={styles.wizardStep}
          onPress={() => setCurrentStep(1)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.wizardCircle,
              currentStep === 1 && styles.wizardCircleActive,
              currentStep > 1 && styles.wizardCircleCompleted,
            ]}
          >
            {currentStep > 1 ? (
              <Ionicons name="checkmark" size={14} color="#ffffff" />
            ) : (
              <Ionicons
                name="person"
                size={14}
                color={currentStep === 1 ? "#ffffff" : "#94a3b8"}
              />
            )}
          </View>
          <Text
            style={[
              styles.wizardLabel,
              currentStep === 1 && styles.wizardLabelActive,
              currentStep > 1 && styles.wizardLabelCompleted,
            ]}
          >
            Guest Details
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.wizardLine,
            currentStep >= 2 && styles.wizardLineActive,
          ]}
        />

        {/* Step 2 */}
        <TouchableOpacity
          style={styles.wizardStep}
          onPress={() => {
            if (validateStep1()) setCurrentStep(2);
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.wizardCircle,
              currentStep === 2 && styles.wizardCircleActive,
              currentStep > 2 && styles.wizardCircleCompleted,
            ]}
          >
            {currentStep > 2 ? (
              <Ionicons name="checkmark" size={14} color="#ffffff" />
            ) : (
              <Ionicons
                name="calendar"
                size={14}
                color={currentStep === 2 ? "#ffffff" : "#94a3b8"}
              />
            )}
          </View>
          <Text
            style={[
              styles.wizardLabel,
              currentStep === 2 && styles.wizardLabelActive,
              currentStep > 2 && styles.wizardLabelCompleted,
            ]}
          >
            Stay Dates
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.wizardLine,
            currentStep >= 3 && styles.wizardLineActive,
          ]}
        />

        {/* Step 3 */}
        <TouchableOpacity
          style={styles.wizardStep}
          onPress={() => {
            if (validateStep1()) setCurrentStep(3);
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.wizardCircle,
              currentStep === 3 && styles.wizardCircleActive,
            ]}
          >
            <Ionicons
              name="card"
              size={14}
              color={currentStep === 3 ? "#ffffff" : "#94a3b8"}
            />
          </View>
          <Text
            style={[
              styles.wizardLabel,
              currentStep === 3 && styles.wizardLabelActive,
            ]}
          >
            Payment
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Property Header Card (Shown on all steps) */}
          <View style={styles.propertyCard}>
            <RNImage
              source={{ uri: propertyImage }}
              style={styles.propertyImage}
            />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName} numberOfLines={2}>
                {propertyName}
              </Text>
              <View style={styles.verifiedRow}>
                <Ionicons name="shield-checkmark" size={13} color="#10b981" />
                <Text style={styles.verifiedText}>Verified Hotel & Stay</Text>
              </View>
              <Text style={styles.propertyPriceTag}>
                From ₹{basePricePerNight.toLocaleString()}{" "}
                <Text style={styles.perNightText}>/ night</Text>
              </Text>
            </View>
          </View>

          {/* =========================================================
              SECTION 1: MANUAL USER / GUEST DETAILS
             ========================================================= */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Guest Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Please enter the primary guest details for check-in verification.
                </Text>
              </View>

              <View style={styles.formCard}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Full Name <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      formErrors.name && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={formErrors.name ? "#ef4444" : "#64748b"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. John Doe"
                      placeholderTextColor="#94a3b8"
                      value={guestName}
                      onChangeText={(t) => {
                        setGuestName(t);
                        if (formErrors.name) setFormErrors((e) => ({ ...e, name: undefined }));
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  {formErrors.name && (
                    <Text style={styles.errorText}>{formErrors.name}</Text>
                  )}
                </View>

                {/* Email Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Email Address <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      formErrors.email && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={formErrors.email ? "#ef4444" : "#64748b"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. john@example.com"
                      placeholderTextColor="#94a3b8"
                      value={guestEmail}
                      onChangeText={(t) => {
                        setGuestEmail(t);
                        if (formErrors.email) setFormErrors((e) => ({ ...e, email: undefined }));
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {formErrors.email && (
                    <Text style={styles.errorText}>{formErrors.email}</Text>
                  )}
                  <Text style={styles.helperText}>
                    Booking confirmation and voucher will be emailed here.
                  </Text>
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Mobile Number <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      formErrors.phone && styles.inputWrapperError,
                    ]}
                  >
                    <View style={styles.countryCodeBadge}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      style={[styles.textInput, { paddingLeft: 8 }]}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#94a3b8"
                      value={guestPhone}
                      onChangeText={(t) => {
                        setGuestPhone(t);
                        if (formErrors.phone) setFormErrors((e) => ({ ...e, phone: undefined }));
                      }}
                      keyboardType="phone-pad"
                      maxLength={14}
                    />
                  </View>
                  {formErrors.phone && (
                    <Text style={styles.errorText}>{formErrors.phone}</Text>
                  )}
                  <Text style={styles.helperText}>
                    Used for check-in SMS and urgent front-desk updates.
                  </Text>
                </View>

                {/* Guest Occupancy (Adults & Children) */}
                <View style={[styles.inputGroup, { marginTop: 4, marginBottom: 0 }]}>
                  <View style={styles.occupancyHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Guests (Adults & Children)</Text>
                      <Text style={styles.helperText}>
                        Maximum base capacity: {capacityLimits.totalMaxGuests}{" "}
                        {capacityLimits.totalMaxGuests === 1 ? "guest" : "guests"}
                      </Text>
                    </View>
                    <View style={styles.occupancySummaryBadge}>
                      <Ionicons name="people" size={13} color="#047857" />
                      <Text style={styles.occupancySummaryBadgeText}>
                        {adultsCount + childrenCount}{" "}
                        {adultsCount + childrenCount === 1 ? "Guest" : "Guests"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.occupancyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.occupancyTitle}>Adults</Text>
                      <Text style={styles.occupancySubtitle}>
                        Age 13+ years (min: 1
                        {capacityLimits.totalMaxAdults < 15
                          ? `, max: ${capacityLimits.totalMaxAdults}`
                          : ""}
                        )
                      </Text>
                    </View>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          adultsCount <= 1 && styles.stepperBtnDisabled,
                        ]}
                        onPress={decrementAdults}
                        disabled={adultsCount <= 1}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="remove"
                          size={18}
                          color={adultsCount <= 1 ? "#cbd5e1" : "#0f172a"}
                        />
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{adultsCount}</Text>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          (adultsCount >= capacityLimits.totalMaxAdults ||
                            adultsCount + childrenCount >= capacityLimits.totalMaxGuests) &&
                          styles.stepperBtnDisabled,
                        ]}
                        onPress={incrementAdults}
                        disabled={
                          adultsCount >= capacityLimits.totalMaxAdults ||
                          adultsCount + childrenCount >= capacityLimits.totalMaxGuests
                        }
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="add"
                          size={18}
                          color={
                            adultsCount >= capacityLimits.totalMaxAdults ||
                              adultsCount + childrenCount >= capacityLimits.totalMaxGuests
                              ? "#cbd5e1"
                              : "#0f172a"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.occupancyDivider} />

                  <View style={styles.occupancyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.occupancyTitle}>Children</Text>
                      <Text style={styles.occupancySubtitle}>
                        Age 0 - 12 years
                        {capacityLimits.totalMaxChildren < 10
                          ? ` (max: ${capacityLimits.totalMaxChildren})`
                          : ""}
                      </Text>
                    </View>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          childrenCount <= 0 && styles.stepperBtnDisabled,
                        ]}
                        onPress={decrementChildren}
                        disabled={childrenCount <= 0}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="remove"
                          size={18}
                          color={childrenCount <= 0 ? "#cbd5e1" : "#0f172a"}
                        />
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{childrenCount}</Text>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          (childrenCount >= capacityLimits.totalMaxChildren ||
                            adultsCount + childrenCount >= capacityLimits.totalMaxGuests) &&
                          styles.stepperBtnDisabled,
                        ]}
                        onPress={incrementChildren}
                        disabled={
                          childrenCount >= capacityLimits.totalMaxChildren ||
                          adultsCount + childrenCount >= capacityLimits.totalMaxGuests
                        }
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="add"
                          size={18}
                          color={
                            childrenCount >= capacityLimits.totalMaxChildren ||
                              adultsCount + childrenCount >= capacityLimits.totalMaxGuests
                              ? "#cbd5e1"
                              : "#0f172a"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {formErrors.guests && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                        backgroundColor: "#fef2f2",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#fecaca",
                      }}
                    >
                      <Ionicons
                        name="alert-circle"
                        size={15}
                        color="#ef4444"
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.errorText,
                          { marginTop: 0, marginLeft: 0, flex: 1 },
                        ]}
                      >
                        {formErrors.guests}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.infoBadgeBox}>
                <Ionicons name="information-circle-outline" size={18} color="#0284c7" />
                <Text style={styles.infoBadgeText}>
                  Please verify your details carefully. Government-issued photo ID
                  matching the primary guest name will be required upon check-in.
                </Text>
              </View>
            </View>
          )}

          {/* =========================================================
              SECTION 2: DATES, GUESTS & STAY INFORMATION
             ========================================================= */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Stay & Dates Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Confirm your stay duration and room preferences.
                </Text>
              </View>

              {/* Availability Alert Banner */}
              {availabilityError && (
                <View style={styles.availabilityAlertBox}>
                  <Ionicons name="alert-circle" size={22} color="#ef4444" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.availabilityAlertTitle}>Room Not Available</Text>
                    <Text style={styles.availabilityAlertText}>{availabilityError}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setAvailabilityError(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Dates Card */}
              <View style={styles.formCard}>
                <View style={styles.stayDurationBadge}>
                  <Ionicons name="moon-outline" size={14} color="#10b981" />
                  <Text style={styles.stayDurationText}>
                    {nights} {nights === 1 ? "Night" : "Nights"} Stay
                  </Text>
                </View>

                {/* Check In Row */}
                <TouchableOpacity
                  style={styles.dateSelectionCard}
                  onPress={showCheckInPicker}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateIconCircle}>
                    <Ionicons name="log-in-outline" size={18} color="#10b981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateCardLabel}>Check-In Date</Text>
                    <Text style={styles.dateCardValue}>
                      {formatDateDisplay(checkIn)}
                    </Text>
                    <Text style={styles.dateCardSub}>Standard check-in from 12:00 PM</Text>
                  </View>
                  <View style={styles.changeActionBtn}>
                    <Text style={styles.changeActionBtnText}>Change</Text>
                    <Ionicons name="chevron-forward" size={14} color="#10b981" />
                  </View>
                </TouchableOpacity>

                <View style={styles.dateCardDivider} />

                {/* Check Out Row */}
                <TouchableOpacity
                  style={styles.dateSelectionCard}
                  onPress={showCheckOutPicker}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateIconCircle}>
                    <Ionicons name="log-out-outline" size={18} color="#f59e0b" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateCardLabel}>Check-Out Date</Text>
                    <Text style={styles.dateCardValue}>
                      {formatDateDisplay(checkOut)}
                    </Text>
                    <Text style={styles.dateCardSub}>Check-out until 11:00 AM</Text>
                  </View>
                  <View style={styles.changeActionBtn}>
                    <Text style={styles.changeActionBtnText}>Change</Text>
                    <Ionicons name="chevron-forward" size={14} color="#10b981" />
                  </View>
                </TouchableOpacity>
              </View>


              {/* Extra Bed Selection Card */}
              <View style={[styles.formCard, { marginTop: 14 }]}>
                <View style={styles.extraBedHeaderRow}>
                  <View style={styles.extraBedLeftHeader}>
                    <View style={styles.extraBedIconCircle}>
                      <Ionicons name="bed" size={18} color="#10b981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Need Extra Bed?</Text>
                      <Text style={styles.helperText}>
                        Request extra rollaway / mattress for your stay
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={needsExtraBed}
                    onValueChange={setNeedsExtraBed}
                    trackColor={{ false: "#e2e8f0", true: "#a7f3d0" }}
                    thumbColor={needsExtraBed ? "#10b981" : "#ffffff"}
                  />
                </View>

                {needsExtraBed && (
                  <View style={styles.extraBedExpandedSection}>
                    <View style={styles.dateCardDivider} />
                    <View style={styles.guestsControlRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.extraBedCountLabel}>
                          Number of Extra Beds
                        </Text>
                        <Text style={styles.guestsSelectedCount}>
                          {extraBeds} {extraBeds === 1 ? "Extra Bed" : "Extra Beds"}
                        </Text>
                        <Text style={styles.extraBedPriceNote}>
                          +₹{extraBedPrice.toLocaleString("en-IN")} per bed / night
                        </Text>
                        <Text style={styles.helperText}>
                          Max 3 extra beds per room
                        </Text>
                      </View>

                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          style={[
                            styles.stepperBtn,
                            extraBeds <= 1 && styles.stepperBtnDisabled,
                          ]}
                          onPress={decrementExtraBeds}
                          disabled={extraBeds <= 1}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="remove"
                            size={18}
                            color={extraBeds <= 1 ? "#cbd5e1" : "#0f172a"}
                          />
                        </TouchableOpacity>

                        <Text style={styles.stepperValue}>{extraBeds}</Text>

                        <TouchableOpacity
                          style={[
                            styles.stepperBtn,
                            extraBeds >= 3 && styles.stepperBtnDisabled,
                          ]}
                          onPress={incrementExtraBeds}
                          disabled={extraBeds >= 3}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="add"
                            size={18}
                            color={extraBeds >= 3 ? "#cbd5e1" : "#0f172a"}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Breakfast Selection Card (Shown if property provides breakfast) */}
              {propertyProvidesBreakfast && (
                <View style={[styles.formCard, { marginTop: 14 }]}>
                  <View style={styles.extraBedHeaderRow}>
                    <View style={styles.extraBedLeftHeader}>
                      <View style={[styles.extraBedIconCircle, { backgroundColor: "#fef3c7" }]}>
                        <Ionicons name="restaurant" size={18} color="#d97706" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={styles.inputLabel}>Include Breakfast</Text>
                          <View style={styles.breakfastAvailableBadge}>
                            <Text style={styles.breakfastAvailableBadgeText}>Available</Text>
                          </View>
                        </View>
                        <Text style={styles.helperText}>
                          Enjoy freshly prepared morning breakfast for all guests
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={breakfastIncluded}
                      onValueChange={setBreakfastIncluded}
                      trackColor={{ false: "#e2e8f0", true: "#fde68a" }}
                      thumbColor={breakfastIncluded ? "#f59e0b" : "#ffffff"}
                    />
                  </View>

                  {breakfastIncluded && (
                    <View style={styles.breakfastSuccessBox}>
                      <Ionicons name="checkmark-circle" size={15} color="#10b981" />
                      <Text style={styles.breakfastSuccessText}>
                        Breakfast included with your reservation!
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Room Specifications Card */}
              <View style={[styles.formCard, { marginTop: 14 }]}>
                <Text style={styles.inputLabel}>Room Information</Text>

                <View style={styles.roomSpecsRow}>
                  <View style={styles.roomSpecItem}>
                    <Ionicons name="bed-outline" size={16} color="#64748b" />
                    <Text style={styles.roomSpecText}>
                      {numberOfRooms} {numberOfRooms === 1 ? "Room" : "Rooms"}
                    </Text>
                  </View>

                  <View style={styles.roomSpecItem}>
                    <Ionicons name="people-outline" size={16} color="#64748b" />
                    <Text style={styles.roomSpecText}>
                      Up to {maxGuests} Guests
                    </Text>
                  </View>

                  <View style={styles.roomSpecItem}>
                    <Ionicons name="wifi-outline" size={16} color="#64748b" />
                    <Text style={styles.roomSpecText}>Free Wi-Fi</Text>
                  </View>
                </View>

                <View style={styles.roomPoliciesBox}>
                  <View style={styles.policyBullet}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text style={styles.policyBulletText}>
                      Daily housekeeping & fresh linen included
                    </Text>
                  </View>
                  <View style={styles.policyBullet}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text style={styles.policyBulletText}>
                      Air Conditioning & 24/7 Hot Water
                    </Text>
                  </View>
                  {breakfastIncluded && (
                    <View style={styles.policyBullet}>
                      <Ionicons name="restaurant" size={14} color="#10b981" />
                      <Text style={[styles.policyBulletText, { color: "#10b981", fontWeight: "600" }]}>
                        Fresh morning breakfast included for all guests
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* =========================================================
              SECTION 3: PAYMENT & PRICE BREAKDOWN
             ========================================================= */}
          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment & Price Breakdown</Text>
                <Text style={styles.sectionSubtitle}>
                  Review your itemized invoice and select your preferred payment mode.
                </Text>
              </View>

              {/* Availability Alert Banner */}
              {availabilityError && (
                <View style={styles.availabilityAlertBox}>
                  <Ionicons name="alert-circle" size={22} color="#ef4444" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.availabilityAlertTitle}>Room Not Available</Text>
                    <Text style={styles.availabilityAlertText}>{availabilityError}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setCurrentStep(2)}
                    style={styles.changeDatesActionBtn}
                  >
                    <Text style={styles.changeDatesActionBtnText}>Change Dates</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Price Breakdown Card */}
              <View style={styles.priceBreakdownCard}>
                <View style={styles.breakdownHeaderRow}>
                  <Text style={styles.breakdownHeaderTitle}>Price Breakdown</Text>
                  <View style={styles.currencyBadge}>
                    <Text style={styles.currencyBadgeText}>INR (₹)</Text>
                  </View>
                </View>

                {/* Room Tariff */}
                <View style={styles.breakdownRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.breakdownRowLabel}>Room Tariff</Text>
                    <Text style={styles.breakdownRowSub}>
                      Subtotal for stay ({nights} {nights === 1 ? "night" : "nights"} × ₹{basePricePerNight.toLocaleString("en-IN")}{numberOfRooms > 1 ? ` × ${numberOfRooms} rooms` : ""})
                    </Text>
                  </View>
                  <Text style={styles.breakdownRowValue}>
                    {formatCurrency(roomSubtotal)}
                  </Text>
                </View>

                {/* Extra Bed Charges */}
                {needsExtraBed && (
                  <View style={styles.breakdownRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.breakdownRowLabel}>
                        Extra Bed ({extraBeds} {extraBeds === 1 ? "bed" : "beds"})
                      </Text>
                      <Text style={styles.breakdownRowSub}>
                        {`₹${extraBedPrice.toLocaleString("en-IN")} × ${extraBeds} × ${nights} ${nights === 1 ? "night" : "nights"}`}
                      </Text>
                    </View>
                    <Text style={styles.breakdownRowValue}>
                      {formatCurrency(extraBedsTotal)}
                    </Text>
                  </View>
                )}

                {/* GST on Room */}
                <View style={styles.breakdownRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.breakdownRowLabel}>GST on Room</Text>
                    <Text style={styles.breakdownRowSub}>
                      {roomGSTPercent}% (for {isRoomLowSlab ? "≤ ₹7,500/day" : "> ₹7,500/day"})
                    </Text>
                  </View>
                  <Text style={styles.breakdownRowValue}>
                    {formatCurrency(roomGSTAmount)}
                  </Text>
                </View>

                {/* Platform Fee inc. GST */}
                <View style={styles.breakdownRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.breakdownRowLabel}>Platform Fee inc. GST</Text>
                    <Text style={styles.breakdownRowSub}>
                      10% Platform Fee ({formatCurrency(platformFee)}) + 18% GST ({formatCurrency(platformFeeGST)})
                    </Text>
                  </View>
                  <Text style={styles.breakdownRowValue}>
                    {formatCurrency(platformFeeWithGST)}
                  </Text>
                </View>

                <View style={styles.breakdownDivider} />

                {/* Total Guest Payment */}
                <View style={styles.grandTotalRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.grandTotalLabel}>Total Guest Payment</Text>
                    <Text style={styles.grandTotalSub}>Tariff + Taxes + Platform Fees</Text>
                  </View>
                  <Text style={styles.grandTotalAmount}>{priceVal}</Text>
                </View>

                {paymentPlan === "ADVANCE" && (
                  <>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.breakdownRowLabel, { color: "#10b981", fontWeight: "700" }]}>
                          Pay Now (40% Advance)
                        </Text>
                        <Text style={styles.breakdownRowSub}>Online via Razorpay</Text>
                      </View>
                      <Text style={[styles.breakdownRowValue, { color: "#10b981", fontWeight: "800" }]}>
                        {formatCurrency(advanceAmount)}
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.breakdownRowLabel}>Pay at Hotel (After Check-in)</Text>
                        <Text style={styles.breakdownRowSub}>Remaining 60% balance upon arrival</Text>
                      </View>
                      <Text style={styles.breakdownRowValue}>
                        {formatCurrency(remainingAmount)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Guest Summary Pill */}
              <View style={styles.guestSummaryPill}>
                <Ionicons name="person-circle-outline" size={20} color="#0f172a" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.guestSummaryPillName} numberOfLines={1}>
                    Booking for: {guestName || "Guest User"}
                  </Text>
                  <Text style={styles.guestSummaryPillContact}>
                    {guestPhone} · {guestEmail}
                  </Text>
                  <Text style={[styles.guestSummaryPillContact, { marginTop: 2, color: "#10b981", fontWeight: "600" }]}>
                    {adultsCount} {adultsCount === 1 ? "Adult" : "Adults"}
                    {childrenCount > 0 ? `, ${childrenCount} ${childrenCount === 1 ? "Child" : "Children"}` : ""}
                    {breakfastIncluded ? " · Breakfast Included" : ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setCurrentStep(1)}>
                  <Text style={styles.editGuestPillBtn}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Payment Plan Selector */}
              <View style={[styles.formCard, { marginTop: 14 }]}>
                <Text style={styles.inputLabel}>Payment Option</Text>
                <Text style={styles.helperText}>
                  Choose to pay full amount now or a 40% partial advance
                </Text>

                <View style={styles.planSelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.planCard,
                      paymentPlan === "FULL" && styles.planCardSelected,
                    ]}
                    onPress={() => setPaymentPlan("FULL")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.planHeader}>
                      <Text style={[styles.planTitle, paymentPlan === "FULL" && styles.planTitleSelected]}>
                        Pay in Full
                      </Text>
                      <View style={[styles.radioCircle, paymentPlan === "FULL" && styles.radioCircleSelected]}>
                        {paymentPlan === "FULL" && <View style={styles.radioInner} />}
                      </View>
                    </View>
                    <Text style={styles.planAmount}>{priceVal}</Text>
                    <Text style={styles.planSub}>100% paid online</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.planCard,
                      paymentPlan === "ADVANCE" && styles.planCardSelected,
                    ]}
                    onPress={() => setPaymentPlan("ADVANCE")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.planHeader}>
                      <Text style={[styles.planTitle, paymentPlan === "ADVANCE" && styles.planTitleSelected]}>
                        Pay Advance (40%)
                      </Text>
                      <View style={[styles.radioCircle, paymentPlan === "ADVANCE" && styles.radioCircleSelected]}>
                        {paymentPlan === "ADVANCE" && <View style={styles.radioInner} />}
                      </View>
                    </View>
                    <Text style={[styles.planAmount, { color: "#10b981" }]}>
                      {formatCurrency(advanceAmount)}
                    </Text>
                    <Text style={styles.planSub}>
                      {formatCurrency(remainingAmount)} (60%) at check-in
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Payment Method Selector - Only Razorpay */}
              <View style={[styles.formCard, { marginTop: 14 }]}>
                <View style={styles.paymentSectionHeader}>
                  <Text style={styles.inputLabel}>Payment Method</Text>
                  <View style={styles.methodTypeBadge}>
                    <Text style={styles.methodTypeBadgeText}>ONLINE SECURE</Text>
                  </View>
                </View>

                <View style={styles.paymentOptionsList}>
                  <View
                    style={[
                      styles.paymentOptionCard,
                      styles.paymentOptionCardSelected,
                    ]}
                  >
                    <View style={styles.paymentOptionLeft}>
                      <View
                        style={[
                          styles.paymentIconBox,
                          styles.paymentIconBoxSelected,
                        ]}
                      >
                        <Ionicons
                          name="shield-checkmark"
                          size={18}
                          color="#10b981"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.paymentTitleRow}>
                          <Text
                            style={[
                              styles.paymentOptionLabel,
                              styles.paymentOptionLabelSelected,
                            ]}
                          >
                            Razorpay
                          </Text>
                          <View style={styles.popularBadge}>
                            <Text style={styles.popularBadgeText}>
                              100% Secure
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.paymentOptionDesc}>
                          UPI (GPay, PhonePe, Paytm), Credit / Debit Cards & NetBanking
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        styles.radioCircleSelected,
                      ]}
                    >
                      <View style={styles.radioInner} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Cancellation Policy */}
              <View style={styles.policyCard}>
                <Ionicons name="information-circle-outline" size={16} color="#64748b" />
                <Text style={styles.policyCardText}>
                  Cancel at least 24 hours prior to check-in for a full refund.
                  Subject to standard hotel cancellation terms.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.footer}>
        {currentStep === 1 && (
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleNextFromStep1}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionButtonText}>
              Continue to Stay Dates
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        )}

        {currentStep === 2 && (
          <View style={styles.dualButtonsRow}>
            <TouchableOpacity
              style={styles.backSecondaryButton}
              onPress={() => setCurrentStep(1)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={16} color="#0f172a" />
              <Text style={styles.backSecondaryButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionButton, { flex: 1 }]}
              onPress={handleNextFromStep2}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionButtonText}>
                Proceed to Payment
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.dualButtonsRow}>
            <TouchableOpacity
              style={styles.backSecondaryButton}
              onPress={() => setCurrentStep(2)}
              activeOpacity={0.7}
              disabled={isBooking}
            >
              <Ionicons name="arrow-back" size={16} color="#0f172a" />
              <Text style={styles.backSecondaryButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryActionButton,
                { flex: 1, backgroundColor: "#10b981" },
                isBooking && { opacity: 0.75 },
              ]}
              onPress={() => void handleConfirmBooking()}
              disabled={isBooking}
              activeOpacity={0.85}
            >
              {isBooking ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.confirmBtnInner}>
                  <Ionicons
                    name={
                      paymentMethod === "razorpay"
                        ? "shield-checkmark"
                        : "checkmark-circle"
                    }
                    size={18}
                    color="#ffffff"
                  />
                  <Text style={styles.primaryActionButtonText}>
                    {paymentPlan === "ADVANCE"
                      ? `Pay Advance ₹${advanceAmount.toLocaleString("en-IN")}`
                      : `Pay Online ₹${grandTotal.toLocaleString("en-IN")}`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <DatePickers
        isCheckInPickerVisible={isCheckInPickerVisible}
        isCheckOutPickerVisible={isCheckOutPickerVisible}
        onConfirmCheckIn={handleConfirmCheckIn}
        onConfirmCheckOut={handleConfirmCheckOut}
        onCancelCheckIn={hideCheckInPicker}
        onCancelCheckOut={hideCheckOutPicker}
        minCheckoutDate={
          checkIn
            ? new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)
            : undefined
        }
      />
    </SafeAreaView>
  );
};

// Render date pickers helper (used by component and tests)
export const DatePickers = ({
  isCheckInPickerVisible,
  isCheckOutPickerVisible,
  onConfirmCheckIn,
  onConfirmCheckOut,
  onCancelCheckIn,
  onCancelCheckOut,
  minCheckoutDate,
}: any) => (
  <>
    <DateTimePickerModal
      isVisible={isCheckInPickerVisible}
      mode="date"
      onConfirm={onConfirmCheckIn}
      onCancel={onCancelCheckIn}
      minimumDate={new Date()}
    />
    <DateTimePickerModal
      isVisible={isCheckOutPickerVisible}
      mode="date"
      onConfirm={onConfirmCheckOut}
      onCancel={onCancelCheckOut}
      minimumDate={minCheckoutDate || new Date()}
    />
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 10 : 10,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerBackBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerStepBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerStepBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },

  // 3-Step Wizard Indicator
  wizardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  wizardStep: {
    alignItems: "center",
  },
  wizardCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  wizardCircleActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  wizardCircleCompleted: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  wizardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 4,
  },
  wizardLabelActive: {
    color: "#0f172a",
    fontWeight: "700",
  },
  wizardLabelCompleted: {
    color: "#059669",
    fontWeight: "600",
  },
  wizardLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
    marginBottom: 16,
  },
  wizardLineActive: {
    backgroundColor: "#10b981",
  },

  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },

  // Property Card Header
  propertyCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  propertyImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  propertyInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  propertyName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 20,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#10b981",
  },
  propertyPriceTag: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 4,
  },
  perNightText: {
    fontSize: 11,
    fontWeight: "400",
    color: "#64748b",
  },

  // Steps Structure
  stepContainer: {
    marginBottom: 10,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 3,
    lineHeight: 18,
  },

  // Form Card
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },
  requiredStar: {
    color: "#ef4444",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
    padding: 0,
  },
  countryCodeBadge: {
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#cbd5e1",
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  errorText: {
    fontSize: 11.5,
    color: "#ef4444",
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 4,
    marginLeft: 4,
  },
  infoBadgeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  infoBadgeText: {
    flex: 1,
    fontSize: 12,
    color: "#0369a1",
    lineHeight: 17,
    fontWeight: "500",
  },

  // Step 2 Styles
  stayDurationBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 14,
  },
  stayDurationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  dateSelectionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  dateIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dateCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  dateCardValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  dateCardSub: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  changeActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  changeActionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
  },
  dateCardDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 10,
  },

  // Guests Stepper
  guestsControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guestsSelectedCount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    minWidth: 20,
    textAlign: "center",
  },

  // Occupancy styles
  occupancyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  occupancyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  occupancyTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  occupancySubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  occupancyDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 10,
  },
  occupancySummaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  occupancySummaryBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#047857",
  },

  // Breakfast styles
  breakfastAvailableBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  breakfastAvailableBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#047857",
  },
  breakfastSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  breakfastSuccessText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065f46",
  },

  // Extra Bed Card
  extraBedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  extraBedLeftHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  extraBedIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  extraBedExpandedSection: {
    marginTop: 6,
  },
  extraBedCountLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  extraBedPriceNote: {
    fontSize: 11.5,
    color: "#059669",
    fontWeight: "600",
    marginTop: 2,
  },

  // Room Specs
  roomSpecsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
    flexWrap: "wrap",
  },
  roomSpecItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  roomSpecText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  roomPoliciesBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 6,
  },
  policyBullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  policyBulletText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },

  // Step 3: Price Breakdown
  priceBreakdownCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  breakdownHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  breakdownHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  currencyBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currencyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  breakdownRowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  breakdownRowSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  breakdownRowValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "right",
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 10,
  },
  grandTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  grandTotalSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  grandTotalAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#10b981",
  },

  /* Availability Alert Banner */
  availabilityAlertBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#fecaca",
    padding: 14,
    marginBottom: 14,
  },
  availabilityAlertTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#b91c1c",
    marginBottom: 2,
  },
  availabilityAlertText: {
    fontSize: 12,
    color: "#7f1d1d",
    lineHeight: 18,
    fontWeight: "500",
  },
  changeDatesActionBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  changeDatesActionBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },

  guestSummaryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  guestSummaryPillName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  guestSummaryPillContact: {
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 2,
  },
  editGuestPillBtn: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // Payment Options
  paymentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  methodTypeBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  methodTypeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
    letterSpacing: 0.5,
  },
  paymentOptionsList: {
    gap: 8,
  },
  paymentOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
  },
  paymentOptionCardSelected: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  paymentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paymentIconBoxSelected: {
    borderColor: "#a7f3d0",
    backgroundColor: "#ecfdf5",
  },
  paymentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  paymentOptionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  paymentOptionLabelSelected: {
    color: "#065f46",
  },
  popularBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  paymentOptionDesc: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: "#10b981",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },
  moreOptionsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    marginTop: 4,
  },
  moreOptionsToggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
  },

  planSelectorRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  planCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  planCardSelected: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  planTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#334155",
  },
  planTitleSelected: {
    color: "#065f46",
  },
  planAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  planSub: {
    fontSize: 11,
    color: "#64748b",
  },

  policyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  policyCardText: {
    flex: 1,
    fontSize: 11.5,
    color: "#64748b",
    lineHeight: 16,
  },

  // Footer Actions
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  primaryActionButton: {
    backgroundColor: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  dualButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    gap: 6,
  },
  backSecondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  confirmBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default ReviewBookingScreen;
