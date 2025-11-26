// ============================
// hooks/useCars.ts - Enhanced Version (Final & Complete)
// ============================

import { CarWithImages } from "@/types/supabase";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

// ============================
// Types
// ============================

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
  actual_available_quantity: number;
}

export interface SearchResult {
  id: string;
  model_name_en: string;
  model_name_ar: string;
  brand_name_en: string;
  brand_name_ar: string;
  branch_name_en: string;
  branch_name_ar: string;
  color_name_en: string;
  color_name_ar: string;
  default_image_url: string;
  year: number;
  branch_id: string;
  daily_price: number;
  weekly_price: number | null;
  monthly_price: number | null;
  discount_percentage: number;
  offer_expires_at: string | null;
  is_new: boolean;
  mileage: number;
  status: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  available_quantity: number;
  features_ar: string[];
  features_en: string[];
  rental_types: string[];
  relevance_score: number;
  total_results: number;
}

// ... (rest of the file)



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
  rentalType?: "daily" | "weekly" | "monthly" | "ownership";
  brandId?: string;
  branchId?: string;
}

interface UserLocation {
  lat: number;
  lon: number;
}

interface PriceCalculation {
  base_price: number;
  car_discount_percentage: number;
  car_discount_amount: number;
  price_after_car_discount: number;
  total_days: number;
  subtotal: number;
  booking_discount_amount: number;
  final_amount: number;
  total_savings: number;
  total_savings_percentage: number;
}

// ============================
// Helper Function - Transform nearest cars
// ============================

/**
 * ✅ دالة تحويل nearestCars لنفس بنية CarWithImages
 */
const transformNearestCarToCarWithImages = (
  nearestCar: NearestCarResult
): CarWithImages => {
  const isAvailable = nearestCar.actual_available_quantity > 0;

  return {
    id: nearestCar.car_id,
    brand_name_ar: nearestCar.car_brand,
    brand_name_en: nearestCar.car_brand,
    model_name_ar: nearestCar.car_model,
    model_name_en: nearestCar.car_model,
    color_name_ar: nearestCar.car_color,
    color_name_en: nearestCar.car_color,
    daily_price: nearestCar.daily_price,
    weekly_price: null,
    monthly_price: null,
    ownership_price: null,
    year: new Date().getFullYear(),
    seats: nearestCar.seats,
    fuel_type: nearestCar.fuel_type,
    transmission: nearestCar.transmission,
    mileage: 0,
    images: [nearestCar.main_image_url],
    main_image_url: nearestCar.main_image_url,
    additional_images: [],
    is_new: nearestCar.is_new,
    discount_percentage: nearestCar.discount_percentage,
    offer_expires_at: null,

    // ✅ الحقل الأهم - التوفر
    available: isAvailable,
    actual_available_quantity: nearestCar.actual_available_quantity,
    quantity: nearestCar.actual_available_quantity,
    available_quantity: nearestCar.actual_available_quantity,

    status: isAvailable ? "available" : "unavailable",

    specs: {
      seats: nearestCar.seats,
      transmission_ar:
        nearestCar.transmission === "automatic" ? "أوتوماتيك" : "يدوي",
      transmission_en:
        nearestCar.transmission === "automatic" ? "Automatic" : "Manual",
      fuel_type_ar:
        nearestCar.fuel_type === "gasoline"
          ? "بنزين"
          : nearestCar.fuel_type === "diesel"
          ? "ديزل"
          : nearestCar.fuel_type === "electric"
          ? "كهربائي"
          : nearestCar.fuel_type,
      fuel_type_en: nearestCar.fuel_type,
    },

    branch: {
      id: "",
      name_ar: nearestCar.branch_name,
      name_en: nearestCar.branch_name,
      location_ar: nearestCar.branch_location,
      location_en: nearestCar.branch_location,
      latitude: 0,
      longitude: 0,
      phone: "",
      is_active: true,
    },

    branch_id: "",
    branch_name_ar: nearestCar.branch_name,
    branch_name_en: nearestCar.branch_name,
    branch_location_ar: nearestCar.branch_location,
    branch_location_en: nearestCar.branch_location,

    distance_km: nearestCar.distance_km,
    distance_meters: nearestCar.distance_meters,

    rental_types: ["daily"],
    features_ar: [],
    features_en: [],
    feature_ids: [],

    brand_id: "",
    model_id: "",
    color_id: "",

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any;
};

// ============================
// Main Hook
// ============================

export const useCars = () => {
  // State
  const [cars, setCars] = useState<CarWithImages[]>([]);
  const [nearestCars, setNearestCars] = useState<CarWithImages[]>([]); // ✅ تغيير النوع
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarWithImages | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const ITEMS_PER_PAGE = 10;

  // Refs for request control
  const searchControllerRef = useRef<AbortController | null>(null);
  const suggestionsControllerRef = useRef<AbortController | null>(null);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const lastSearchQueryRef = useRef<string>("");
  const lastSuggestionsQueryRef = useRef<string>("");

  // Cache refs for performance
  const carsCache = useRef<Map<string, CarWithImages>>(new Map());
  const priceCache = useRef<Map<string, PriceCalculation>>(new Map());

  // ============================
  // Helper Functions
  // ============================

  const cleanupController = useCallback(
    (controllerRef: React.MutableRefObject<AbortController | null>) => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    },
    []
  );

  const buildCacheKey = useCallback(
    (
      carId: string,
      startDate?: string,
      endDate?: string,
      rentalType?: string
    ) => {
      return `${carId}-${startDate || "now"}-${endDate || "now"}-${
        rentalType || "daily"
      }`;
    },
    []
  );

  // ============================
  // Core Functions
  // ============================

  /**
   * ✅ محسّن: استخدام cars_with_details view
   */
  const fetchCars = useCallback(
    async (
      limit: number = ITEMS_PER_PAGE,
      page: number = 1,
      append: boolean = false,
      filters?: Partial<SearchFilters>
    ): Promise<CarWithImages[]> => {
      try {
        if (!append) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // ✅ استخدام View الجاهز بدلاً من joins يدوية
        let query = supabase
          .from("cars_with_details")
          .select("*", { count: "exact" })
          .eq("status", "available");

        // ✅ فلترة بناءً على التوفر الفعلي (من الـ view)
        query = query.gt("actual_available_quantity", 0);

        // ✅ تطبيق الفلاتر الإضافية
        if (filters?.showNewOnly) {
          query = query.eq("is_new", true);
        }

        if (filters?.showDiscountedOnly) {
          query = query.gt("discount_percentage", 0);
        }

        if (filters?.seats && filters.seats !== "all") {
          query = query.eq("seats", parseInt(filters.seats));
        }

        if (filters?.fuelType && filters.fuelType !== "all") {
          query = query.eq("fuel_type", filters.fuelType);
        }

        if (filters?.transmission && filters.transmission !== "all") {
          query = query.eq("transmission", filters.transmission);
        }

        if (filters?.minPrice) {
          query = query.gte("daily_price", parseFloat(filters.minPrice));
        }

        if (filters?.maxPrice) {
          query = query.lte("daily_price", parseFloat(filters.maxPrice));
        }

        if (filters?.branchId) {
          query = query.eq("branch_id", filters.branchId);
        }

        if (filters?.brandId) {
          query = query.eq("brand_id", filters.brandId);
        }

        // الترتيب
        query = query.order("created_at", { ascending: false });

        // Pagination
        const { data, error, count } = await query.range(from, to);

        if (error) throw error;

        const formattedCars = (data || []) as CarWithImages[];

        // ✅ تحديث الـ cache
        formattedCars.forEach((car) => {
          carsCache.current.set(car.id, car);
        });

        if (append) {
          setCars((prevCars) => {
            const existingIds = new Set(prevCars.map((car) => car.id));
            const uniqueNewCars = formattedCars.filter(
              (car) => !existingIds.has(car.id)
            );
            return [...prevCars, ...uniqueNewCars];
          });
        } else {
          setCars(formattedCars);
          setCurrentPage(1);
          setHasReachedEnd(false);
        }

        // ✅ تحديث العدد الكلي
        if (count !== null) {
          setTotalCount(count);
        }

        // تحديث حالة النهاية
        if (
          formattedCars.length < limit ||
          (count && from + formattedCars.length >= count)
        ) {
          setHasReachedEnd(true);
        }

        return formattedCars;
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error fetching cars:", error);
        setError(error.message);
        return [];
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  /**
   * ✅ Load more cars function
   */
  const loadMoreCars = useCallback(async (): Promise<void> => {
    if (loadingMore || hasReachedEnd) return;

    cleanupController(loadMoreControllerRef);
    loadMoreControllerRef.current = new AbortController();

    try {
      const nextPage = currentPage + 1;
      const newCars = await fetchCars(ITEMS_PER_PAGE, nextPage, true);

      if (newCars.length > 0) {
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("خطأ في تحميل المزيد:", error);
    }
  }, [loadingMore, hasReachedEnd, currentPage, fetchCars, cleanupController]);

  /**
   * ✅ محسّن: searchCars مع كل الفلاتر
   */
  const searchCars = useCallback(
    async (
      searchQuery: string,
      language: "ar" | "en",
      filters: SearchFilters,
      sortBy: string = "relevance",
      userLocation?: UserLocation
    ): Promise<SearchResult[]> => {
      // Cleanup previous request
      cleanupController(searchControllerRef);

      // Create new controller
      searchControllerRef.current = new AbortController();
      const currentController = searchControllerRef.current;

      try {
        setSearchLoading(true);
        setError(null);
        lastSearchQueryRef.current = searchQuery;

        const { data, error } = await supabase.rpc("search_cars", {
          p_search_query: searchQuery || null,
          p_brand_id: filters.brandId || null,
          p_model_id: null,
          p_branch_id: filters.branchId || null,
          p_min_price: filters.minPrice ? parseFloat(filters.minPrice) : null,
          p_max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
          p_transmission:
            filters.transmission && filters.transmission !== "all"
              ? filters.transmission
              : null,
          p_fuel_type:
            filters.fuelType && filters.fuelType !== "all"
              ? filters.fuelType
              : null,
          p_rental_type: filters.rentalType || "daily",
          p_sort_by: sortBy || "relevance",
          p_limit: 50,
          p_offset: 0,
        });

        // Check if request was aborted or query changed
        if (
          currentController.signal.aborted ||
          lastSearchQueryRef.current !== searchQuery
        ) {
          return [];
        }

        if (error) throw error;

        let results = (data || []) as SearchResult[];

        // ✅ فلترة إضافية في Frontend للفلاتر التي لا تدعمها search_cars
        if (filters.showNewOnly) {
          results = results.filter((car) => car.is_new);
        }

        if (filters.showDiscountedOnly) {
          results = results.filter((car) => car.discount_percentage > 0);
        }

        if (filters.seats && filters.seats !== "all") {
          results = results.filter(
            (car) => car.seats === parseInt(filters.seats)
          );
        }

        setSearchResults(results);
        return results;
      } catch (err: unknown) {
        const error = err as Error;

        // Only handle error if request wasn't aborted
        if (error.name !== "AbortError" && !currentController.signal.aborted) {
          console.error("Search error:", error);
          setError(error.message);
        }
        return [];
      } finally {
        // Only set loading to false if this is still the current request
        if (
          !currentController.signal.aborted &&
          lastSearchQueryRef.current === searchQuery
        ) {
          setSearchLoading(false);
        }
      }
    },
    [cleanupController]
  );

  /**
   * ✅ الإبقاء على quick_search_suggestions كما هو
   */
  const getQuickSuggestions = useCallback(
    async (
      term: string,
      language: "ar" | "en" = "ar"
    ): Promise<Suggestion[]> => {
      // Cleanup previous request
      cleanupController(suggestionsControllerRef);

      // Don't search for very short terms
      if (term.length < 2) {
        setSuggestions([]);
        return [];
      }

      // Create new controller
      suggestionsControllerRef.current = new AbortController();
      const currentController = suggestionsControllerRef.current;

      try {
        lastSuggestionsQueryRef.current = term;

        const { data, error } = await supabase.rpc("quick_search_suggestions", {
          _term: term,
          _limit: 8,
        });

        // Check if request was aborted or query changed
        if (
          currentController.signal.aborted ||
          lastSuggestionsQueryRef.current !== term
        ) {
          return [];
        }

        if (error) {
          console.error("Suggestions error:", error);
          setSuggestions([]);
          return [];
        }

        const results = data || [];
        setSuggestions(results);
        return results;
      } catch (err: unknown) {
        const error = err as Error;

        // Only handle error if request wasn't aborted
        if (error.name !== "AbortError" && !currentController.signal.aborted) {
          console.error("Suggestions error:", error);
          setSuggestions([]);
        }
        return [];
      }
    },
    [cleanupController]
  );

  /**
   * ✅ محسّن: getNearestCars مع تحويل البيانات
   */
  const getNearestCars = useCallback(
    async (
      latitude: number,
      longitude: number,
      limit: number = 3
    ): Promise<CarWithImages[]> => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.rpc("get_nearest_cars", {
          _user_lat: latitude,
          _user_lon: longitude,
          _limit: limit,
        });

        if (error) throw error;

        const results = (data || []) as NearestCarResult[];

        // ✅ تحويل البيانات لنفس بنية CarWithImages
        const transformedCars = results.map(transformNearestCarToCarWithImages);

        // ✅ تصفية السيارات المتوفرة فقط
        const availableCars = transformedCars.filter(
          (car: any) => car.available
        );

        setNearestCars(availableCars);
        return availableCars;
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error getting nearest cars:", error);
        setError(error.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * ✅ محسّن: checkCarAvailability
   */
  const checkCarAvailability = useCallback(
    async (
      carId: string,
      startDate: string,
      endDate: string
    ): Promise<boolean> => {
      try {
        const { data, error } = await supabase.rpc("check_car_availability", {
          _car_id: carId,
          _start_date: startDate,
          _end_date: endDate,
        });

        if (error) throw error;
        return Boolean(data);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error checking availability:", error.message);
        return false;
      }
    },
    []
  );

  /**
   * ✅ محسّن: getCarById مع cache واستخدام view
   */
  const getCarById = useCallback(
    async (carId: string): Promise<CarWithImages | null> => {
      try {
        // ✅ تحقق من الـ cache أولاً
        if (carsCache.current.has(carId)) {
          const cachedCar = carsCache.current.get(carId)!;
          setSelectedCar(cachedCar);
          return cachedCar;
        }

        setLoading(true);

        // ✅ استخدام View بدلاً من joins يدوية
        const { data, error } = await supabase
          .from("cars_with_details")
          .select("*")
          .eq("id", carId)
          .single();

        if (error) throw error;

        // ✅ تحقق من التوفر الفعلي
        if (
          data.status !== "available" ||
          data.actual_available_quantity <= 0
        ) {
          console.warn("Car not available:", {
            status: data.status,
            available_quantity: data.actual_available_quantity,
          });
          setError("عذراً، هذه السيارة لم تعد متاحة");
          return null;
        }

        const formattedCar = data as CarWithImages;

        // ✅ حفظ في الـ cache
        carsCache.current.set(carId, formattedCar);

        setSelectedCar(formattedCar);
        return formattedCar;
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error fetching car:", error);
        setError(error.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * ✅ جديد: استخدام calculate_booking_price من قاعدة البيانات
   */
  const calculatePriceWithDates = useCallback(
    async (
      carId: string,
      rentalType: "daily" | "weekly" | "monthly" | "ownership",
      startDate: string,
      endDate: string,
      discountPercentage: number = 0,
      discountAmount: number = 0
    ): Promise<PriceCalculation | null> => {
      try {
        // ✅ تحقق من الـ cache
        const cacheKey = buildCacheKey(carId, startDate, endDate, rentalType);
        if (priceCache.current.has(cacheKey)) {
          return priceCache.current.get(cacheKey)!;
        }

        // ✅ استخدام الدالة من قاعدة البيانات بدلاً من الحساب اليدوي
        const { data, error } = await supabase.rpc("calculate_booking_price", {
          p_car_id: carId,
          p_rental_type: rentalType,
          p_start_date: startDate,
          p_end_date: endDate,
          p_discount_percentage: discountPercentage,
          p_discount_amount: discountAmount,
        });

        if (error) throw error;

        const result = data?.[0] as PriceCalculation;

        // ✅ حفظ في الـ cache
        if (result) {
          priceCache.current.set(cacheKey, result);
        }

        return result;
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error calculating price:", error);
        return null;
      }
    },
    [buildCacheKey]
  );

  /**
   * ✅ جديد: حساب سريع للسعر بدون تواريخ (للعرض السريع فقط)
   */
  const calculateQuickPrice = useCallback(
    (
      car: CarWithImages,
      rentalType: "daily" | "weekly" | "monthly",
      days: number = 1
    ): number => {
      let basePrice = 0;

      switch (rentalType) {
        case "daily":
          basePrice = car.daily_price * days;
          break;
        case "weekly":
          const weeks = Math.ceil(days / 7);
          basePrice = car.weekly_price
            ? car.weekly_price * weeks
            : car.daily_price * days;
          break;
        case "monthly":
          const months = Math.ceil(days / 30);
          basePrice = car.monthly_price
            ? car.monthly_price * months
            : car.daily_price * days;
          break;
      }

      // ✅ تطبيق خصم السيارة إن وُجد
      if (car.discount_percentage > 0) {
        // تحقق من صلاحية العرض
        if (
          !car.offer_expires_at ||
          new Date(car.offer_expires_at) > new Date()
        ) {
          const discount = basePrice * (car.discount_percentage / 100);
          basePrice -= discount;
        }
      }

      return Math.max(0, basePrice);
    },
    []
  );

  /**
   * ✅ Refresh function that resets pagination
   */
  const refreshCars = useCallback(
    async (filters?: Partial<SearchFilters>): Promise<void> => {
      // ✅ مسح الـ cache
      carsCache.current.clear();
      priceCache.current.clear();

      setCurrentPage(1);
      setHasReachedEnd(false);
      await fetchCars(ITEMS_PER_PAGE, 1, false, filters);
    },
    [fetchCars]
  );

  /**
   * ✅ State management functions
   */
  const resetState = useCallback((): void => {
    // Cancel any ongoing requests
    cleanupController(searchControllerRef);
    cleanupController(suggestionsControllerRef);
    cleanupController(loadMoreControllerRef);

    setCars([]);
    setNearestCars([]);
    setSearchResults([]);
    setSuggestions([]);
    setSelectedCar(null);
    setError(null);
    setCurrentPage(1);
    setHasReachedEnd(false);
    setTotalCount(0);
    lastSearchQueryRef.current = "";
    lastSuggestionsQueryRef.current = "";

    // ✅ مسح الـ cache
    carsCache.current.clear();
    priceCache.current.clear();
  }, [cleanupController]);

  const clearSearchResults = useCallback((): void => {
    cleanupController(searchControllerRef);
    setSearchResults([]);
    lastSearchQueryRef.current = "";
  }, [cleanupController]);

  const clearSuggestions = useCallback((): void => {
    cleanupController(suggestionsControllerRef);
    setSuggestions([]);
    lastSuggestionsQueryRef.current = "";
  }, [cleanupController]);

  // ============================
  // Memoized values for performance
  // ============================

  const hasSearchResults = useMemo(
    () => searchResults.length > 0,
    [searchResults.length]
  );

  const hasSuggestions = useMemo(
    () => suggestions.length > 0,
    [suggestions.length]
  );

  const hasCars = useMemo(() => cars.length > 0, [cars.length]);

  const hasMoreCars = useMemo(() => !hasReachedEnd, [hasReachedEnd]);

  // ✅ جديد: نسبة التحميل
  const loadingProgress = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((cars.length / totalCount) * 100);
  }, [cars.length, totalCount]);

  // ✅ جديد: إحصائيات
  const statistics = useMemo(
    () => ({
      total: cars.length,
      new: cars.filter((c) => c.is_new).length,
      discounted: cars.filter((c) => c.discount_percentage > 0).length,
      available: cars.filter((c: any) => c.actual_available_quantity > 0)
        .length,
    }),
    [cars]
  );

  // ============================
  // Effects
  // ============================

  // Initialize data on mount
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupController(searchControllerRef);
      cleanupController(suggestionsControllerRef);
      cleanupController(loadMoreControllerRef);
    };
  }, [cleanupController]);

  // ============================
  // Return
  // ============================

  return {
    // Data
    cars,
    nearestCars, // ✅ الآن نفس النوع CarWithImages[]
    searchResults,
    suggestions,
    selectedCar,

    // Loading states
    loading,
    searchLoading,
    loadingMore,
    error,

    // Pagination state
    currentPage,
    hasReachedEnd,
    totalCount,
    loadingProgress,

    // Computed values
    hasSearchResults,
    hasSuggestions,
    hasCars,
    hasMoreCars,
    statistics,

    // Core functions
    fetchCars,
    loadMoreCars,
    refreshCars,
    getNearestCars,
    checkCarAvailability,
    getCarById,

    // Search functions
    searchCars,
    getQuickSuggestions,
    clearSearchResults,
    clearSuggestions,

    // Pricing functions
    calculatePriceWithDates,
    calculateQuickPrice,

    // Utility functions
    resetState,
    setSelectedCar,
  };
};
