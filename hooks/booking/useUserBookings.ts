// ============================================
// hooks/useBookings.ts
// React Hooks لتطبيق العميل (محدثة ومتوافقة)
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

      if (fetchError) throw fetchError;

      // جلب معلومات المُوافِق إذا كان موجوداً
      if (booking?.approved_by) {
        const { data: approverProfile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("user_id", booking.approved_by)
          .single();

        if (approverProfile) {
          (booking as any).approved_by_user = approverProfile;
        }
      }

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

// ============================================
// 4. useCancelBooking (محدث - إضافة notes)
// ============================================

export function useCancelBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cancelBooking = useCallback(
    async (
      bookingId: string,
      cancellationNotes?: string, // ✅ إضافة parameter
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
            p_cancellation_notes: cancellationNotes || null, // ✅ تمرير النوتس
          }
        );

        if (rpcError) throw rpcError;

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
// 5. useCarAvailability (محدث - أفضل من useCheckCarAvailability)
// ============================================

interface UseCarAvailabilityParams {
  carId: string;
  startDate: string;
  endDate: string;
  enabled?: boolean; // للتحكم في التنفيذ التلقائي
}

export function useCarAvailability({
  carId,
  startDate,
  endDate,
  enabled = true,
}: UseCarAvailabilityParams) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [availabilityDetails, setAvailabilityDetails] = useState<{
    totalQuantity: number;
    availableQuantity: number;
    conflictingBookings: number;
  } | null>(null);

  const checkAvailability = useCallback(async () => {
    if (!carId || !startDate || !endDate) {
      setError(new Error("معلومات غير كاملة"));
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // استخدام الدالة check_car_availability
      const { data: availableData, error: rpcError } = await supabase.rpc(
        "check_car_availability",
        {
          _car_id: carId,
          _start_date: startDate,
          _end_date: endDate,
        }
      );

      if (rpcError) throw rpcError;

      // جلب تفاصيل السيارة
      const { data: carData, error: carError } = await supabase
        .from("cars")
        .select("quantity, available_quantity, status")
        .eq("id", carId)
        .single();

      if (carError) throw carError;

      // حساب الحجوزات المتداخلة
      const { data: conflictingData, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, status")
        .eq("car_id", carId)
        .in("status", ["pending", "confirmed", "payment_pending", "active"])
        .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

      if (bookingsError) throw bookingsError;

      setAvailabilityDetails({
        totalQuantity: carData.quantity,
        availableQuantity: carData.available_quantity,
        conflictingBookings: conflictingData?.length || 0,
      });

      const result = availableData === true && carData.status === "available";
      setIsAvailable(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ";
      setError(new Error(errorMessage));
      setIsAvailable(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [carId, startDate, endDate]);

  useEffect(() => {
    if (enabled && carId && startDate && endDate) {
      checkAvailability();
    }
  }, [enabled, carId, startDate, endDate, checkAvailability]);

  return {
    isAvailable,
    isLoading,
    error,
    checkAvailability,
    availabilityDetails,
  };
}

// ============================================
// 6. usePayment (جديد - مطلوب للدفع)
// ============================================

interface PaymentResult {
  success: boolean;
  status: "paid" | "initiated" | "failed";
  paymentId?: string;
  transactionUrl?: string;
  message?: string;
  bookingStatus?: string;
}

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPayment = useCallback(
    async (
      bookingId: string,
      token: string,
      callbacks?: {
        onSuccess?: (result: PaymentResult) => void;
        onError?: (error: Error) => void;
        on3DSRequired?: (transactionUrl: string) => void;
      }
    ): Promise<PaymentResult | null> => {
      function randomUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0; // رقم عشوائي من 0 إلى 15
          const v = c === "x" ? r : (r & 0x3) | 0x8; // تطبيق الـ variant
          return v.toString(16);
        });
      }

      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("يجب تسجيل الدخول");

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              bookingId,
              token,
              idempotencyKey: randomUUID(),
            }),
          }
        );

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || result.message || "فشل الدفع");
        }

        // حالة نجاح فوري
        if (result.status === "paid") {
          callbacks?.onSuccess?.(result);
          return result;
        }

        // حالة 3DS مطلوب
        if (result.status === "initiated" && result.transactionUrl) {
          callbacks?.on3DSRequired?.(result.transactionUrl);
          return result;
        }

        // حالة فشل
        if (result.status === "failed") {
          throw new Error(result.message || "فشل الدفع");
        }

        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        callbacks?.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const checkPaymentStatus = useCallback(
    async (
      paymentId: string,
      bookingId: string,
      callbacks?: {
        onSuccess?: (result: PaymentResult) => void;
        onError?: (error: Error) => void;
      }
    ): Promise<PaymentResult | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("يجب تسجيل الدخول");

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/check-payment-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ paymentId, bookingId }),
          }
        );

        const result = await response.json();

        // ✅ Log للتشخيص
        console.log("🔍 checkPaymentStatus result:", result);

        // ✅ تحقق من HTTP status أولاً
        if (!response.ok) {
          console.error("❌ HTTP Error:", response.status, result);
          throw new Error(
            result.error || result.message || "فشل الاتصال بالسيرفر"
          );
        }

        // ✅ تعامل مع جميع الحالات
        if (result.success && result.status === "paid") {
          callbacks?.onSuccess?.(result);
          return result;
        }

        // ⏳ حالات وسطية (initiated, authorized, etc.)
        if (result.status === "initiated" || result.status === "authorized") {
          console.log("⏳ Payment still processing:", result.status);
          return result; // ✅ لا ترمي error
        }

        // ❌ حالة فشل مؤكد
        if (result.status === "failed") {
          console.log("❌ Payment failed:", result.message);
          // ✅ ارجع result مع الحالة، لا ترمي error
          return result;
        }

        // ⚠️ حالات أخرى
        console.warn("⚠️ Unknown payment status:", result.status);
        return result;
      } catch (err) {
        const error = err as Error;
        console.error("❌ checkPaymentStatus error:", error.message);
        setError(error);
        callbacks?.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createPayment,
    checkPaymentStatus,
    isLoading,
    error,
  };
}

// ============================================
// 7. useBookingValidation (جديد - مساعد)
// ============================================

interface ValidationRules {
  minDays?: number;
  maxDays?: number;
  minStartDate?: Date;
  maxStartDate?: Date;
}

interface ValidationResult {
  isValid: boolean;
  errors: {
    startDate?: string;
    endDate?: string;
    dates?: string;
    days?: string;
  };
}

export function useBookingValidation(
  startDate: string,
  endDate: string,
  rules?: ValidationRules
): ValidationResult {
  const [result, setResult] = useState<ValidationResult>({
    isValid: false,
    errors: {},
  });

  useEffect(() => {
    const errors: ValidationResult["errors"] = {};

    if (!startDate || !endDate) {
      setResult({ isValid: false, errors: { dates: "يجب تحديد التواريخ" } });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // التحقق من أن التاريخ ليس في الماضي
    if (start < today) {
      errors.startDate = "لا يمكن الحجز في الماضي";
    }

    // التحقق من أن تاريخ النهاية بعد تاريخ البداية
    if (start >= end) {
      errors.endDate = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    }

    // حساب عدد الأيام
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (rules?.minDays && days < rules.minDays) {
      errors.days = `الحد الأدنى للحجز هو ${rules.minDays} يوم`;
    }

    if (rules?.maxDays && days > rules.maxDays) {
      errors.days = `الحد الأقصى للحجز هو ${rules.maxDays} يوم`;
    }

    if (rules?.minStartDate && start < rules.minStartDate) {
      errors.startDate = "تاريخ البداية مبكر جداً";
    }

    if (rules?.maxStartDate && start > rules.maxStartDate) {
      errors.startDate = "تاريخ البداية متأخر جداً";
    }

    setResult({
      isValid: Object.keys(errors).length === 0,
      errors,
    });
  }, [startDate, endDate, rules]);

  return result;
}

// ============================================
// 8. useBookingTimer
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
// 9. useBookingRealtime
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
// 10. useBookingStats
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
// useCreateBooking - مع retry logic
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
      const MAX_RETRIES = 2; // محاولتين إضافيتين
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          setIsLoading(true);
          setError(null);

          if (attempt > 0) {
            console.log(`🔄 Retry attempt ${attempt}/${MAX_RETRIES}`);
            // انتظر قبل إعادة المحاولة (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
          }

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error("يجب تسجيل الدخول أولاً");

          // ============================================
          // 1. التحقق من التوفر (fresh data)
          // ============================================
          console.log(`🔍 Attempt ${attempt + 1}: Checking availability...`);

          const { data: carCheck, error: carError } = await supabase
            .from("cars")
            .select("available_quantity, status, branch_id")
            .eq("id", bookingData.carId)
            .single();

          if (carError) throw new Error("فشل التحقق من السيارة");

          if (!carCheck) {
            throw new Error("السيارة غير موجودة");
          }

          if (carCheck.status !== "available") {
            // خطأ نهائي - لا retry
            const error = new Error(`السيارة غير متاحة (${carCheck.status})`);
            (error as any).noRetry = true;
            throw error;
          }

          if (carCheck.available_quantity <= 0) {
            // قد يكون race condition - جرب مرة أخرى
            throw new Error("لا توجد كمية متاحة");
          }

          // تحقق من branch_id
          if (carCheck.branch_id !== bookingData.branchId) {
            const error = new Error("خطأ في معلومات الفرع");
            (error as any).noRetry = true;
            throw error;
          }

          // تحقق من التداخل
          const { data: isAvailable, error: availError } = await supabase.rpc(
            "check_car_availability",
            {
              _car_id: bookingData.carId,
              _start_date: bookingData.startDate,
              _end_date: bookingData.endDate,
            }
          );

          if (availError) throw new Error("فشل التحقق من التوفر");

          if (!isAvailable) {
            const error = new Error("السيارة محجوزة في هذه الفترة");
            (error as any).noRetry = true;
            throw error;
          }

          console.log(
            `✅ Attempt ${attempt + 1}: Car available, creating booking...`
          );

          // ============================================
          // 2. إنشاء الحجز
          // ============================================
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

          if (rpcError) {
            // تحليل نوع الخطأ
            if (
              rpcError.message?.includes("not available") ||
              rpcError.message?.includes("No availability")
            ) {
              // قد يكون race condition - المحاولة التالية
              throw new Error("تم حجز السيارة للتو من مستخدم آخر");
            }

            if (rpcError.message?.includes("branch mismatch")) {
              const error = new Error("خطأ في معلومات الفرع");
              (error as any).noRetry = true;
              throw error;
            }

            throw rpcError;
          }

          // ✅ نجح الحجز
          console.log(
            `✅ Booking created successfully on attempt ${attempt + 1}`
          );
          callbacks?.onSuccess?.(data as Booking);
          return data as Booking;
        } catch (err) {
          lastError = err as Error;

          // إذا كان خطأ لا يجب retry
          if ((lastError as any).noRetry) {
            console.error(`❌ Non-retryable error:`, lastError.message);
            break;
          }

          // إذا وصلنا لآخر محاولة
          if (attempt === MAX_RETRIES) {
            console.error(`❌ All ${MAX_RETRIES + 1} attempts failed`);
            break;
          }

          // استمر للمحاولة التالية
          console.warn(`⚠️ Attempt ${attempt + 1} failed:`, lastError.message);
        } finally {
          setIsLoading(false);
        }
      }

      // فشلت جميع المحاولات
      const finalError = lastError || new Error("فشل إنشاء الحجز");

      setError(finalError);
      callbacks?.onError?.(finalError);
      throw finalError;
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
// 11. useBookingTimer (محدث - دعم null/undefined)
// ============================================
