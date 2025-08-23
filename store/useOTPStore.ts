// store/useOTPStore.ts
import { create } from "zustand";

export type OTPStep = "input" | "verify" | "success" | "error";
export type ContactMethod = "email" | "phone";
export type AuthAction =
  | "signup"
  | "signin"
  | "forgot-password"
  | "change-contact";

interface OTPState {
  // Main state
  step: OTPStep;
  isLoading: boolean;
  error: string | null;

  // Contact info
  contactMethod: ContactMethod;
  contactValue: string; // email or phone
  maskedContact: string; // for display (e.g., jo**@gmail.com, +966 5** *** **12)

  // OTP info
  otpCode: string;
  otpLength: number;
  resendCount: number;
  maxResendAttempts: number;
  countdown: number; // seconds until can resend

  // Auth context
  action: AuthAction;
  userData?: any; // for signup flow

  // Actions
  setStep: (step: OTPStep) => void;
  setContactInfo: (method: ContactMethod, value: string) => void;
  setOTPCode: (code: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAction: (action: AuthAction, userData?: any) => void;

  // OTP operations
  sendOTP: () => Promise<boolean>;
  verifyOTP: () => Promise<boolean>;
  resendOTP: () => Promise<boolean>;

  // Utilities
  canResend: () => boolean;
  getMaskedContact: (method: ContactMethod, value: string) => string;
  startCountdown: () => void;

  // Reset
  reset: () => void;
}

const useOTPStore = create<OTPState>((set, get) => ({
  // Initial state
  step: "input",
  isLoading: false,
  error: null,

  contactMethod: "email",
  contactValue: "",
  maskedContact: "",

  otpCode: "",
  otpLength: 6,
  resendCount: 0,
  maxResendAttempts: 3,
  countdown: 0,

  action: "signup",
  userData: undefined,

  // Actions
  setStep: (step) => set({ step, error: null }),

  setContactInfo: (method, value) => {
    const masked = get().getMaskedContact(method, value);
    set({
      contactMethod: method,
      contactValue: value,
      maskedContact: masked,
      error: null,
    });
  },

  setOTPCode: (code) => set({ otpCode: code, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  setAction: (action, userData) => set({ action, userData }),

  // OTP operations
  sendOTP: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      // Import auth hook inside the function to avoid circular dependencies

      // This is a workaround - in real implementation, you'd need to access auth context
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate success
      set({
        step: "verify",
        isLoading: false,
        resendCount: state.resendCount + 1,
      });

      get().startCountdown();
      return true;
    } catch (error: any) {
      set({
        error: error.message || "Failed to send verification code",
        isLoading: false,
      });
      return false;
    }
  },

  verifyOTP: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      if (state.otpCode.length !== state.otpLength) {
        throw new Error("Please enter complete verification code");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate verification
      if (state.otpCode === "123456") {
        // Mock success code
        set({ step: "success", isLoading: false });
        return true;
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (error: any) {
      set({
        error: error.message || "Verification failed",
        isLoading: false,
      });
      return false;
    }
  },

  resendOTP: async () => {
    const state = get();

    if (!state.canResend()) {
      set({ error: "Please wait before requesting another code" });
      return false;
    }

    if (state.resendCount >= state.maxResendAttempts) {
      set({ error: "Maximum resend attempts reached" });
      return false;
    }

    return await state.sendOTP();
  },

  // Utilities
  canResend: () => {
    const state = get();
    return state.countdown === 0 && state.resendCount < state.maxResendAttempts;
  },

  getMaskedContact: (method: ContactMethod, value: string) => {
    if (method === "email") {
      const [username, domain] = value.split("@");
      if (username.length <= 2) return value;
      return `${username.slice(0, 2)}${"*".repeat(
        username.length - 2
      )}@${domain}`;
    } else {
      // Phone masking
      if (value.length <= 6) return value;
      const start = value.slice(0, 4);
      const end = value.slice(-2);
      const middle = "*".repeat(value.length - 6);
      return `${start} ${middle} ${end}`;
    }
  },

  startCountdown: () => {
    set({ countdown: 60 }); // 1 minute countdown

    const interval = setInterval(() => {
      const currentCountdown = get().countdown;
      if (currentCountdown <= 1) {
        set({ countdown: 0 });
        clearInterval(interval);
      } else {
        set({ countdown: currentCountdown - 1 });
      }
    }, 1000);
  },

  reset: () =>
    set({
      step: "input",
      isLoading: false,
      error: null,
      contactMethod: "email",
      contactValue: "",
      maskedContact: "",
      otpCode: "",
      resendCount: 0,
      countdown: 0,
      action: "signup",
      userData: undefined,
    }),
}));

export default useOTPStore;
