// ============================
// hooks/useLocation.ts - Location Management Hook (React Native Expo)
// ============================

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

interface LocationData {
  lat: number;
  lon: number;
}

interface LocationError {
  code: number;
  message: string;
}

interface CachedLocation extends LocationData {
  timestamp: number;
  accuracy?: number;
}

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");

  // المدن الافتراضية في السعودية
  const DEFAULT_LOCATIONS = {
    riyadh: { lat: 24.7136, lon: 46.6753, name: "الرياض" },
    jeddah: { lat: 21.4858, lon: 39.1925, name: "جدة" },
    dammam: { lat: 26.4207, lon: 50.0888, name: "الدمام" },
    mecca: { lat: 21.3891, lon: 39.8579, name: "مكة" },
    medina: { lat: 24.5247, lon: 39.5692, name: "المدينة" },
  };

  // مفاتيح التخزين
  const STORAGE_KEYS = {
    location: "userLocation",
    permission: "locationPermission",
    lastUpdate: "locationLastUpdate",
  };

  // فحص صحة البيانات المحفوظة
  const isValidCachedLocation = (cached: any): cached is CachedLocation => {
    return (
      cached &&
      typeof cached.lat === "number" &&
      typeof cached.lon === "number" &&
      typeof cached.timestamp === "number" &&
      !isNaN(cached.lat) &&
      !isNaN(cached.lon) &&
      cached.lat >= -90 &&
      cached.lat <= 90 &&
      cached.lon >= -180 &&
      cached.lon <= 180
    );
  };

  // جلب الموقع المحفوظ
  const getCachedLocation =
    useCallback(async (): Promise<CachedLocation | null> => {
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.location);
        if (!cached) return null;

        const parsedData = JSON.parse(cached);
        if (!isValidCachedLocation(parsedData)) {
          // حذف البيانات غير الصحيحة
          await AsyncStorage.removeItem(STORAGE_KEYS.location);
          return null;
        }

        return parsedData;
      } catch (error) {
        console.error("Error reading cached location:", error);
        try {
          await AsyncStorage.removeItem(STORAGE_KEYS.location);
        } catch (removeError) {
          console.error("Error removing invalid cached location:", removeError);
        }
        return null;
      }
    }, []);

  // حفظ الموقع
  const saveLocationToStorage = useCallback(
    async (location: LocationData, accuracy?: number): Promise<boolean> => {
      try {
        const dataToSave: CachedLocation = {
          lat: location.lat,
          lon: location.lon,
          timestamp: Date.now(),
          accuracy: accuracy || undefined,
        };

        await AsyncStorage.setItem(
          STORAGE_KEYS.location,
          JSON.stringify(dataToSave)
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.lastUpdate,
          Date.now().toString()
        );

        return true;
      } catch (error) {
        console.error("Error saving location:", error);
        return false;
      }
    },
    []
  );

  // فحص انتهاء صلاحية الموقع المحفوظ
  const isLocationExpired = useCallback(
    (
      cachedLocation: CachedLocation,
      maxAgeMs: number = 30 * 60 * 1000
    ): boolean => {
      return Date.now() - cachedLocation.timestamp > maxAgeMs;
    },
    []
  );

  // الحصول على حالة الصلاحية باستخدام expo-location
  const checkPermissionStatus = useCallback(async (): Promise<
    "granted" | "denied" | "prompt"
  > => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      switch (status) {
        case Location.PermissionStatus.GRANTED:
          return "granted";
        case Location.PermissionStatus.DENIED:
          return "denied";
        case Location.PermissionStatus.UNDETERMINED:
        default:
          return "prompt";
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      return "prompt";
    }
  }, []);

  // الحصول على الموقع الحالي باستخدام expo-location
  const getCurrentLocation = useCallback(
    (options?: {
      maxAge?: number; // بالميللي ثانية (افتراضي: 30 دقيقة)
      forceRefresh?: boolean; // إجبار التحديث حتى لو كان محفوظ
      timeout?: number; // مهلة الانتظار (افتراضي: 10 ثوان)
      enableHighAccuracy?: boolean; // دقة عالية (افتراضي: true)
      fallbackToDefault?: boolean; // استخدام موقع افتراضي عند الفشل (افتراضي: true)
      defaultCity?: keyof typeof DEFAULT_LOCATIONS; // المدينة الافتراضية
    }): Promise<LocationData> => {
      return new Promise(async (resolve, reject) => {
        const {
          maxAge = 30 * 60 * 1000, // 30 دقيقة
          forceRefresh = false,
          timeout = 10000, // 10 ثوان
          enableHighAccuracy = true,
          fallbackToDefault = true,
          defaultCity = "jeddah",
        } = options || {};

        setLoading(true);
        setError(null);

        try {
          // فحص الموقع المحفوظ أولاً
          if (!forceRefresh) {
            const cachedLocation = await getCachedLocation();
            if (cachedLocation && !isLocationExpired(cachedLocation, maxAge)) {
              const location = {
                lat: cachedLocation.lat,
                lon: cachedLocation.lon,
              };
              setUserLocation(location);
              setLoading(false);
              resolve(location);
              return;
            }
          }

          // فحص وطلب الصلاحيات
          let { status } = await Location.getForegroundPermissionsAsync();

          if (status !== "granted") {
            const permissionResult =
              await Location.requestForegroundPermissionsAsync();
            status = permissionResult.status;
          }

          // تحديث حالة الصلاحية
          const permissionStatusString =
            status === "granted"
              ? "granted"
              : status === "denied"
              ? "denied"
              : "prompt";
          setPermissionStatus(permissionStatusString);

          if (status !== "granted") {
            throw new Error("Location permission not granted");
          }

          // فحص إذا كانت خدمات الموقع مفعلة
          const hasLocationServices = await Location.hasServicesEnabledAsync();
          if (!hasLocationServices) {
            throw new Error("Location services are disabled");
          }

          // الحصول على الموقع باستخدام expo-location
          const locationResult = await Location.getCurrentPositionAsync({
            accuracy: enableHighAccuracy
              ? Location.Accuracy.High
              : Location.Accuracy.Balanced,
            mayShowUserSettingsDialog: true,
          });

          const location: LocationData = {
            lat: locationResult.coords.latitude,
            lon: locationResult.coords.longitude,
          };

          // التأكد من صحة البيانات
          if (
            isNaN(location.lat) ||
            isNaN(location.lon) ||
            location.lat < -90 ||
            location.lat > 90 ||
            location.lon < -180 ||
            location.lon > 180
          ) {
            throw new Error("Invalid location coordinates received");
          }

          // حفظ الموقع
          const saved = await saveLocationToStorage(
            location,
            locationResult.coords.accuracy || undefined
          );
          if (saved) {
            setUserLocation(location);
            setPermissionStatus("granted");
            setLoading(false);
            resolve(location);
          } else {
            console.warn("Failed to save location, but continuing...");
            setUserLocation(location);
            setLoading(false);
            resolve(location);
          }
        } catch (err: any) {
          console.error("Location error:", err);

          const locationError: LocationError = {
            code: err.code || 0,
            message: err.message || "Unknown error occurred",
          };

          setError(locationError);
          setPermissionStatus("denied");

          // استخدام موقع افتراضي إذا مطلوب
          if (fallbackToDefault) {
            const defaultLocation = DEFAULT_LOCATIONS[defaultCity];
            console.log(`Using default location: ${defaultLocation.name}`);

            setUserLocation(defaultLocation);
            setLoading(false);
            resolve(defaultLocation);
          } else {
            setLoading(false);
            reject(locationError);
          }
        }
      });
    },
    [getCachedLocation, isLocationExpired, saveLocationToStorage]
  );

  // حذف الموقع المحفوظ
  const clearCachedLocation = useCallback(async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.location);
      await AsyncStorage.removeItem(STORAGE_KEYS.lastUpdate);
      setUserLocation(null);
      setError(null);
      setPermissionStatus("unknown");
      return true;
    } catch (error) {
      console.error("Error clearing cached location:", error);
      return false;
    }
  }, []);

  // تحديث الموقع يدوياً
  const refreshLocation = useCallback(
    async (defaultCity?: keyof typeof DEFAULT_LOCATIONS) => {
      return getCurrentLocation({
        forceRefresh: true,
        fallbackToDefault: true,
        defaultCity: defaultCity || "jeddah",
      });
    },
    [getCurrentLocation]
  );

  // حفظ موقع مخصص
  const setCustomLocation = useCallback(
    async (location: LocationData): Promise<boolean> => {
      const saved = await saveLocationToStorage(location);
      if (saved) {
        setUserLocation(location);
        setError(null);
        return true;
      }
      return false;
    },
    [saveLocationToStorage]
  );

  // حساب المسافة بين نقطتين (بالكيلومتر)
  const calculateDistance = useCallback(
    (from: LocationData, to: LocationData): number => {
      const R = 6371; // نصف قطر الأرض بالكيلومتر
      const dLat = ((to.lat - from.lat) * Math.PI) / 180;
      const dLon = ((to.lon - from.lon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((from.lat * Math.PI) / 180) *
          Math.cos((to.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  // الحصول على معلومات التخزين
  const getStorageInfo = useCallback(async () => {
    const cachedLocation = await getCachedLocation();
    const lastUpdateStr = await AsyncStorage.getItem(STORAGE_KEYS.lastUpdate);

    return {
      hasCachedLocation: !!cachedLocation,
      cachedLocation,
      lastUpdate: lastUpdateStr ? new Date(parseInt(lastUpdateStr)) : null,
      isExpired: cachedLocation ? isLocationExpired(cachedLocation) : null,
    };
  }, [getCachedLocation, isLocationExpired]);

  // تحميل الموقع المحفوظ عند التهيئة
  useEffect(() => {
    const loadCachedLocation = async () => {
      const cachedLocation = await getCachedLocation();
      if (cachedLocation && !isLocationExpired(cachedLocation)) {
        setUserLocation({ lat: cachedLocation.lat, lon: cachedLocation.lon });
      }
    };

    loadCachedLocation();
  }, []);

  // Create a synchronous version of getCachedLocation for backwards compatibility
  const getCachedLocationSync = useCallback(() => {
    // This is a helper function that returns null and triggers async loading
    // The actual cached location will be available through userLocation state
    return null;
  }, []);

  // Check if location is cached (synchronous check)
  const [isLocationCached, setIsLocationCached] = useState(false);

  // Update cached status when location changes
  useEffect(() => {
    const checkCached = async () => {
      const cached = await getCachedLocation();
      setIsLocationCached(!!cached);
    };
    checkCached();
  }, [userLocation]);

  return {
    // البيانات
    userLocation,
    loading,
    error,
    permissionStatus,
    defaultLocations: DEFAULT_LOCATIONS,

    // الوظائف الرئيسية
    getCurrentLocation,
    refreshLocation,
    setCustomLocation,
    clearCachedLocation,

    // أدوات مساعدة
    calculateDistance,
    getStorageInfo,
    checkPermissionStatus,

    // معلومات الحالة
    hasLocation: !!userLocation,
    isLocationCached,

    // Backwards compatibility (deprecated - use async versions)
    getCachedLocation: getCachedLocationSync, // Returns null, use userLocation state instead
  };
};
