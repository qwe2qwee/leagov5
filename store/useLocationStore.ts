import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Types
export interface LocationData {
  lat: number;
  lon: number;
}

export interface LocationError {
  code: number;
  message: string;
}

interface LocationState {
  userLocation: LocationData | null;
  loading: boolean;
  error: LocationError | null;
  permissionStatus: "granted" | "denied" | "prompt" | "unknown";
  lastUpdated: number | null;
}

interface LocationActions {
  setUserLocation: (location: LocationData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: LocationError | null) => void;
  setPermissionStatus: (status: "granted" | "denied" | "prompt" | "unknown") => void;
  getCurrentLocation: (options?: {
    maxAge?: number;
    forceRefresh?: boolean;
    timeout?: number;
    enableHighAccuracy?: boolean;
    fallbackToDefault?: boolean;
    defaultCity?: string;
  }) => Promise<LocationData>;
  checkPermissionStatus: () => Promise<"granted" | "denied" | "prompt">;
}

// Default Locations
const DEFAULT_LOCATIONS: Record<string, LocationData & { name: string }> = {
  riyadh: { lat: 24.7136, lon: 46.6753, name: "الرياض" },
  jeddah: { lat: 21.4858, lon: 39.1925, name: "جدة" },
  dammam: { lat: 26.4207, lon: 50.0888, name: "الدمام" },
  mecca: { lat: 21.3891, lon: 39.8579, name: "مكة" },
  medina: { lat: 24.5247, lon: 39.5692, name: "المدينة" },
};

export const useLocationStore = create<LocationState & LocationActions>()(
  persist(
    (set, get) => ({
      // Initial State
      userLocation: null,
      loading: false,
      error: null,
      permissionStatus: "unknown",
      lastUpdated: null,

      // Actions
      setUserLocation: (location) =>
        set({ userLocation: location, lastUpdated: Date.now() }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPermissionStatus: (status) => set({ permissionStatus: status }),

      checkPermissionStatus: async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          const permissionStatus =
            status === Location.PermissionStatus.GRANTED
              ? "granted"
              : status === Location.PermissionStatus.DENIED
              ? "denied"
              : "prompt";
          
          set({ permissionStatus });
          return permissionStatus;
        } catch (error) {
          console.error("Error checking permission:", error);
          return "prompt";
        }
      },

      getCurrentLocation: async (options = {}) => {
        const {
          maxAge = 30 * 60 * 1000, // 30 minutes
          forceRefresh = false,
          timeout = 10000,
          enableHighAccuracy = true,
          fallbackToDefault = true,
          defaultCity = "jeddah",
        } = options;

        const state = get();

        // Return cached location if valid and not forced
        if (
          !forceRefresh &&
          state.userLocation &&
          state.lastUpdated &&
          Date.now() - state.lastUpdated < maxAge
        ) {
          return state.userLocation;
        }

        // Return existing promise if loading (prevent concurrent requests)
        // Note: simplified for now, ideally we'd track the promise
        if (state.loading && !forceRefresh) {
            // If already loading, we might want to wait or just return current state if available
             if (state.userLocation) return state.userLocation;
        }

        set({ loading: true, error: null });

        try {
          // Check/Request Permissions
          let { status } = await Location.getForegroundPermissionsAsync();

          if (status !== "granted") {
            const permissionResult = await Location.requestForegroundPermissionsAsync();
            status = permissionResult.status;
          }

          const permissionStatus =
            status === "granted"
              ? "granted"
              : status === "denied"
              ? "denied"
              : "prompt";
          
          set({ permissionStatus });

          if (status !== "granted") {
            throw new Error("Location permission not granted");
          }

           // Check Services
           const hasLocationServices = await Location.hasServicesEnabledAsync();
           if (!hasLocationServices) {
             throw new Error("Location services are disabled");
           }

          // Get Location
          const locationResult = await Location.getCurrentPositionAsync({
            accuracy: enableHighAccuracy
              ? Location.Accuracy.High
              : Location.Accuracy.Balanced,
          });

          const location: LocationData = {
            lat: locationResult.coords.latitude,
            lon: locationResult.coords.longitude,
          };

           // Validate
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

          set({
            userLocation: location,
            loading: false,
            lastUpdated: Date.now(),
            permissionStatus: "granted",
          });

          return location;

        } catch (err: any) {
          console.error("Location error:", err);
          
          const locationError: LocationError = {
            code: err.code || 0,
            message: err.message || "Unknown error occurred",
          };

          set({ error: locationError, loading: false });

          if (fallbackToDefault) {
             const defaultLocation = DEFAULT_LOCATIONS[defaultCity];
             // Don't update userLocation with default if we want to keep "real" location separate,
             // but for this app it seems we want to use it.
             // However, let's NOT save default location to state as "userLocation" to avoid confusion,
             // OR we do, but maybe we should flag it?
             // For now, following original hook behavior:
             set({ userLocation: defaultLocation, lastUpdated: Date.now() }); // Treat default as current
             return defaultLocation;
          }

          throw locationError;
        }
      },
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userLocation: state.userLocation,
        lastUpdated: state.lastUpdated,
        permissionStatus: state.permissionStatus,
      }),
    }
  )
);
