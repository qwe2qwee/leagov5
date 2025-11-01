// hooks/booking/useBookingFlow.ts
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

// ============================================
// Types
// ============================================
export interface CarForBooking {
  car_id: string;
  status: string;
  is_available: boolean;
  daily_price: number;
  weekly_price?: number;
  monthly_price?: number;
  discount_percentage: number;
  offer_expires_at?: string;
  is_new: boolean;
  seats: number;
  fuel_type: string;
  transmission: string;
  branch_id: string;
  additional_images?: string[];
  description_ar?: string;
  description_en?: string;
  features_ar?: string[];
  features_en?: string[];
  rental_types: string[];
  brand: {
    name_ar: string;
    name_en: string;
    logo_url?: string;
  };
  model: {
    name_ar: string;
    name_en: string;
    year: number;
    default_image_url?: string;
    description_ar?: string;
    description_en?: string;
  };
  color: {
    name_ar: string;
    name_en: string;
    hex_code?: string;
  };
  branch: {
    id: string;
    name_ar: string;
    name_en: string;
    location_ar?: string;
    location_en?: string;
    phone?: string;
    working_hours?: any;
  };
}

export interface PricePreview {
  base_price: number;
  total_days: number;
  discount_percentage: number;
  discount_amount: number;
  final_price: number;
  price_per_unit: number;
  offer_valid: boolean;
  total_amount: number;
  offer_expires_at?: string;
}

export interface UserEligibility {
  is_eligible: boolean;
  reason_code: string;
  reason_message_ar: string;
  reason_message_en: string;
  user_profile?: {
    full_name: string;
    email: string;
    phone?: string;
    age?: number;
    gender?: string;
  };
  documents_status?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

// ============================================
// 1. useCarForBooking
// ============================================
export function useCarForBooking(carId: string | undefined) {
  const [data, setData] = useState<CarForBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCar = useCallback(async () => {
    if (!carId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("🚗 Fetching car for booking:", carId);

      const { data: carData, error: rpcError } = await supabase.rpc(
        "get_car_for_booking",
        {
          p_car_id: carId,
        }
      );

      if (rpcError) {
        console.error("❌ Error fetching car:", rpcError);
        throw rpcError;
      }

      console.log("✅ Car fetched successfully");
      setData(carData as CarForBooking);
    } catch (err) {
      console.error("❌ fetchCar error:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    fetchCar();
  }, [fetchCar]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchCar,
  };
}

// ============================================
// usePricePreview - محسّن مع معالجة أفضل للأخطاء
// ============================================
export function usePricePreview(
  carId: string | undefined,
  rentalType: "daily" | "weekly" | "monthly",
  startDate: string,
  endDate: string,
  enabled: boolean = true
) {
  const [data, setData] = useState<PricePreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!enabled || !carId || !startDate || !endDate) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: priceData, error: rpcError } = await supabase.rpc(
        "calculate_booking_price_preview",
        {
          p_car_id: carId,
          p_rental_type: rentalType,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

      if (rpcError) {
        // ✅ معالجة أخطاء محددة بدون إظهارها للمستخدم
        if (rpcError.message?.includes("not allowed")) {
          console.log("ℹ️ Rental type not available:", rentalType);
          setData(null);
          return;
        }
        throw rpcError;
      }

      const price = Array.isArray(priceData) ? priceData[0] : priceData;

      console.log("💰 Price calculation:", price.calculation_details);

      setData(price as PricePreview);
    } catch (err) {
      console.error("❌ fetchPrice error:", err);
      setError(err as Error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, carId, rentalType, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrice();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchPrice]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPrice,
  };
}

// ============================================
// useUserEligibility - محسّن مع try-catch أفضل
// ============================================
export function useUserEligibility() {
  const [data, setData] = useState<UserEligibility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkEligibility = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setData({
          is_eligible: false,
          reason_code: "NOT_AUTHENTICATED",
          reason_message_ar: "يجب تسجيل الدخول",
          reason_message_en: "Must login",
        });
        setIsLoading(false);
        return;
      }

      const { data: eligibilityData, error: rpcError } = await supabase.rpc(
        "get_user_booking_eligibility",
        {
          p_user_id: user.id,
        }
      );

      if (rpcError) {
        console.error("❌ checkEligibility error:", rpcError);
        throw rpcError;
      }

      const eligibility = Array.isArray(eligibilityData)
        ? eligibilityData[0]
        : eligibilityData;

      setData(eligibility as UserEligibility);
    } catch (err) {
      console.error("❌ checkEligibility error:", err);
      setError(err as Error);

      // ✅ Fallback: افتراض أن المستخدم مؤهل إذا فشل التحقق
      setData({
        is_eligible: true,
        reason_code: "FALLBACK",
        reason_message_ar: "تحقق من الأهلية فشل، يمكنك المتابعة",
        reason_message_en: "Eligibility check failed, you can proceed",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  return {
    data,
    isLoading,
    error,
    refetch: checkEligibility,
  };
}

// ============================================
// 4. useBookingAvailability (محسّن)
// ============================================
export function useBookingAvailability(
  carId: string | undefined,
  startDate: string,
  endDate: string,
  enabled: boolean = true
) {
  const [data, setData] = useState<{
    isAvailable: boolean | null;
    message: string | null;
  }>({ isAvailable: null, message: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkAvailability = useCallback(async () => {
    if (!enabled || !carId || !startDate || !endDate) {
      setData({ isAvailable: null, message: null });
      return;
    }

    // التحقق من التواريخ أولاً
    const { data: dateValidation, error: dateError } = await supabase.rpc(
      "validate_booking_dates",
      {
        p_start_date: startDate,
        p_end_date: endDate,
        p_min_days: 1,
      }
    );

    if (dateError) {
      console.warn("Date validation error:", dateError);
      setData({ isAvailable: false, message: dateError.message });
      return;
    }

    const validation = Array.isArray(dateValidation)
      ? dateValidation[0]
      : dateValidation;

    if (!validation.is_valid) {
      setData({
        isAvailable: false,
        message: validation.error_message_ar,
      });
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

      setData({
        isAvailable: isAvailable === true,
        message: isAvailable
          ? "السيارة متاحة للفترة المحددة"
          : "السيارة غير متاحة للفترة المحددة",
      });
    } catch (err) {
      console.error("❌ checkAvailability error:", err);
      setError(err as Error);
      setData({ isAvailable: null, message: null });
    } finally {
      setIsLoading(false);
    }
  }, [enabled, carId, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, [checkAvailability]);

  return {
    data,
    isLoading,
    error,
    refetch: checkAvailability,
  };
}
