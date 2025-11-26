// ============================
// hooks/useLocation.ts - Location Management Hook (Refactored to use Global Store)
// ============================

import { LocationData, useLocationStore } from "@/store/useLocationStore";
import { useCallback } from "react";

export const useLocation = () => {
  const {
    userLocation,
    loading,
    error,
    permissionStatus,
    getCurrentLocation,
    setUserLocation,
    setError,
    setPermissionStatus,
    checkPermissionStatus,
    lastUpdated,
  } = useLocationStore();

  // المدن الافتراضية في السعودية
  const DEFAULT_LOCATIONS = {
    riyadh: { lat: 24.7136, lon: 46.6753, name: "الرياض" },
    jeddah: { lat: 21.4858, lon: 39.1925, name: "جدة" },
    dammam: { lat: 26.4207, lon: 50.0888, name: "الدمام" },
    mecca: { lat: 21.3891, lon: 39.8579, name: "مكة" },
    medina: { lat: 24.5247, lon: 39.5692, name: "المدينة" },
  };

  // حفظ موقع مخصص
  const setCustomLocation = useCallback(
    async (location: LocationData): Promise<boolean> => {
      setUserLocation(location);
      return true;
    },
    [setUserLocation]
  );

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

  // حذف الموقع المحفوظ
  const clearCachedLocation = useCallback(async (): Promise<boolean> => {
    setUserLocation(null);
    setError(null);
    setPermissionStatus("unknown");
    // We might want to clear actual storage here if needed, but store handles persistence
    // For now, setting to null in store is enough as it updates persistence
    return true;
  }, [setUserLocation, setError, setPermissionStatus]);

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
    return {
      hasCachedLocation: !!userLocation,
      cachedLocation: userLocation,
      lastUpdate: lastUpdated ? new Date(lastUpdated) : null,
      isExpired: false, // Managed by store logic mostly
    };
  }, [userLocation, lastUpdated]);

  // Compatibility shim for getCachedLocation
  const getCachedLocation = useCallback(async () => {
      return userLocation;
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
    isLocationCached: !!userLocation,

    // Backwards compatibility
    getCachedLocation, 
  };
};
