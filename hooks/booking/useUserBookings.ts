// ============================================
// hooks/useBookings.ts
// React Hooks الأساسية فقط (بدون React Query)
// ============================================

import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

// ============================================
// Types
// ============================================

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "payment_pending"
  | "active"
  | "completed"
  | "cancelled"
  | "expired";

export type RentalType = "daily" | "weekly" | "monthly" | "ownership";

export interface Booking {
  id: string;
  customer_id: string;
  car_id: string;
  branch_id: string;
  rental_type: RentalType;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: BookingStatus;
  payment_reference?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  car?: any;
  branch?: any;
}

export interface BookingFilters {
  status?: BookingStatus[];
  sortBy?: "created_at" | "start_date";
  sortOrder?: "asc" | "desc";
}

export interface BookingCreateData {
  carId: string;
  branchId: string;
  rentalType: RentalType;
  startDate: string;
  endDate: string;
  dailyRate: number;
  discountAmount?: number;
  notes?: string;
}

// ============================================
// 1. useUserBookings
// ============================================

export function useUserBookings(filters?: BookingFilters) {
  const [data, setData] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("غير مسجل الدخول");

      let query = supabase
        .from("bookings")
        .select(
          `
          *,
          car:cars (
            id,
            daily_price,
            weekly_price,
            monthly_price,
            ownership_price,
            seats,
            fuel_type,
            transmission,
            features_ar,
            features_en,
            branch_images,
            model:car_models (
              id,
              name_ar,
              name_en,
              year,
              default_image_url,
              description_ar,
              description_en,
              brand:car_brands (
                id,
                name_ar,
                name_en,
                logo_url
              )
            ),
            color:car_colors (
              id,
              name_ar,
              name_en,
              hex_code
            )
          ),
          branch:branches (
            id,
            name_ar,
            name_en,
            location_ar,
            location_en,
            phone,
            email,
            working_hours,
            latitude,
            longitude
          )
        `
        )
        .eq("customer_id", user.id);

      if (filters?.status?.length) {
        query = query.in("status", filters.status);
      }

      const sortBy = filters?.sortBy || "created_at";
      const sortOrder = filters?.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data: bookings, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setData(bookings as Booking[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.sortBy, filters?.sortOrder]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchBookings,
  };
}

// ============================================
// 2. useBookingDetails
// ============================================

export function useBookingDetails(bookingId: string) {
  const [data, setData] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          car:cars (
            *,
            model:car_models (
              *,
              brand:car_brands (*),
              specifications
            ),
            color:car_colors (*)
          ),
          branch:branches (
            id,
            name_ar,
            name_en,
            location_ar,
            location_en,
            phone,
            email,
            working_hours,
            latitude,
            longitude
          )
        `
        )
        .eq("id", bookingId)
        .single();

      // جلب معلومات المُوافِق إذا كان موجوداً
      if (!fetchError && booking?.approved_by) {
        const { data: approverProfile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("user_id", booking.approved_by)
          .single();

        if (approverProfile) {
          booking.approved_by_user = approverProfile;
        }
      }

      if (fetchError) throw fetchError;
      setData(booking as Booking);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchBooking,
  };
}

// ============================================
// 3. useCreateBooking
// ============================================

export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createBooking = useCallback(
    async (
      bookingData: BookingCreateData,
      callbacks?: {
        onSuccess?: (data: Booking) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("يجب تسجيل الدخول أولاً");

        const { data, error: rpcError } = await supabase.rpc(
          "create_booking_atomic",
          {
            p_customer_id: user.id,
            p_car_id: bookingData.carId,
            p_branch_id: bookingData.branchId,
            p_rental_type: bookingData.rentalType,
            p_start: bookingData.startDate,
            p_end: bookingData.endDate,
            p_daily_rate: bookingData.dailyRate,
            p_discount_amount: bookingData.discountAmount || 0,
            p_initial_status: "pending",
            p_notes: bookingData.notes,
          }
        );

        if (rpcError) throw rpcError;

        callbacks?.onSuccess?.(data as Booking);
        return data as Booking;
      } catch (err) {
        const error = err as Error;
        setError(error);
        callbacks?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createBooking,
    isLoading,
    error,
  };
}

// ============================================
// 4. useCancelBooking
// ============================================

// hooks/useBookings.ts
export function useCancelBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cancelBooking = useCallback(
    async (
      bookingId: string,
      callbacks?: {
        onSuccess?: (data: Booking) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase.rpc(
          "customer_cancel_booking",
          {
            p_booking_id: bookingId,
          }
        );

        if (rpcError) {
          throw rpcError;
        }

        const bookingData = Array.isArray(data) ? data[0] : data;

        callbacks?.onSuccess?.(bookingData as Booking);
        return bookingData as Booking;
      } catch (err) {
        const error = err as Error;
        setError(error);
        callbacks?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    cancelBooking,
    isLoading,
    error,
  };
}
// ============================================
// 5. useConfirmPayment
// ============================================

export function useConfirmPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const confirmPayment = useCallback(
    async (
      params: { bookingId: string; paymentReference: string },
      callbacks?: {
        onSuccess?: (data: Booking) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: updateError } = await supabase
          .from("bookings")
          .update({
            status: "active",
            payment_reference: params.paymentReference,
            expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", params.bookingId)
          .in("status", ["confirmed", "payment_pending"])
          .select()
          .single();

        if (updateError) {
          if (updateError.code === "PGRST116") {
            throw new Error("لا يمكن تأكيد الدفع. تحقق من حالة الحجز");
          }
          throw updateError;
        }

        callbacks?.onSuccess?.(data as Booking);
        return data as Booking;
      } catch (err) {
        const error = err as Error;
        setError(error);
        callbacks?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    confirmPayment,
    isLoading,
    error,
  };
}

// ============================================
// 6. useCheckCarAvailability
// ============================================

export function useCheckCarAvailability(
  carId: string,
  startDate: string,
  endDate: string
) {
  const [data, setData] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!carId || !startDate || !endDate) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data: isAvailable, error: rpcError } = await supabase.rpc(
          "check_car_availability",
          {
            _car_id: carId,
            _start_date: startDate,
            _end_date: endDate,
          }
        );

        if (rpcError) throw rpcError;
        setData(isAvailable as boolean);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [carId, startDate, endDate]);

  return {
    data,
    isLoading,
    error,
  };
}

// ============================================
// 7. useBookingTimer
// ============================================

export function useBookingTimer(expiresAt: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(null);
      setIsExpired(false);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        return;
      }

      setTimeLeft(Math.floor(difference / 1000));
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = useCallback(() => {
    if (timeLeft === null || timeLeft === undefined) return null;

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [timeLeft]);

  return {
    timeLeft,
    formattedTime: formatTime(),
    isExpired,
    hoursLeft: timeLeft ? Math.floor(timeLeft / 3600) : 0,
    minutesLeft: timeLeft ? Math.floor((timeLeft % 3600) / 60) : 0,
  };
}

// ============================================
// 8. useBookingRealtime
// ============================================

export function useBookingRealtime(onUpdate?: () => void) {
  useEffect(() => {
    let channel: any = null;

    const setupRealtime = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        channel = supabase
          .channel("user-bookings-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "bookings",
              filter: `customer_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("Booking update:", payload);
              onUpdate?.();
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Realtime setup error:", error);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [onUpdate]);
}

// ============================================
// 9. useBookingStats
// ============================================

export function useBookingStats() {
  const { data: bookings } = useUserBookings();

  if (!bookings) {
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      expired: 0,
      totalSpent: 0,
    };
  }

  return {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    active: bookings.filter((b) => b.status === "active").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    expired: bookings.filter((b) => b.status === "expired").length,
    totalSpent: bookings.reduce((sum, b) => sum + (b.final_amount || 0), 0),
  };
}

// ============================================
// useInitiatePayment - بدء عملية الدفع
// ============================================
export function useInitiatePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initiatePayment = useCallback(
    async (
      bookingId: string,
      callbacks?: {
        onSuccess?: (data: Booking) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: updateError } = await supabase
          .from("bookings")
          .update({
            status: "payment_pending",
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId)
          .eq("status", "confirmed")
          .select()
          .single();

        if (updateError) throw updateError;

        callbacks?.onSuccess?.(data as Booking);
        return data as Booking;
      } catch (err) {
        const error = err as Error;
        setError(error);
        callbacks?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { initiatePayment, isLoading, error };
}
