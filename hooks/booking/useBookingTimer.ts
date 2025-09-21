import { supabase } from "@/lib/supabase";
import { useToast } from "@/store/useToastStore";
import { useCallback, useEffect, useState } from "react";

interface BookingTimerState {
  timeRemaining: number | null;
  isExpired: boolean;
  isLoading: boolean;
}

export const useBookingTimer = (
  bookingId?: string,
  expiresAt?: string | null
) => {
  const [state, setState] = useState<BookingTimerState>({
    timeRemaining: null,
    isExpired: false,
    isLoading: false,
  });

  const toast = useToast();

  const calculateTimeRemaining = useCallback(() => {
    if (!expiresAt) return null;

    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    return Math.max(0, Math.floor(diff / 1000)); // in seconds
  }, [expiresAt]);

  const runCleanup = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.functions.invoke(
        "cleanup-expired-bookings"
      );

      if (error) {
        console.error("Error running cleanup:", error);
      } else {
        console.log("Cleanup result:", data);
        if (data?.expired_bookings > 0) {
          toast.showSuccess("تم تنظيف الحجوزات المنتهية", {
            duration: 3000,
            position: "top",
          });
        }
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      setState({ timeRemaining: null, isExpired: false, isLoading: false });
      return;
    }

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();

      if (remaining === null) return;

      if (remaining <= 0) {
        setState((prev) => ({ ...prev, timeRemaining: 0, isExpired: true }));
        // Run cleanup when booking expires
        runCleanup();
        return;
      }

      setState((prev) => ({
        ...prev,
        timeRemaining: remaining,
        isExpired: false,
      }));
    };

    // Initial calculation
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, calculateTimeRemaining, runCleanup]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getWarningLevel = () => {
    if (!state.timeRemaining) return "normal";
    if (state.timeRemaining <= 300) return "critical"; // 5 minutes
    if (state.timeRemaining <= 600) return "warning"; // 10 minutes
    return "normal";
  };

  return {
    timeRemaining: state.timeRemaining,
    isExpired: state.isExpired,
    isLoading: state.isLoading,
    formatTime: state.timeRemaining ? formatTime(state.timeRemaining) : null,
    warningLevel: getWarningLevel(),
    runCleanup,
  };
};
