// ============================
// 5. hooks/useBookings.ts - Bookings Hook
// ============================

import { Booking, BookingInsert, BookingUpdate } from "@/types/supabase";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./auth/context";

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          cars:car_id (
            id,
            daily_price,
            car_models:model_id (
              name_ar,
              name_en,
              year,
              car_brands:brand_id (
                name_ar,
                name_en
              )
            )
          ),
          branches:branch_id (
            name_ar,
            name_en,
            location_ar,
            location_en
          )
        `
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: BookingInsert) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      // Refresh bookings
      await fetchUserBookings();

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateBooking = async (bookingId: string, updates: BookingUpdate) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, ...updates } : booking
        )
      );

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const cancelBooking = async (bookingId: string) => {
    return updateBooking(bookingId, { status: "cancelled" });
  };

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  return {
    bookings,
    loading,
    error,
    fetchUserBookings,
    createBooking,
    updateBooking,
    cancelBooking,
  };
};
