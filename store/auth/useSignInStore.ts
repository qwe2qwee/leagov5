import useLanguageStore from "@/store/useLanguageStore";
import { Language } from "@/types";
import { create } from "zustand";

// ------------------------------------
// 🔠 Type Definitions
// ------------------------------------

type SignInMethod = "phone" | "email" | "password";

interface SignInFormData {
  value: string; // email, phone, or username based on method
  password: string;
}

interface SignInFormErrors {
  value: string;
  password: string;
}

interface SignInFormState {
  form: SignInFormData;
  fieldErrors: SignInFormErrors;
  signInMethod: SignInMethod;
  isSigningIn: boolean;
}

interface SignInFormActions {
  handleInputChange: (field: keyof SignInFormData, value: string) => void;
  handleSignInMethodChange: (method: SignInMethod) => void;
  setForm: (form: Partial<SignInFormData>) => void;
  resetForm: () => void;
  validateField: (field: keyof SignInFormData, value: string) => string;
  validateForm: () => boolean;
  setFieldErrors: (errors: Partial<SignInFormErrors>) => void;
  clearFieldErrors: () => void;
  formatPhoneNumber: (phone: string) => string;
  setIsSigningIn: (loading: boolean) => void;
  resetState: () => void;
  handleSignInWithOTP: () => Promise<void>;
  handleSignInWithPassword: () => Promise<void>;
  showError: (message: string, success?: boolean) => void;
  getLocalizedMessage: (key: string) => string;
}

type SignInFormStore = SignInFormState & SignInFormActions;

// ------------------------------------
// 🏪 Initial State
// ------------------------------------

const initialFormData: SignInFormData = {
  value: "",
  password: "",
};

const initialFieldErrors: SignInFormErrors = {
  value: "",
  password: "",
};

const initialState: SignInFormState = {
  form: initialFormData,
  fieldErrors: initialFieldErrors,
  signInMethod: "phone",
  isSigningIn: false,
};

// ------------------------------------
// 🏪 Zustand Store
// ------------------------------------

export const useSignInStore = create<SignInFormStore>((set, get) => ({
  ...initialState,

  handleInputChange: (field, value) => {
    set((state) => ({
      form: { ...state.form, [field]: value },
      fieldErrors: { ...state.fieldErrors, [field]: "" }, // Clear error on change
    }));
  },

  handleSignInMethodChange: (method) => {
    set((state) => ({
      signInMethod: method,
      form: { ...initialFormData }, // Reset form when method changes
      fieldErrors: { ...initialFieldErrors }, // Clear errors
    }));
  },

  setForm: (formData) => {
    set((state) => ({
      form: { ...state.form, ...formData },
    }));
  },

  resetForm: () => {
    set(() => ({
      form: { ...initialFormData },
      fieldErrors: { ...initialFieldErrors },
      // Keep signInMethod as is, don't reset it
    }));
  },

  formatPhoneNumber: (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, "");

    if (digitsOnly.startsWith("966")) {
      return `+${digitsOnly}`;
    } else if (digitsOnly.startsWith("0")) {
      return `+966${digitsOnly.substring(1)}`;
    } else if (digitsOnly.length === 9) {
      return `+966${digitsOnly}`;
    } else if (digitsOnly.length === 10 && digitsOnly.startsWith("5")) {
      return `+966${digitsOnly}`;
    }

    return phone;
  },

  getLocalizedMessage: (key: string): string => {
    const { currentLanguage } = useLanguageStore.getState();

    const messages: Record<string, Record<Language, string>> = {
      missingFields: {
        ar: "يرجى ملء جميع الحقول المطلوبة",
        en: "Please fill in all required fields",
      },
      invalidPhoneFormat: {
        ar: "رقم الهاتف يجب أن يبدأ بـ 05 ويكون 10 أرقام",
        en: "Phone number must start with 05 and be 10 digits",
      },
      invalidEmailFormat: {
        ar: "تنسيق البريد الإلكتروني غير صحيح",
        en: "Invalid email format",
      },
      phoneNotFound: {
        ar: "رقم الهاتف غير مسجل",
        en: "Phone number not found",
      },
      emailNotFound: {
        ar: "البريد الإلكتروني غير مسجل",
        en: "Email not found",
      },
      otpSentPhone: {
        ar: "تم إرسال رمز التحقق إلى رقم الهاتف",
        en: "Verification code sent to your phone",
      },
      otpSentEmail: {
        ar: "تم إرسال رمز التحقق إلى البريد الإلكتروني",
        en: "Verification code sent to your email",
      },
      signInSuccess: {
        ar: "تم تسجيل الدخول بنجاح",
        en: "Signed in successfully",
      },
      invalidFormat: {
        ar: "تنسيق البريد الإلكتروني أو رقم الهاتف غير صحيح",
        en: "Invalid email or phone number format",
      },
      phoneRequired: {
        ar: "رقم الهاتف مطلوب",
        en: "Phone number is required",
      },
      emailRequired: {
        ar: "البريد الإلكتروني مطلوب",
        en: "Email is required",
      },
      passwordRequired: {
        ar: "كلمة المرور مطلوبة",
        en: "Password is required",
      },
      passwordMinLength: {
        ar: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        en: "Password must be at least 6 characters",
      },
      smsUnavailable: {
        ar: "SMS غير متوفر حالياً، يرجى استخدام البريد الإلكتروني",
        en: "SMS service unavailable, please use email",
      },
    };

    return (
      messages[key]?.[currentLanguage as Language] || messages[key]?.en || key
    );
  },

  validateField: (field, value) => {
    const { signInMethod, formatPhoneNumber, getLocalizedMessage } = get();

    switch (field) {
      case "value":
        if (!value.trim()) {
          switch (signInMethod) {
            case "phone":
              return getLocalizedMessage("phoneRequired");
            case "email":
              return getLocalizedMessage("emailRequired");
            case "password":
              return getLocalizedMessage("missingFields");
            default:
              return getLocalizedMessage("missingFields");
          }
        }

        // Validate based on sign-in method
        if (signInMethod === "phone") {
          const formattedPhone = formatPhoneNumber(value);
          if (!/^\+966[5][0-9]{8}$/.test(formattedPhone)) {
            return getLocalizedMessage("invalidPhoneFormat");
          }
        } else if (signInMethod === "email") {
          if (!/^\S+@\S+\.\S+$/.test(value)) {
            return getLocalizedMessage("invalidEmailFormat");
          }
        } else if (signInMethod === "password") {
          // For password method, accept both email and phone
          const isEmail = value.includes("@");
          const isPhone = /^[0-9+\-\s()]+$/.test(value);

          if (isEmail) {
            if (!/^\S+@\S+\.\S+$/.test(value)) {
              return getLocalizedMessage("invalidEmailFormat");
            }
          } else if (isPhone) {
            const formattedPhone = formatPhoneNumber(value);
            if (!/^\+966[5][0-9]{8}$/.test(formattedPhone)) {
              return getLocalizedMessage("invalidPhoneFormat");
            }
          } else {
            return getLocalizedMessage("invalidFormat");
          }
        }
        break;

      case "password":
        if (!value.trim()) {
          return getLocalizedMessage("passwordRequired");
        }
        if (value.length < 6) {
          return getLocalizedMessage("passwordMinLength");
        }
        break;

      default:
        return "";
    }

    return "";
  },

  validateForm: () => {
    const { form, signInMethod, validateField, setFieldErrors } = get();
    const errors: Partial<SignInFormErrors> = {};
    let isValid = true;

    // Validate value field
    const valueError = validateField("value", form.value);
    if (valueError) {
      errors.value = valueError;
      isValid = false;
    }

    // Validate password field (only for password method)
    if (signInMethod === "password") {
      const passwordError = validateField("password", form.password);
      if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }
    }

    // Set errors
    setFieldErrors(errors);

    return isValid;
  },

  setFieldErrors: (errors) => {
    set((state) => ({
      fieldErrors: { ...state.fieldErrors, ...errors },
    }));
  },

  clearFieldErrors: () => {
    set(() => ({
      fieldErrors: { ...initialFieldErrors },
    }));
  },

  setIsSigningIn: (loading) => {
    set(() => ({
      isSigningIn: loading,
    }));
  },

  resetState: () => {
    set(() => initialState);
  },

  showError: (message: string, success = false) => {
    // You can implement error handling here
    // For now, just log to console
    console.log(success ? "Success:" : "Error:", message);
  },

  handleSignInWithOTP: async () => {
    const {
      form,
      signInMethod,
      validateForm,
      formatPhoneNumber,
      setIsSigningIn,
      getLocalizedMessage,
    } = get();

    if (!validateForm()) {
      return;
    }

    setIsSigningIn(true);

    try {
      // You'll need to implement these auth functions
      // This is just a placeholder structure
      let formattedValue = form.value.trim();

      if (signInMethod === "phone") {
        formattedValue = formatPhoneNumber(formattedValue);

        // Simulate API call - replace with actual auth logic
        console.log("Sending OTP to phone:", formattedValue);

        // Show success message
        get().showError(getLocalizedMessage("otpSentPhone"), true);
      } else if (signInMethod === "email") {
        console.log("Sending OTP to email:", formattedValue);

        // Show success message
        get().showError(getLocalizedMessage("otpSentEmail"), true);
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Sign in with OTP failed:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : getLocalizedMessage("smsUnavailable");

      get().showError(errorMessage);

      // Set appropriate field errors
      set((state) => ({
        fieldErrors: {
          ...state.fieldErrors,
          value: errorMessage,
        },
      }));
    } finally {
      setIsSigningIn(false);
    }
  },

  handleSignInWithPassword: async () => {
    const {
      form,
      validateForm,
      formatPhoneNumber,
      setIsSigningIn,
      getLocalizedMessage,
    } = get();

    if (!validateForm()) {
      return;
    }

    setIsSigningIn(true);

    try {
      let formattedValue = form.value.trim();

      // Format phone number if it's a phone number
      if (!/^\S+@\S+\.\S+$/.test(form.value)) {
        formattedValue = formatPhoneNumber(form.value);
      }

      // Simulate API call - replace with actual auth logic
      console.log("Signing in with password:", {
        value: formattedValue,
        password: form.password,
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      get().showError(getLocalizedMessage("signInSuccess"), true);

      // Handle success (navigate to main app)
      // This is where you'd typically handle successful login
    } catch (error) {
      console.error("Sign in with password failed:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Sign in failed. Please try again.";

      get().showError(errorMessage);

      // Handle error - set appropriate field errors
      set((state) => ({
        fieldErrors: {
          ...state.fieldErrors,
          value: errorMessage,
        },
      }));
    } finally {
      setIsSigningIn(false);
    }
  },
}));
