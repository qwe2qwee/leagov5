// ============================
// context/LocationContext.tsx - Centralized Location Management
// ============================

import { useLocation } from "@/hooks/useLocation";
import React, { createContext, ReactNode, useContext } from "react";

// Define the shape of our context
interface LocationContextType {
  userLocation: { lat: number; lon: number } | null;
  loading: boolean;
  error: { code: number; message: string } | null;
  permissionStatus: "granted" | "denied" | "prompt" | "unknown";
  defaultLocations: {
    riyadh: { lat: number; lon: number; name: string };
    jeddah: { lat: number; lon: number; name: string };
    dammam: { lat: number; lon: number; name: string };
    mecca: { lat: number; lon: number; name: string };
    medina: { lat: number; lon: number; name: string };
  };
  getCurrentLocation: (options?: {
    maxAge?: number;
    forceRefresh?: boolean;
    timeout?: number;
    enableHighAccuracy?: boolean;
    fallbackToDefault?: boolean;
    defaultCity?: "riyadh" | "jeddah" | "dammam" | "mecca" | "medina";
  }) => Promise<{ lat: number; lon: number }>;
  refreshLocation: (
    defaultCity?: "riyadh" | "jeddah" | "dammam" | "mecca" | "medina"
  ) => Promise<{ lat: number; lon: number }>;
  setCustomLocation: (location: {
    lat: number;
    lon: number;
  }) => Promise<boolean>;
  clearCachedLocation: () => Promise<boolean>;
  calculateDistance: (
    from: { lat: number; lon: number },
    to: { lat: number; lon: number }
  ) => number;
  getStorageInfo: () => Promise<{
    hasCachedLocation: boolean;
    cachedLocation: any;
    lastUpdate: Date | null;
    isExpired: boolean | null;
  }>;
  checkPermissionStatus: () => Promise<"granted" | "denied" | "prompt">;
  hasLocation: boolean;
  isLocationCached: boolean;
}

// Create the context with undefined as default
const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

// Provider Props
interface LocationProviderProps {
  children: ReactNode;
}

/**
 * LocationProvider - Provides centralized location management
 * 
 * This provider wraps the useLocation hook and shares a single instance
 * across all components, preventing multiple permission requests and
 * improving performance.
 */
export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  // Single instance of useLocation hook
  const locationData = useLocation();

  return (
    <LocationContext.Provider value={locationData}>
      {children}
    </LocationContext.Provider>
  );
};

/**
 * useLocationContext - Hook to access location context
 * 
 * @throws Error if used outside of LocationProvider
 * @returns LocationContextType - All location data and methods
 * 
 * @example
 * ```tsx
 * const { userLocation, calculateDistance } = useLocationContext();
 * 
 * if (userLocation) {
 *   const distance = calculateDistance(userLocation, carLocation);
 * }
 * ```
 */
export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);

  if (context === undefined) {
    throw new Error(
      "useLocationContext must be used within a LocationProvider. " +
        "Make sure your component is wrapped with <LocationProvider>."
    );
  }

  return context;
};

// Export the context for advanced use cases
export { LocationContext };
