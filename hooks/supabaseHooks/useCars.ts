// ============================
// hooks/useCars.ts - Cars Logic Hook (Non-Search Functions)
// ============================

import { CarWithImages } from "@/types/supabase";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface NearestCarResult {
  car_id: string;
  car_model: string;
  car_brand: string;
  car_color: string;
  daily_price: number;
  branch_name: string;
  branch_location: string;
  distance_meters: number;
  distance_km: number;
  main_image_url: string;
  seats: number;
  fuel_type: string;
  transmission: string;
  is_new: boolean;
  discount_percentage: number;
}

interface SearchResult {
  car_id: string;
  brand_name_ar: string;
  brand_name_en: string;
  model_name_ar: string;
  model_name_en: string;
  model_year: number;
  main_image_url: string;
  color_name_ar: string;
  color_name_en: string;
  daily_price: number | null;
  seats: number;
  fuel_type: string;
  transmission: string;
  branch_name_ar: string;
  branch_name_en: string;
  distance_km: number | null;
  is_new: boolean;
  discount_percentage: number;
  status: string;
}

interface Suggestion {
  suggestion: string;
  source: string;
}

interface SearchFilters {
  minPrice: string;
  maxPrice: string;
  seats: string;
  fuelType: string;
  transmission: string;
  showNewOnly: boolean;
  showDiscountedOnly: boolean;
}

interface UserLocation {
  lat: number;
  lon: number;
}

export const useCars = () => {
  const [cars, setCars] = useState<CarWithImages[]>([]);
  const [nearestCars, setNearestCars] = useState<NearestCarResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // البحث الشامل في السيارات مع الموقع
  const searchCars = async (
    searchQuery: string,
    language: "ar" | "en",
    filters: SearchFilters,
    sortBy: string,
    userLocation?: UserLocation
  ) => {
    try {
      setSearchLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("search_cars", {
        search_query: searchQuery || null,
        search_language: language,
        min_price: filters.minPrice ? parseFloat(filters.minPrice) : null,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
        min_seats:
          filters.seats && filters.seats !== "all"
            ? parseInt(filters.seats)
            : null,
        fuel_types:
          filters.fuelType && filters.fuelType !== "all"
            ? [filters.fuelType]
            : null,
        transmission_types:
          filters.transmission && filters.transmission !== "all"
            ? [filters.transmission]
            : null,
        include_new_only: filters.showNewOnly,
        include_discounted_only: filters.showDiscountedOnly,
        sort_by: sortBy,
        page_size: 20,
        page_number: 1,
        user_lat: userLocation?.lat || null,
        user_lon: userLocation?.lon || null,
      });

      if (error) throw error;

      setSearchResults(data || []);
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setSearchLoading(false);
    }
  };

  // الحصول على الاقتراحات للبحث التلقائي
  const getQuickSuggestions = async (
    term: string,
    language: "ar" | "en" = "ar"
  ) => {
    try {
      const { data, error } = await supabase.rpc("quick_search_suggestions", {
        _term: term,
        _limit: 8,
      });

      if (error) {
        console.error("Suggestions error:", error);
        setSuggestions([]);
      } else {
        setSuggestions(data || []);
      }

      return data || [];
    } catch (err: any) {
      console.error("Suggestions error:", err);
      setSuggestions([]);
      return [];
    }
  };
  const fetchCars = async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("cars_with_images")
        .select("*")
        .eq("status", "available")
        .gt("available_quantity", 0)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      setCars(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // الحصول على أقرب السيارات (يتطلب تمرير الموقع)
  const getNearestCars = async (
    latitude: number,
    longitude: number,
    limit = 3
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("get_nearest_cars", {
        _user_lat: latitude,
        _user_lon: longitude,
        _limit: limit,
      });

      if (error) throw error;

      setNearestCars(data || []);
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // فحص توفر السيارة
  const checkCarAvailability = async (
    carId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      const { data, error } = await supabase.rpc("check_car_availability", {
        _car_id: carId,
        _start_date: startDate,
        _end_date: endDate,
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Error checking availability:", err.message);
      return false;
    }
  };

  // الحصول على تفاصيل سيارة واحدة
  const getCarById = async (carId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cars_with_images")
        .select("*")
        .eq("id", carId)
        .single();
      if (error) throw error;

      setSelectedCar(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // الحصول على العروض النشطة
  const getActiveOffers = async (carId?: string) => {
    try {
      let query = supabase
        .from("car_offers")
        .select(
          `
          *,
          car:cars!inner(*)
        `
        )
        .eq("is_active", true)
        .gte("valid_until", new Date().toISOString());

      if (carId) {
        query = query.eq("car_id", carId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error("Error fetching offers:", err.message);
      return [];
    }
  };

  // حساب السعر مع العروض
  const calculatePriceWithOffers = async (
    carId: string,
    rentalDays: number,
    rentalType: "daily" | "weekly" | "monthly" = "daily"
  ) => {
    try {
      const offers = await getActiveOffers(carId);
      const car = cars.find((c) => c.id === carId) || selectedCar;

      if (!car)
        return {
          originalPrice: 0,
          finalPrice: 0,
          discount: 0,
          appliedOffer: null,
        };

      let basePrice = 0;
      switch (rentalType) {
        case "daily":
          basePrice = car.daily_price * rentalDays;
          break;
        case "weekly":
          basePrice = car.weekly_price
            ? car.weekly_price * Math.ceil(rentalDays / 7)
            : car.daily_price * rentalDays;
          break;
        case "monthly":
          basePrice = car.monthly_price
            ? car.monthly_price * Math.ceil(rentalDays / 30)
            : car.daily_price * rentalDays;
          break;
      }

      let bestOffer = null;
      let maxDiscount = 0;

      // البحث عن أفضل عرض
      for (const offer of offers) {
        if (
          rentalDays >= (offer.min_rental_days || 1) &&
          (!offer.max_rental_days || rentalDays <= offer.max_rental_days)
        ) {
          let discount = 0;

          switch (offer.discount_type) {
            case "percentage":
              discount = basePrice * (offer.discount_value / 100);
              break;
            case "fixed_amount":
              discount = offer.discount_value;
              break;
            case "buy_days_get_free":
              const freeDays = Math.floor(rentalDays / offer.discount_value);
              discount = car.daily_price * freeDays;
              break;
          }

          if (discount > maxDiscount) {
            maxDiscount = discount;
            bestOffer = offer;
          }
        }
      }

      const finalPrice = Math.max(0, basePrice - maxDiscount);

      return {
        originalPrice: basePrice,
        finalPrice,
        discount: maxDiscount,
        appliedOffer: bestOffer,
      };
    } catch (err: any) {
      console.error("Error calculating price:", err.message);
      return {
        originalPrice: 0,
        finalPrice: 0,
        discount: 0,
        appliedOffer: null,
      };
    }
  };

  // إعادة تعيين الحالة
  const resetState = () => {
    setCars([]);
    setNearestCars([]);
    setSearchResults([]);
    setSuggestions([]);
    setSelectedCar(null);
    setError(null);
  };

  // مسح نتائج البحث
  const clearSearchResults = () => {
    setSearchResults([]);
  };

  // مسح الاقتراحات
  const clearSuggestions = () => {
    setSuggestions([]);
  };

  // تحميل السيارات عند التهيئة
  useEffect(() => {
    fetchCars();
  }, []);

  return {
    // البيانات
    cars,
    nearestCars,
    searchResults,
    suggestions,
    selectedCar,

    // حالات التحميل
    loading,
    searchLoading,
    error,

    // الوظائف الأساسية
    fetchCars,
    getNearestCars,
    checkCarAvailability,
    getCarById,

    // وظائف البحث
    searchCars,
    getQuickSuggestions,
    clearSearchResults,
    clearSuggestions,

    // العروض والأسعار
    getActiveOffers,
    calculatePriceWithOffers,

    // أدوات إضافية
    resetState,
    setSelectedCar,
  };
};
