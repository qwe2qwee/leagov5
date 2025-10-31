// /hooks/auth/utils/edgeFunctions.ts
import { Language } from "@/types";
import { AuthOperationResult } from "@/types/AuthTypes";
import { EdgeFunctionRequest } from "@/types/authtyps";
import Constants from "expo-constants";
import { getLocalizedErrorMessage } from "./errorMessages";
import { logError } from "./logError";
import { createPhoneNormalizer } from "./phoneValidator";

// ✅ الحصول على الـ URLs الصحيحة
const SUPABASE_URL =
  Constants?.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "";

const SUPABASE_ANON_KEY =
  Constants?.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// ✅ بناء الـ URLs الصحيحة
const FUNCTIONS_URL_BASE = `${SUPABASE_URL}/functions/v1`;
const FUNCTIONS_URL_SEND = `${FUNCTIONS_URL_BASE}/send-otp`;
const FUNCTIONS_URL_VERIFY = `${FUNCTIONS_URL_BASE}/verify-otp`;

export interface VerifyOtpRequest {
  phone: string;
  otp_code: string;
  session_id?: string;
}

const phoneNormalizer = createPhoneNormalizer();

// ✅ دالة مساعدة للـ Headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`, // ✅ مهم جداً!
  apikey: SUPABASE_ANON_KEY, // ✅ بعض Edge Functions تحتاجه
});

// ========================================================================
// إرسال OTP
// ========================================================================
export const sendOtpRequest = async (
  phone: string,
  language: Language = "en"
): Promise<AuthOperationResult> => {
  try {
    // ✅ التحقق من التكوين
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("❌ Supabase configuration missing:", {
        hasUrl: !!SUPABASE_URL,
        hasKey: !!SUPABASE_ANON_KEY,
      });
      throw new Error("Supabase not configured");
    }

    console.log("📤 Sending OTP to:", phone);
    console.log("🔗 URL:", FUNCTIONS_URL_SEND);

    // ✅ التحقق من صحة الرقم
    const phoneValidation = phoneNormalizer(phone);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      console.error("❌ Invalid phone:", phoneValidation.error);
      return { error: phoneValidation.error };
    }

    console.log("✅ Normalized phone:", phoneValidation.normalized);

    const requestBody: EdgeFunctionRequest = {
      phone: phoneValidation.normalized,
    };

    console.log("📦 Request body:", requestBody);

    // ✅ الطلب مع الـ Headers الصحيحة
    const response = await fetch(FUNCTIONS_URL_SEND, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log("📡 Response status:", response.status);

    const json = await response.json();
    console.log("📥 Response data:", json);

    if (!response.ok) {
      console.error("❌ Request failed:", json);
      throw json || new Error("Failed to send OTP");
    }

    if (!json.success) {
      console.error("❌ OTP send failed:", json);
      return { error: json.error || "Failed to send OTP" };
    }

    console.log("✅ OTP sent successfully!");
    return { data: json };
  } catch (error: any) {
    console.error("❌ sendOtpRequest error:", error);
    logError("SEND_OTP_REQUEST", error, { phone });

    return {
      error:
        error?.error ||
        error?.message ||
        getLocalizedErrorMessage("networkError", language),
    };
  }
};

// ========================================================================
// التحقق من OTP
// ========================================================================
export const verifyOtpRequest = async (
  phone: string,
  token: string,
  sessionId?: string,
  language: Language = "en"
): Promise<AuthOperationResult> => {
  try {
    // ✅ التحقق من التكوين
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("❌ Supabase configuration missing");
      throw new Error("Supabase not configured");
    }

    console.log("📤 Verifying OTP for:", phone);
    console.log("🔗 URL:", FUNCTIONS_URL_VERIFY);

    // ✅ التحقق من صحة الرقم
    const phoneValidation = phoneNormalizer(phone);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      console.error("❌ Invalid phone:", phoneValidation.error);
      return { error: phoneValidation.error };
    }

    // ✅ التحقق من OTP
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      console.error("❌ Invalid OTP token");
      return { error: "OTP code is required" };
    }

    console.log("✅ Normalized phone:", phoneValidation.normalized);
    console.log("✅ OTP token length:", token.length);

    const requestBody: VerifyOtpRequest = {
      phone: phoneValidation.normalized,
      otp_code: token,
      ...(sessionId && { session_id: sessionId }),
    };

    console.log("📦 Request body:", {
      ...requestBody,
      otp_code: "***", // إخفاء OTP في الـ logs
    });

    // ✅ الطلب مع الـ Headers الصحيحة
    const response = await fetch(FUNCTIONS_URL_VERIFY, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
    });

    console.log("📡 Response status:", response.status);

    const json = await response.json();
    console.log("📥 Response data:", {
      ...json,
      temp_password: json.temp_password ? "***" : undefined,
    });

    if (!response.ok) {
      console.error("❌ Verification failed:", json);
      throw json || new Error("OTP verification failed");
    }

    if (!json.success) {
      console.error("❌ OTP invalid:", json);
      return { error: json.error || "Invalid OTP code" };
    }

    // ✅ نجح التحقق
    console.log("✅ OTP verified successfully!");

    if (json.temp_password) {
      console.log("✅ Temporary password received");
      return {
        data: {
          ...json,
          tempPassword: json.temp_password,
        },
      };
    }

    return { data: json };
  } catch (error: any) {
    console.error("❌ verifyOtpRequest error:", error);
    logError("VERIFY_OTP_REQUEST", error, { phone, token: "***" });

    return {
      error:
        error?.error ||
        error?.message ||
        getLocalizedErrorMessage("networkError", language),
    };
  }
};

// ========================================================================
// دالة اختبار (للتطوير فقط)
// ========================================================================
export const testConfiguration = () => {
  console.log("🔧 Edge Functions Configuration:");
  console.log("  SUPABASE_URL:", SUPABASE_URL?.substring(0, 30) + "...");
  console.log(
    "  SUPABASE_ANON_KEY:",
    SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"
  );
  console.log("  SEND URL:", FUNCTIONS_URL_SEND);
  console.log("  VERIFY URL:", FUNCTIONS_URL_VERIFY);

  return {
    isConfigured: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
    sendUrl: FUNCTIONS_URL_SEND,
    verifyUrl: FUNCTIONS_URL_VERIFY,
  };
};
