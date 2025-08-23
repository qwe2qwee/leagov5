// ============================
// 2. lib/supabase.ts - Main Supabase Setup
// ============================

import { Database } from "@/types/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL; // e.g., 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string,
  {
    auth: {
      // Configure auth to use AsyncStorage for React Native
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    // Optional: Configure realtime
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
);
