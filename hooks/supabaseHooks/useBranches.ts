// ============================
// 6. hooks/useBranches.ts - Branches Hook
// ============================

import { supabase } from "@/lib/supabase";
import { Branch, NearestBranch } from "@/types/supabase";
import { useEffect, useState } from "react";

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("name_en");

      if (error) throw error;

      setBranches(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNearestBranches = async (
    latitude: number,
    longitude: number,
    limit = 5
  ): Promise<NearestBranch[]> => {
    try {
      const { data, error } = await supabase.rpc("get_nearest_branches", {
        _user_lat: latitude,
        _user_lon: longitude,
        _limit: limit,
      });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error("Error fetching nearest branches:", err.message);
      return [];
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return {
    branches,
    loading,
    error,
    fetchBranches,
    getNearestBranches,
  };
};
