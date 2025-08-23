// hooks/useAnnouncements.ts
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

export interface Announcement {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  priority: "low" | "normal" | "high" | "urgent";
}

export const useAnnouncements = () => {
  const [data, setData] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: announcements, error: fetchError } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setData(announcements || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch announcements")
      );
      console.error("Error fetching announcements:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();

    // Refetch when app comes to foreground (Expo/React Native specific)
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        fetchAnnouncements();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [fetchAnnouncements]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    return fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
