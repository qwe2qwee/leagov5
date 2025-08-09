import useLanguageStore from "@/store/useLanguageStore";
import { Language } from "@/types";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import { useEffect, useRef, useState } from "react";
import {
  EmitterSubscription,
  I18nManager,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";

// ------------------------------------
// 🔠 Type Definitions
// ------------------------------------

// طرق تسجيل الدخول المتاحة
type SignInMethod = "phone" | "email" | "password";

interface SignInFormData {
  value: string; // رقم الجوال أو الإيميل
  password: string; // كلمة المرور
}

interface SignInFormErrors {
  value: string;
  password: string;
}

interface ErrorMessages {
  phoneNotFound: Record<Language, string>;
  emailNotFound: Record<Language, string>;
  invalidCredentials: Record<Language, string>;
  invalidPhoneFormat: Record<Language, string>;
  invalidEmailFormat: Record<Language, string>;
  missingFields: Record<Language, string>;
  sendOtpError: Record<Language, string>;
}

// ------------------------------------
// 🔧 Demo Functions (replace with real API later)
// ------------------------------------

const demoGetLocalizedErrorMessage = (
  errorType: keyof ErrorMessages,
  language: Language
): string => {
  const messages: ErrorMessages = {
    phoneNotFound: {
      ar: "رقم الهاتف غير مسجل",
      en: "Phone number not found",
    },
    emailNotFound: {
      ar: "البريد الإلكتروني غير مسجل",
      en: "Email not found",
    },
    invalidCredentials: {
      ar: "بيانات الدخول غير صحيحة",
      en: "Invalid credentials",
    },
    invalidPhoneFormat: {
      ar: "تنسيق رقم الهاتف غير صحيح",
      en: "Invalid phone number format",
    },
    invalidEmailFormat: {
      ar: "تنسيق البريد الإلكتروني غير صحيح",
      en: "Invalid email format",
    },
    missingFields: {
      ar: "يرجى ملء جميع الحقول المطلوبة",
      en: "Please fill in all required fields",
    },
    sendOtpError: {
      ar: "فشل في إرسال رمز التحقق",
      en: "Failed to send OTP",
    },
  };

  return messages[errorType]?.[language] || "حدث خطأ";
};

// فحص وجود رقم الجوال
const demoIsPhoneExisting = async (phone: string): Promise<boolean> => {
  await new Promise((res) => setTimeout(res, 1000));
  const existingPhones = ["+966501234567", "+966509876543", "+966555123456"];
  return existingPhones.includes(phone);
};

// فحص وجود الإيميل
const demoIsEmailExisting = async (email: string): Promise<boolean> => {
  await new Promise((res) => setTimeout(res, 1000));
  const existingEmails = ["demo@example.com", "user@test.com", "admin@app.com"];
  return existingEmails.includes(email.toLowerCase());
};

// إرسال OTP لرقم الجوال
const demoSendOtpToPhone = async (phoneNumber: string): Promise<string> => {
  await new Promise((res) => setTimeout(res, 1500));
  console.log(`📱 Demo: OTP sent to phone: ${phoneNumber}`);
  const mockUserId = `user_phone_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  return mockUserId;
};

// إرسال OTP للإيميل
const demoSendOtpToEmail = async (email: string): Promise<string> => {
  await new Promise((res) => setTimeout(res, 1500));
  console.log(`📧 Demo: OTP sent to email: ${email}`);
  const mockUserId = `user_email_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  return mockUserId;
};

// تسجيل الدخول بكلمة المرور
const demoSignInWithPassword = async (
  identifier: string, // إيميل أو رقم جوال
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> => {
  await new Promise((res) => setTimeout(res, 1500));

  // Demo users with passwords
  const demoUsers = [
    {
      email: "demo@example.com",
      phone: "+966501234567",
      password: "123456",
      name: "Demo User",
      id: "user_1",
    },
    {
      email: "user@test.com",
      phone: "+966509876543",
      password: "password",
      name: "Test User",
      id: "user_2",
    },
  ];

  const user = demoUsers.find(
    (u) =>
      (u.email === identifier || u.phone === identifier) &&
      u.password === password
  );

  if (user) {
    return { success: true, user };
  } else {
    return { success: false, error: "Invalid credentials" };
  }
};

// ------------------------------------
// 🧪 Mock Auth Store
// ------------------------------------

const useDemoAuthStore = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (user: any) => {
    setCurrentUser(user);
    console.log("User signed in:", user);
  };

  return { currentUser, loading, signIn };
};

// ------------------------------------
// 🚀 Main Sign In Logic Hook
// ------------------------------------

export const useSignInLogic = () => {
  const { currentUser, signIn } = useDemoAuthStore();
  const { currentLanguage: language, isRTL } = useLanguageStore();
  const { replace } = useSafeNavigate();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const inputRef = useRef<any>(null);
  const keyboardShowSubscription = useRef<EmitterSubscription | null>(null);
  const keyboardHideSubscription = useRef<EmitterSubscription | null>(null);

  // ------------------------------------
  // 🔄 State Management
  // ------------------------------------

  const [signInMethod, setSignInMethod] = useState<SignInMethod>("phone");
  const [form, setForm] = useState<SignInFormData>({
    value: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<SignInFormErrors>({
    value: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [userId, setUserId] = useState("");
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // -------------------------
  // 🔁 Keyboard Handling
  // -------------------------

  useEffect(() => {
    const handleKeyboardShow = (event: any) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);

      // Scroll to input field when keyboard appears
      setTimeout(() => {
        if (scrollViewRef.current && inputRef.current) {
          inputRef.current.measureInWindow(
            (x: number, y: number, width: number, height: number) => {
              const screenHeight =
                require("react-native").Dimensions.get("window").height;
              const scrollToY = Math.max(
                0,
                y + height - (screenHeight - event.endCoordinates.height - 100)
              );

              if (scrollToY > 0) {
                scrollViewRef.current?.scrollTo({
                  y: scrollToY,
                  animated: true,
                });
              }
            }
          );
        }
      }, 100);
    };

    const handleKeyboardHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    keyboardShowSubscription.current = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      handleKeyboardShow
    );
    keyboardHideSubscription.current = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      handleKeyboardHide
    );

    return () => {
      keyboardShowSubscription.current?.remove();
      keyboardHideSubscription.current?.remove();
    };
  }, []);

  // -------------------------
  // 🔄 RTL Support
  // -------------------------

  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);

  // -------------------------
  // 🛠️ Helper Functions
  // -------------------------

  const showError = (message: string, success = false) => {
    setErrorMessage(message);
    setIsSuccess(success);
    setErrorModalVisible(true);
  };

  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
    setErrorMessage("");
    setIsSuccess(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // -------------------------
  // 🔍 Validation Functions
  // -------------------------

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) {
      return demoGetLocalizedErrorMessage(
        "missingFields",
        language as Language
      );
    }

    const formattedPhone = phone.startsWith("+966")
      ? phone
      : `+966${phone.trim()}`;
    const phoneRegex = /^\+966\d{9}$/;

    if (!phoneRegex.test(formattedPhone)) {
      return demoGetLocalizedErrorMessage(
        "invalidPhoneFormat",
        language as Language
      );
    }

    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return demoGetLocalizedErrorMessage(
        "missingFields",
        language as Language
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return demoGetLocalizedErrorMessage(
        "invalidEmailFormat",
        language as Language
      );
    }

    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password.trim()) {
      return demoGetLocalizedErrorMessage(
        "missingFields",
        language as Language
      );
    }

    return "";
  };

  const validateField = (
    field: keyof SignInFormData,
    value: string
  ): string => {
    switch (field) {
      case "value":
        if (signInMethod === "phone") {
          return validatePhone(value);
        } else if (signInMethod === "email") {
          return validateEmail(value);
        } else {
          // For password method, value could be email or phone
          const phoneError = validatePhone(value);
          const emailError = validateEmail(value);

          // If both validations fail, return phone error (default)
          if (phoneError && emailError) {
            return "Invalid email or phone number format";
          }
          return "";
        }
      case "password":
        return validatePassword(value);
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: SignInFormErrors = {
      value: validateField("value", form.value),
      password:
        signInMethod === "password"
          ? validateField("password", form.password)
          : "",
    };

    setFieldErrors(newErrors);

    const errorList = Object.values(newErrors).filter(Boolean);
    if (errorList.length > 0) {
      showError(errorList[0]); // Show first error
      return false;
    }

    return true;
  };

  // -------------------------
  // 🔄 Input Handlers
  // -------------------------

  const handleInputChange = (field: keyof SignInFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    const error = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSignInMethodChange = (method: SignInMethod) => {
    setSignInMethod(method);
    setForm({ value: "", password: "" });
    setFieldErrors({ value: "", password: "" });
  };

  // -------------------------
  // 🔐 Sign In Functions
  // -------------------------

  const handleSignInWithOTP = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let formattedValue = form.value.trim();
      let userExists = false;

      if (signInMethod === "phone") {
        formattedValue = formattedValue.startsWith("+966")
          ? formattedValue
          : `+966${formattedValue}`;
        userExists = await demoIsPhoneExisting(formattedValue);

        if (!userExists) {
          showError(
            demoGetLocalizedErrorMessage("phoneNotFound", language as Language)
          );
          return;
        }

        const userIdFromPhone = await demoSendOtpToPhone(formattedValue);
        setUserId(userIdFromPhone);
      } else {
        userExists = await demoIsEmailExisting(formattedValue);

        if (!userExists) {
          showError(
            demoGetLocalizedErrorMessage("emailNotFound", language as Language)
          );
          return;
        }

        const userIdFromEmail = await demoSendOtpToEmail(formattedValue);
        setUserId(userIdFromEmail);
      }

      setIsOtpModalVisible(true);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      showError(
        demoGetLocalizedErrorMessage("sendOtpError", language as Language)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let formattedValue = form.value.trim();

      // Format phone number if it looks like a phone
      if (
        !/\S+@\S+\.\S+/.test(formattedValue) &&
        /^\d{9}$/.test(formattedValue)
      ) {
        formattedValue = `+966${formattedValue}`;
      }

      const result = await demoSignInWithPassword(
        formattedValue,
        form.password
      );

      if (result.success && result.user) {
        await signIn(result.user);
        replace("/(tabs)");
      } else {
        showError(
          demoGetLocalizedErrorMessage(
            "invalidCredentials",
            language as Language
          )
        );
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      showError(
        demoGetLocalizedErrorMessage("invalidCredentials", language as Language)
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // 📱 OTP Handlers
  // -------------------------

  const handleOtpSuccess = async () => {
    setIsOtpModalVisible(false);
    // Mock user data - in real app, get from API
    const mockUser = {
      id: userId,
      email: signInMethod === "email" ? form.value : null,
      phone: signInMethod === "phone" ? form.value : null,
      name: "Demo User",
    };

    await signIn(mockUser);
    replace("/(tabs)");
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      let formattedValue = form.value.trim();

      if (signInMethod === "phone") {
        formattedValue = formattedValue.startsWith("+966")
          ? formattedValue
          : `+966${formattedValue}`;
        await demoSendOtpToPhone(formattedValue);
      } else {
        await demoSendOtpToEmail(formattedValue);
      }

      showError(
        language === "ar"
          ? "تم إعادة إرسال رمز التحقق"
          : "OTP resent successfully",
        true
      );
    } catch (error) {
      showError(
        demoGetLocalizedErrorMessage("sendOtpError", language as Language)
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // 📤 Return API
  // ------------------------------------

  return {
    // State
    signInMethod,
    form,
    fieldErrors,
    loading,
    isOtpModalVisible,
    userId,
    errorModalVisible,
    errorMessage,
    isSuccess,
    isKeyboardVisible,
    keyboardHeight,
    language,
    isRTL,
    currentUser,

    // Refs
    scrollViewRef,
    inputRef,

    // Functions
    handleInputChange,
    handleSignInMethodChange,
    handleSignInWithOTP,
    handleSignInWithPassword,
    handleOtpSuccess,
    handleResendOtp,
    showError,
    handleErrorModalClose,
    dismissKeyboard,
    validateForm,
    setIsOtpModalVisible,
  };
};
