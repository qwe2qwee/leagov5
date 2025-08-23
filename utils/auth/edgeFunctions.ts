// /hooks/auth/utils/edgeFunctions.ts
import { Language } from "@/types";
import { AuthOperationResult } from "@/types/AuthTypes";
import { EdgeFunctionRequest } from "@/types/authtyps";
import Constants from "expo-constants";
import { getLocalizedErrorMessage } from "./errorMessages";
import { logError } from "./logError";
import { createPhoneNormalizer } from "./phoneValidator";

const FUNCTIONS_URLVeryfiy: string =
  Constants?.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URLVeryfiy ||
  process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URLVeryfiy ||
  "";

const FUNCTIONS_URLSend: string =
  Constants?.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URLSend ||
  process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URLSend ||
  "";

export interface VerifyOtpRequest {
  phone: string;
  otp_code: string;
  session_id?: string;
}

const phoneNormalizer = createPhoneNormalizer();

export const sendOtpRequest = async (
  phone: string,
  language: Language = "en"
): Promise<AuthOperationResult> => {
  try {
    if (!FUNCTIONS_URLSend) {
      throw new Error("Supabase functions URL not configured");
    }

    const phoneValidation = phoneNormalizer(phone);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      return { error: phoneValidation.error };
    }

    const requestBody: EdgeFunctionRequest = {
      phone: phoneValidation.normalized,
    };

    const response = await fetch(`${FUNCTIONS_URLSend}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const json = await response.json();
    if (!response.ok) throw json || new Error("Failed to send OTP");
    return { data: json };
  } catch (error) {
    logError("SEND_OTP_REQUEST", error, { phone });
    return {
      error: getLocalizedErrorMessage("networkError", language),
    };
  }
};

export const verifyOtpRequest = async (
  phone: string,
  token: string,
  sessionId?: string, // Optional session ID
  language: Language = "en"
): Promise<AuthOperationResult> => {
  try {
    if (!FUNCTIONS_URLVeryfiy) {
      throw new Error("Supabase functions URL not configured");
    }

    const phoneValidation = phoneNormalizer(phone);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      return { error: phoneValidation.error };
    }

    if (!token || typeof token !== "string") {
      return { error: "OTP code is required" };
    }

    const requestBody: VerifyOtpRequest = {
      phone: phoneValidation.normalized,
      otp_code: token, // Changed from token to otp_code
      ...(sessionId && { session_id: sessionId }),
    };

    // 🔍 Debug log
    console.log("📤 VERIFY_OTP_REQUEST BODY:", requestBody);

    const response = await fetch(`${FUNCTIONS_URLVeryfiy}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const json = await response.json();

    // 🔍 Debug log
    console.log("📥 VERIFY_OTP_RESPONSE:", json);

    if (!response.ok) {
      throw json || new Error("OTP verification failed");
    }

    // Handle successful response with temp_password
    if (json.success && json.temp_password) {
      console.log("✅ OTP verified! Temporary password received");
      // Store temp password securely for immediate use
      return {
        data: {
          ...json,
          // Make sure to use temp_password for sign-in
          tempPassword: json.temp_password,
        },
      };
    }

    return { data: json };
  } catch (error: any) {
    logError("VERIFY_OTP_REQUEST", error, { phone, token });

    // Return server error message directly
    if (error?.error || error?.message) {
      return { error: error.error || error.message };
    }

    // Default fallback
    return {
      error: getLocalizedErrorMessage("networkError", language),
    };
  }
};
