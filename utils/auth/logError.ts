//utils/auth/logError.ts
import { LogErrorContext } from "@/types/authtyps";
import { AuthError } from "@supabase/supabase-js";
import Constants from "expo-constants";

export const logError = (
  operation: string,
  error: unknown,
  additionalContext?: LogErrorContext
): void => {
  const errorDetails = {
    operation,
    timestamp: new Date().toISOString(),
    error: {
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as AuthError)?.code || "NO_CODE",
      status: (error as any)?.status || "No status",
    },
    context: additionalContext || {},
    url:
      (typeof window !== "undefined" && (window as any).location?.href) ||
      Constants?.expoConfig?.extra?.APP_URL ||
      "App",
  };

  console.group(`🚨 AUTH ERROR: ${operation}`);
  console.error("Error Details:", errorDetails);
  console.error("Raw Error:", error);
  console.groupEnd();
};
