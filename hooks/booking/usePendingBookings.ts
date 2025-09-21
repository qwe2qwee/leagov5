import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../supabaseHooks/auth/context";

interface PendingBooking {
  id: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  car_name: string;
  is_expired: boolean;
}

interface UsePendingBookingsReturn {
  pendingBookings: PendingBooking[];
  loading: boolean;
  error: string | null;
  refreshPendingBookings: () => Promise<void>;
  hasPendingBookings: boolean;
  hasExpiredBookings: boolean;
}

export const usePendingBookings = (): UsePendingBookingsReturn => {
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPendingBookings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        "check-user-pending-bookings",
        {
          headers: {
            Authorization: `Bearer ${
              (
                await supabase.auth.getSession()
              ).data.session?.access_token
            }`,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      if (data?.success) {
        setPendingBookings(data.pending_bookings || []);

        // If cleanup was triggered, wait a moment then refresh
        if (data.cleanup_triggered) {
          setTimeout(() => {
            refreshPendingBookings();
          }, 2000);
        }
      } else {
        throw new Error(data?.error || "Failed to fetch pending bookings");
      }
    } catch (err: any) {
      console.error("Error fetching pending bookings:", err);
      setError(err.message || "Failed to load pending bookings");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshPendingBookings();

      // Set up automatic refresh every 30 seconds
      const interval = setInterval(refreshPendingBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [user, refreshPendingBookings]);

  const hasPendingBookings = pendingBookings.length > 0;
  const hasExpiredBookings = pendingBookings.some(
    (booking) => booking.is_expired
  );

  return {
    pendingBookings,
    loading,
    error,
    refreshPendingBookings,
    hasPendingBookings,
    hasExpiredBookings,
  };
};
