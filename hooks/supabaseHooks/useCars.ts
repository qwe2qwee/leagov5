// ============================
// hooks/useCars.ts - Cars Logic Hook (Enhanced with Load More)
// ============================

import { CarWithImages } from "@/types/supabase";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export interface SearchResult {
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

interface CarOffer {
  id: string;
  car_id: string;
  discount_type: "percentage" | "fixed_amount" | "buy_days_get_free";
  discount_value: number;
  min_rental_days: number | null;
  max_rental_days: number | null;
  is_active: boolean;
  valid_until: string;
}

interface PriceCalculationResult {
  originalPrice: number;
  finalPrice: number;
  discount: number;
  appliedOffer: CarOffer | null;
}

export const useCars = () => {
  // State with proper TypeScript types
  const [cars, setCars] = useState<CarWithImages[]>([]);
  const [nearestCars, setNearestCars] = useState<NearestCarResult[]>([]);
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
  const ITEMS_PER_PAGE = 10;

  // Refs for request control and race condition prevention
  const searchControllerRef = useRef<AbortController | null>(null);
  const suggestionsControllerRef = useRef<AbortController | null>(null);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const lastSearchQueryRef = useRef<string>("");
  const lastSuggestionsQueryRef = useRef<string>("");

  // Helper function to handle AbortController cleanup
  const cleanupController = useCallback(
    (controllerRef: React.MutableRefObject<AbortController | null>) => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    },
    []
  );

  // Enhanced fetchCars with pagination support
  const fetchCars = useCallback(
    async (
      limit: number = ITEMS_PER_PAGE,
      page: number = 1,
      append: boolean = false
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

        // ✅ تغيير: استخدام cars مع joins بدلاً من cars_with_images
        const { data, error, count } = await supabase
          .from("cars")
          .select(
            `
            *,
            model:car_models!inner (
              *,
              brand:car_brands!inner (
                id,
                name_ar,
                name_en,
                logo_url,
                is_active
              )
            ),
            color:car_colors!inner (
              id,
              name_ar,
              name_en,
              hex_code,
              is_active
            ),
            branch:branches!inner (
              id,
              name_ar,
              name_en,
              location_ar,
              location_en,
              latitude,
              longitude,
              phone,
              is_active
            )
          `,
            { count: "exact" }
          )
          .eq("status", "available")
          .gt("available_quantity", 0)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        // تحويل البيانات لنفس الشكل القديم
        const formattedCars = (data || []).map((car) => ({
          ...car,
          brand_name_ar: car.model?.brand?.name_ar,
          brand_name_en: car.model?.brand?.name_en,
          brand_logo_url: car.model?.brand?.logo_url,
          model_name_ar: car.model?.name_ar,
          model_name_en: car.model?.name_en,
          model_year: car.model?.year,
          main_image_url: car.model?.default_image_url,
          model_description_ar: car.model?.description_ar,
          model_description_en: car.model?.description_en,
          specifications: car.model?.specifications,
          color_name_ar: car.color?.name_ar,
          color_name_en: car.color?.name_en,
          hex_code: car.color?.hex_code,
          branch_name_ar: car.branch?.name_ar,
          branch_name_en: car.branch?.name_en,
          branch_location_ar: car.branch?.location_ar,
          branch_location_en: car.branch?.location_en,
        })) as CarWithImages[];

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

        if (
          formattedCars.length < limit ||
          (count && from + formattedCars.length >= count)
        ) {
          setHasReachedEnd(true);
        }

        return formattedCars;
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
        return [];
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );
  // Load more cars function
  const loadMoreCars = useCallback(async (): Promise<void> => {
    if (loadingMore || hasReachedEnd) return;

    // Cancel any ongoing load more request
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

  // Search cars with proper error handling and race condition prevention
  const searchCars = useCallback(
    async (
      searchQuery: string,
      language: "ar" | "en",
      filters: SearchFilters,
      sortBy: string,
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

        // Check if request was aborted or query changed
        if (
          currentController.signal.aborted ||
          lastSearchQueryRef.current !== searchQuery
        ) {
          return [];
        }

        if (error) throw error;

        const results = data || [];
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

  // Get quick suggestions with debouncing and race condition prevention
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

  // Get nearest cars
  const getNearestCars = useCallback(
    async (
      latitude: number,
      longitude: number,
      limit: number = 3
    ): Promise<NearestCarResult[]> => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.rpc("get_nearest_cars", {
          _user_lat: latitude,
          _user_lon: longitude,
          _limit: limit,
        });

        if (error) throw error;

        const results = data || [];
        setNearestCars(results);
        return results;
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Check car availability
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

  // Get car by ID
  const getCarById = useCallback(
    async (carId: string): Promise<CarWithImages | null> => {
      try {
        setLoading(true);

        // ✅ جلب من cars بدلاً من cars_with_images
        const { data, error } = await supabase
          .from("cars")
          .select(
            `
            *,
            model:car_models!inner (
              *,
              brand:car_brands!inner (*)
            ),
            color:car_colors!inner (*),
            branch:branches!inner (*)
          `
          )
          .eq("id", carId)
          .single();

        if (error) throw error;

        // ✅ تحقق إضافي من الحالة
        if (data.status !== "available" || data.available_quantity <= 0) {
          console.warn("Car not available:", {
            status: data.status,
            available_quantity: data.available_quantity,
          });
          setError("عذراً، هذه السيارة لم تعد متاحة");
          return null;
        }

        // تحويل البيانات لنفس الشكل
        const formattedCar = {
          ...data,
          brand_name_ar: data.model?.brand?.name_ar,
          brand_name_en: data.model?.brand?.name_en,
          brand_logo_url: data.model?.brand?.logo_url,
          model_name_ar: data.model?.name_ar,
          model_name_en: data.model?.name_en,
          model_year: data.model?.year,
          main_image_url: data.model?.default_image_url,
          color_name_ar: data.color?.name_ar,
          color_name_en: data.color?.name_en,
          hex_code: data.color?.hex_code,
          branch_name_ar: data.branch?.name_ar,
          branch_name_en: data.branch?.name_en,
        } as CarWithImages;

        setSelectedCar(formattedCar);
        return formattedCar;
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get active offers
  const getActiveOffers = useCallback(
    async (carId?: string): Promise<CarOffer[]> => {
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
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error fetching offers:", error.message);
        return [];
      }
    },
    []
  );

  // Calculate price with offers
  const calculatePriceWithOffers = useCallback(
    async (
      carId: string,
      rentalDays: number,
      rentalType: "daily" | "weekly" | "monthly" = "daily"
    ): Promise<PriceCalculationResult> => {
      try {
        const offers = await getActiveOffers(carId);
        const car =
          cars.find((c: CarWithImages) => c.id === carId) || selectedCar;

        if (!car) {
          return {
            originalPrice: 0,
            finalPrice: 0,
            discount: 0,
            appliedOffer: null,
          };
        }

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

        let bestOffer: CarOffer | null = null;
        let maxDiscount = 0;

        // Find best offer
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
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error calculating price:", error.message);
        return {
          originalPrice: 0,
          finalPrice: 0,
          discount: 0,
          appliedOffer: null,
        };
      }
    },
    [cars, selectedCar, getActiveOffers]
  );

  // Refresh function that resets pagination
  const refreshCars = useCallback(async (): Promise<void> => {
    setCurrentPage(1);
    setHasReachedEnd(false);
    await fetchCars(ITEMS_PER_PAGE, 1, false);
  }, [fetchCars]);

  // State management functions
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
    lastSearchQueryRef.current = "";
    lastSuggestionsQueryRef.current = "";
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

  // Memoized values for performance
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

  return {
    // Data
    cars,
    nearestCars,
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

    // Computed values
    hasSearchResults,
    hasSuggestions,
    hasCars,
    hasMoreCars,

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

    // Offers and pricing
    getActiveOffers,
    calculatePriceWithOffers,

    // Utility functions
    resetState,
    setSelectedCar,
  };
};
