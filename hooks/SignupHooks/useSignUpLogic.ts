import { generateRandomPassword } from "@/constants";
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

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface FormErrors {
  name: string;
  email: string;
  phone: string;
}

interface ErrorMessages {
  emailExists: Record<Language, string>;
  phoneNumberExists: Record<Language, string>;
}

// ------------------------------------
// 🔧 Demo Functions (replace later)
// ------------------------------------

const demoGetLocalizedErrorMessage = (
  errorType: keyof ErrorMessages,
  language: Language
): string => {
  const messages: ErrorMessages = {
    emailExists: {
      ar: "البريد الإلكتروني موجود بالفعل",
      en: "Email already exists",
    },
    phoneNumberExists: {
      ar: "رقم الهاتف موجود بالفعل",
      en: "Phone number already exists",
    },
  };

  return messages[errorType]?.[language] || "حدث خطأ";
};

const demoIsEmailExisting = async (email: string) => {
  await new Promise((res) => setTimeout(res, 1000));
  return email === "demo@example.com";
};

const demoIsPhoneNumberExisting = async (phone: string) => {
  await new Promise((res) => setTimeout(res, 1000));
  return phone === "+966123456789";
};

const demoUpdatePhoneNumberAndSendOTP = async (
  phone: string,
  language: string
) => {
  await new Promise((res) => setTimeout(res, 1500));
  console.log(`Demo: OTP sent to ${phone} in ${language}`);
};

// ------------------------------------
// 🧪 Mock Auth Store
// ------------------------------------

const useDemoAuthStore = () => {
  const [user, setUser] = useState<any>(null);

  const createUser = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    birthday: string,
    gender: string,
    address: string,
    language: string
  ) => {
    await new Promise((res) => setTimeout(res, 2000));
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      phone,
      birthday,
      gender,
      address,
      language,
    };
    setUser(newUser);
    return newUser;
  };

  return { user, createUser };
};

// ------------------------------------
// 🚀 Main Logic Hook
// ------------------------------------

export const useSignUpLogic = () => {
  const { user, createUser } = useDemoAuthStore();
  const { currentLanguage: language, isRTL } = useLanguageStore();
  const { replace } = useSafeNavigate();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const keyboardShowSubscription = useRef<EmitterSubscription | null>(null);
  const keyboardHideSubscription = useRef<EmitterSubscription | null>(null);

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const birthday = "1999-01-01";
  const gender = "other";
  const address = "unknown";

  // -------------------------
  // 🔁 Keyboard Handling
  // -------------------------

  useEffect(() => {
    const handleKeyboardShow = (event: any) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
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
  // 🛠️ Handlers
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

  const validateField = (field: keyof FormData, value: string): string => {
    switch (field) {
      case "name":
        return !value.trim()
          ? "Name is required"
          : value.length < 2
          ? "Name must be at least 2 characters"
          : "";
      case "email":
        return !value.trim()
          ? "Email is required"
          : !/^\S+@\S+\.\S+$/.test(value)
          ? "Invalid email format"
          : "";
      case "phone":
        return !value.trim()
          ? "Phone number is required"
          : !/^\+966\d{9}$/.test(value)
          ? "Invalid phone number format"
          : "";
      default:
        return "";
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      phone: validateField("phone", form.phone),
    };

    setFieldErrors(newErrors);

    const errorList = Object.values(newErrors).filter(Boolean);
    if (errorList.length > 0) {
      showError(errorList.join("\n"));
      return false;
    }

    return true;
  };

  const handleOtpSubmit = async (verify: string) => {
    if (verify !== "ok") return;

    setLoading(true);
    try {
      const password = generateRandomPassword(16, true, true, true);
      const newUser = await createUser(
        form.email,
        password,
        form.name,
        form.phone,
        birthday,
        gender,
        address,
        language
      );

      console.log("User created successfully:", newUser);

      setForm({ name: "", email: "", password: "", phone: "" });
      setFieldErrors({ name: "", email: "", phone: "" });
      setModalVisible(false);
      replace("/(tabs)");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await demoUpdatePhoneNumberAndSendOTP(form.phone, language);
      showError("OTP resent successfully", true);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const onSignUpPress = async () => {
    Keyboard.dismiss();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (await demoIsEmailExisting(form.email)) {
        throw new Error(
          demoGetLocalizedErrorMessage("emailExists", language as Language)
        );
      }

      if (await demoIsPhoneNumberExisting(form.phone)) {
        throw new Error(
          demoGetLocalizedErrorMessage(
            "phoneNumberExists",
            language as Language
          )
        );
      }

      await demoUpdatePhoneNumberAndSendOTP(form.phone, language);
      setModalVisible(true);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error during signup");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // 📤 Return API
  // ------------------------------------

  return {
    // State
    form,
    loading,
    isModalVisible,
    errorModalVisible,
    errorMessage,
    isSuccess,
    isKeyboardVisible,
    keyboardHeight,
    fieldErrors,
    language,
    isRTL,
    scrollViewRef,
    user,

    // Functions
    handleInputChange,
    onSignUpPress,
    handleOtpSubmit,
    handleResendOtp,
    showError,
    handleErrorModalClose,
    setModalVisible,
    validateForm,
  };
};
