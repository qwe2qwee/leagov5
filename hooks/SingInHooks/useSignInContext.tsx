import { Language } from "@/types";
import React, { createContext, ReactNode, useContext } from "react";
import { ScrollView } from "react-native";
import { useSignInLogic } from "./useSignInLogic";

// ------------------------------------
// 🔠 Type Definitions
// ------------------------------------

type SignInMethod = "phone" | "email" | "password";

interface SignInFormData {
  value: string; // رقم الجوال أو الإيميل
  password: string; // كلمة المرور
}

interface SignInFormErrors {
  value: string;
  password: string;
}

interface SignInContextType {
  // ------------------------------------
  // 🔄 States
  // ------------------------------------
  signInMethod: SignInMethod;
  form: SignInFormData;
  fieldErrors: SignInFormErrors;
  loading: boolean;
  isOtpModalVisible: boolean;
  userId: string;
  errorModalVisible: boolean;
  errorMessage: string;
  isSuccess: boolean;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  language: Language;
  isRTL: boolean;
  currentUser: any;

  // ------------------------------------
  // 📝 Refs
  // ------------------------------------
  scrollViewRef: React.RefObject<ScrollView | null>;
  inputRef: React.RefObject<any>;

  // ------------------------------------
  // 🛠️ Functions
  // ------------------------------------

  // Input & Form Management
  handleInputChange: (field: keyof SignInFormData, value: string) => void;
  handleSignInMethodChange: (method: SignInMethod) => void;
  validateForm: () => boolean;

  // Sign In Actions
  handleSignInWithOTP: () => Promise<void>;
  handleSignInWithPassword: () => Promise<void>;

  // OTP Management
  handleOtpSuccess: () => Promise<void>;
  handleResendOtp: () => Promise<void>;

  // Modal & Error Management
  showError: (message: string, success?: boolean) => void;
  handleErrorModalClose: () => void;
  setIsOtpModalVisible: (visible: boolean) => void;

  // Utility Functions
  dismissKeyboard: () => void;
}

// ------------------------------------
// 🏗️ Context Creation
// ------------------------------------

const SignInContext = createContext<SignInContextType | undefined>(undefined);

interface SignInProviderProps {
  children: ReactNode;
}

// ------------------------------------
// 🎯 Provider Component
// ------------------------------------

export const SignInProvider: React.FC<SignInProviderProps> = ({ children }) => {
  const signInLogic = useSignInLogic();

  return (
    <SignInContext.Provider value={signInLogic}>
      {children}
    </SignInContext.Provider>
  );
};

// ------------------------------------
// 🪝 Custom Hook
// ------------------------------------

export const useSignInContext = (): SignInContextType => {
  const context = useContext(SignInContext);

  if (!context) {
    throw new Error(
      "useSignInContext must be used within a SignInProvider. " +
        "Make sure to wrap your component with <SignInProvider>"
    );
  }

  return context;
};

// ------------------------------------
// 🎨 Helper Hook for Method-Specific UI
// ------------------------------------

export const useSignInMethodConfig = () => {
  const { signInMethod, language } = useSignInContext();

  // تكوين واجهة المستخدم حسب طريقة تسجيل الدخول
  const getMethodConfig = () => {
    switch (signInMethod) {
      case "phone":
        return {
          inputLabel: language === "ar" ? "رقم الجوال" : "Phone Number",
          inputPlaceholder: language === "ar" ? "5xxxxxxxx" : "5xxxxxxxx",
          buttonText: language === "ar" ? "إرسال رمز التحقق" : "Send OTP",
          keyboardType: "phone-pad" as const,
          maxLength: 9,
          showPasswordField: false,
          icon: "phone", // استخدم الآيكون المناسب
        };

      case "email":
        return {
          inputLabel: language === "ar" ? "البريد الإلكتروني" : "Email",
          inputPlaceholder:
            language === "ar" ? "example@domain.com" : "example@domain.com",
          buttonText: language === "ar" ? "إرسال رمز التحقق" : "Send OTP",
          keyboardType: "email-address" as const,
          maxLength: undefined,
          showPasswordField: false,
          icon: "email", // استخدم الآيكون المناسب
        };

      case "password":
        return {
          inputLabel:
            language === "ar"
              ? "البريد الإلكتروني أو رقم الجوال"
              : "Email or Phone",
          inputPlaceholder:
            language === "ar"
              ? "example@domain.com أو 5xxxxxxxx"
              : "example@domain.com or 5xxxxxxxx",
          buttonText: language === "ar" ? "تسجيل الدخول" : "Sign In",
          keyboardType: "default" as const,
          maxLength: undefined,
          showPasswordField: true,
          icon: "user", // استخدم الآيكون المناسب
        };

      default:
        return {
          inputLabel: "",
          inputPlaceholder: "",
          buttonText: "",
          keyboardType: "default" as const,
          maxLength: undefined,
          showPasswordField: false,
          icon: "user",
        };
    }
  };

  const config = getMethodConfig();

  // نصوص إضافية للواجهة
  const getTexts = () => ({
    // عناوين طرق تسجيل الدخول
    phoneMethodTitle: language === "ar" ? "رقم الجوال" : "Phone Number",
    emailMethodTitle: language === "ar" ? "البريد الإلكتروني" : "Email",
    passwordMethodTitle: language === "ar" ? "كلمة المرور" : "Password",

    // نصوص كلمة المرور
    passwordLabel: language === "ar" ? "كلمة المرور" : "Password",
    passwordPlaceholder:
      language === "ar" ? "أدخل كلمة المرور" : "Enter password",

    // نصوص أخرى
    forgotPassword:
      language === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?",
    orText: language === "ar" ? "أو" : "OR",
    switchToOTP: language === "ar" ? "استخدام رمز التحقق" : "Use OTP instead",
    switchToPassword:
      language === "ar" ? "استخدام كلمة المرور" : "Use Password instead",

    // نصوص التنقل
    createAccount:
      language === "ar" ? "ليس لديك حساب؟" : "Don't have an account?",
    signUpLink: language === "ar" ? "سجل الآن" : "Sign Up",
  });

  return {
    ...config,
    texts: getTexts(),
    isOTPMethod: signInMethod === "phone" || signInMethod === "email",
    isPasswordMethod: signInMethod === "password",
  };
};

// ------------------------------------
// 🔄 Export Types (for external use)
// ------------------------------------

export type {
  SignInContextType,
  SignInFormData,
  SignInFormErrors,
  SignInMethod,
};
