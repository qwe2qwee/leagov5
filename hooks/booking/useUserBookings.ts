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
  approved_by_user?: any;
  total_count?: number;
}

export interface BookingFilters {
  status?: BookingStatus[];
  sortBy?: "created_at" | "start_date";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
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
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ✅ استخدام الدالة بدلاً من query معقد
      const { data: result, error: rpcError } = await supabase.rpc(
        "get_user_bookings",
        {
          p_user_id: null, // null = المستخدم الحالي
          p_status: filters?.status || null,
          p_sort_by: filters?.sortBy || "created_at",
          p_sort_order: filters?.sortOrder || "desc",
          p_limit: filters?.limit || 100,
          p_offset: filters?.offset || 0,
        }
      );

      if (rpcError) throw rpcError;

      // استخراج total_count من أول سطر
      const bookings = result as Booking[];
      if (bookings && bookings.length > 0) {
        setTotalCount(bookings[0].total_count || 0);
      }

      setData(bookings);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters?.status,
    filters?.sortBy,
    filters?.sortOrder,
    filters?.limit,
    filters?.offset,
  ]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchBookings,
    totalCount,
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

      // ✅ استخدام الدالة بدلاً من query معقد
      const { data: result, error: rpcError } = await supabase.rpc(
        "get_booking_full_details",
        {
          p_booking_id: bookingId,
        }
      );

      if (rpcError) throw rpcError;

      // الدالة ترجع array، نأخذ أول عنصر
      const booking = Array.isArray(result) ? result[0] : result;

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
  enabled?: boolean;
}

interface AvailabilityDetails {
  isAvailable: boolean;
  totalQuantity: number;
  availableQuantity: number;
  actualAvailable: number;
  conflictingBookings: number;
  carStatus: string;
  message: string;
}

export function useCarAvailability({
  carId,
  startDate,
  endDate,
  enabled = true,
}: UseCarAvailabilityParams) {
  const [data, setData] = useState<AvailabilityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkAvailability = useCallback(async () => {
    if (!carId || !startDate || !endDate) {
      setError(new Error("معلومات غير كاملة"));
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // ✅ استخدام الدالة المحسّنة
      const { data: result, error: rpcError } = await supabase.rpc(
        "check_car_availability_detailed",
        {
          p_car_id: carId,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

      if (rpcError) throw rpcError;

      const details = Array.isArray(result) ? result[0] : result;
      setData(details as AvailabilityDetails);

      return details as AvailabilityDetails;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ";
      setError(new Error(errorMessage));
      return null;
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
    data,
    isAvailable: data?.isAvailable ?? null,
    isLoading,
    error,
    checkAvailability,
  };
}
// ============================================
// 6. usePayment (جديد - مطلوب للدفع)
// ============================================
export interface PaymentResult {
  success: boolean;
  status: "paid" | "initiated" | "failed" | "authorized" | "refunded";
  paymentId?: string;
  transactionUrl?: string;
  message?: string;
  bookingStatus?: string;
}

// ============================================
// usePayment Hook
// ============================================
export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // Generate UUID
  // ============================================
  const generateUUID = useCallback(() => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  // ============================================
  // Create Payment
  // ============================================
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
      try {
        setIsLoading(true);
        setError(null);

        // ✅ التحقق من الجلسة
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("يجب تسجيل الدخول");
        }

        console.log("💳 Creating payment for booking:", bookingId);

        // ✅ استدعاء Edge Function المحسّن
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
              idempotencyKey: generateUUID(),
            }),
          }
        );

        const result = await response.json();

        console.log("📥 Payment response:", {
          success: result.success,
          status: result.status,
        });

        // ❌ فشل الطلب
        if (!response.ok || !result.success) {
          throw new Error(result.error || result.message || "فشل الدفع");
        }

        // ✅ نجاح فوري
        if (result.status === "paid") {
          console.log("✅ Payment completed immediately");
          callbacks?.onSuccess?.(result);
          return result;
        }

        // 🔐 3DS مطلوب
        if (result.status === "initiated" && result.transactionUrl) {
          console.log("🔐 3DS authentication required");
          callbacks?.on3DSRequired?.(result.transactionUrl);
          return result;
        }

        // ❌ فشل
        if (result.status === "failed") {
          console.log("❌ Payment failed:", result.message);
          throw new Error(result.message || "فشل الدفع");
        }

        return result;
      } catch (err) {
        const error = err as Error;
        console.error("❌ createPayment error:", error.message);
        setError(error);
        callbacks?.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [generateUUID]
  );

  // ============================================
  // Check Payment Status
  // ============================================
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
        // ✅ لا نضع loading هنا لأنه polling
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("يجب تسجيل الدخول");
        }

        // ✅ استدعاء Edge Function المحسّن
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

        // ✅ تحقق من HTTP status
        if (!response.ok) {
          console.error("❌ HTTP Error:", response.status, result);
          throw new Error(
            result.error || result.message || "فشل الاتصال بالسيرفر"
          );
        }

        // ✅ دفع مكتمل
        if (result.success && result.status === "paid") {
          console.log("✅ Payment verified as paid");
          callbacks?.onSuccess?.(result);
          return result;
        }

        // ⏳ لا يزال قيد المعالجة
        if (result.status === "initiated" || result.status === "authorized") {
          console.log("⏳ Payment still processing:", result.status);
          return result;
        }

        // ❌ فشل
        if (result.status === "failed") {
          console.log("❌ Payment failed:", result.message);
          // لا نرمي error في حالة الفشل، فقط نرجع النتيجة
          return result;
        }

        // 💰 استرجاع
        if (result.status === "refunded") {
          console.log("💰 Payment was refunded");
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

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  paymentPending: number;
  active: number;
  completed: number;
  cancelled: number;
  expired: number;
  totalSpent: number;
}

export function useBookingStats() {
  const [data, setData] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ✅ استخدام الدالة بدلاً من حساب يدوي
      const { data: result, error: rpcError } = await supabase.rpc(
        "get_user_booking_stats",
        {
          p_user_id: null, // null = المستخدم الحالي
        }
      );

      if (rpcError) throw rpcError;

      const stats = Array.isArray(result) ? result[0] : result;

      setData({
        total: Number(stats.total) || 0,
        pending: Number(stats.pending) || 0,
        confirmed: Number(stats.confirmed) || 0,
        paymentPending: Number(stats.payment_pending) || 0,
        active: Number(stats.active) || 0,
        completed: Number(stats.completed) || 0,
        cancelled: Number(stats.cancelled) || 0,
        expired: Number(stats.expired) || 0,
        totalSpent: Number(stats.total_spent) || 0,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats,
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
