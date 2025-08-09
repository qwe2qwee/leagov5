import InputField from "@/components/Auth/InputField";
import VerificationEandP from "@/components/Auth/VerifictionEandP";
import CustomButton from "@/components/ui/CustomButton";
import { forgetResetTranslations } from "@/constants/Lang/AuthLangs";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Demo icons
const icons = {
  backArrow: { uri: "https://cdn-icons-png.flaticon.com/512/2223/2223615.png" },
  smartphone: { uri: "https://cdn-icons-png.flaticon.com/512/644/644458.png" },
};

// Demo API functions
const isPhoneNumberExisting = async (phoneNumber: string): Promise<boolean> => {
  console.log(`📡 Demo: Checking if phone ${phoneNumber} exists`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const existingPhones = ["+966501234567", "+966509876543", "+966555123456"];
  return existingPhones.includes(phoneNumber);
};

const isEmailExisting = async (email: string): Promise<boolean> => {
  console.log(`📧 Demo: Checking if email ${email} exists`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const existingEmails = ["demo@example.com", "user@test.com", "admin@app.com"];
  return existingEmails.includes(email.toLowerCase());
};

const sendOtpToPhone = async (phoneNumber: string): Promise<string> => {
  console.log(`📱 Demo: Sending OTP to phone: ${phoneNumber}`);
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const mockUserId = `user_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  return mockUserId;
};

const sendOtpToEmail = async (email: string): Promise<void> => {
  console.log(`📧 Demo: Sending OTP to email: ${email}`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return Promise.resolve();
};

interface ForgetResetProps {
  type: "email" | "phone";
  onSuccessRedirect?: string;
}

const ForgetReset: React.FC<ForgetResetProps> = ({
  type,
  onSuccessRedirect = "/(auth)",
}) => {
  const [form, setForm] = useState({ value: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [userId, setUserId] = useState("");

  // Enhanced keyboard handling state
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );

  const { colors } = useTheme();
  const fonts = useFontFamily();
  const { isSmallScreen } = useResponsive();
  const { currentLanguage: language } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { push, replace, forceUnlock, isNavigationLocked } = useSafeNavigate();

  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const isPhone = type === "phone";
  const t = forgetResetTranslations[language];

  // Enhanced keyboard event listeners with proper cleanup
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      handleKeyboardShow
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      handleKeyboardHide
    );

    // Handle screen dimension changes
    const dimensionListener = Dimensions.addEventListener(
      "change",
      ({ window }) => {
        setScreenHeight(window.height);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
      dimensionListener?.remove();
    };
  }, []);

  const handleKeyboardShow = useCallback((event: KeyboardEvent) => {
    setKeyboardVisible(true);
    setKeyboardHeight(event.endCoordinates.height);
  }, []);

  const handleKeyboardHide = useCallback(() => {
    setKeyboardVisible(false);
    setKeyboardHeight(0);
  }, []);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  }, []);

  // Enhanced focus handling
  const handleInputFocus = useCallback(() => {
    // Small delay to ensure keyboard is shown
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleChangeText = useCallback((value: string) => {
    setForm({ value });
  }, []);

  const handleBackPress = useCallback(() => {
    // التأكد من عدم وجود عمليات معلقة قبل الانتقال
    if (isLoading) {
      toast.showWarning(t.pleaseWait, {
        duration: 2000,
        position: "top",
      });
      return;
    }

    dismissKeyboard();

    // إذا كان النافيجيشن مقفول، فتحه
    if (isNavigationLocked) {
      forceUnlock();
    }

    replace("/(auth)/sign-in");
  }, [
    dismissKeyboard,
    isLoading,
    isNavigationLocked,
    forceUnlock,
    t.pleaseWait,
    toast,
    replace,
  ]);

  const handleSendOtp = async () => {
    // التحقق من حالة القفل قبل البدء
    if (isNavigationLocked) {
      console.log("Navigation is locked, preventing OTP send");
      toast.showWarning(t.navigationLocked, {
        duration: 3000,
        position: "top",
      });
      return;
    }

    // التحقق من الحقل الفارغ
    if (!form.value.trim()) {
      toast.showWarning(t.errorEmptyField, {
        duration: 3000,
        position: "top",
      });
      return;
    }

    // التحقق من صحة البيانات المدخلة
    if (isPhone) {
      if (!/^\d{9}$/.test(form.value.trim())) {
        toast.showError(t.errorInvalidPhone, {
          duration: 4000,
          position: "top",
        });
        return;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.value.trim())) {
        toast.showError(t.errorInvalidEmail, {
          duration: 4000,
          position: "top",
        });
        return;
      }
    }

    dismissKeyboard();
    setIsLoading(true);

    const formattedValue = isPhone
      ? `+966${form.value.trim()}`
      : form.value.trim();

    // إظهار رسالة التحقق
    toast.showInfo(isPhone ? t.checkingPhone : t.checkingEmail, {
      duration: 2000,
      position: "top",
    });

    try {
      if (isPhone) {
        const phoneExists = await isPhoneNumberExisting(formattedValue);
        if (!phoneExists) {
          toast.showError(t.errorPhoneNotFound, {
            duration: 4000,
            position: "top",
          });
          return;
        }

        // إظهار رسالة إرسال OTP
        toast.showInfo(t.sendingOtp, {
          duration: 2000,
          position: "top",
        });

        const userIdFromPhone = await sendOtpToPhone(formattedValue);
        setUserId(userIdFromPhone);
      } else {
        const emailExists = await isEmailExisting(formattedValue);
        if (!emailExists) {
          toast.showError(t.errorEmailNotFound, {
            duration: 4000,
            position: "top",
          });
          return;
        }

        // إظهار رسالة إرسال OTP
        toast.showInfo(t.sendingOtp, {
          duration: 2000,
          position: "top",
        });

        await sendOtpToEmail(formattedValue);
      }

      // إظهار رسالة نجاح إرسال OTP باستخدام التراجم
      const successMessage = isPhone ? t.otpSentPhone : t.otpSentEmail;

      toast.showSuccess(successMessage, {
        duration: 3000,
        position: "top",
      });

      setIsOtpModalVisible(true);
    } catch (error: any) {
      console.error("Failed to send OTP:", error);

      // تحديد نوع الخطأ وعرض الرسالة المناسبة
      let errorMessage = t.sendOtpError;

      if (
        error?.message?.includes("Network") ||
        error?.message?.includes("network")
      ) {
        errorMessage = t.networkError;
      } else if (
        error?.message?.includes("Server") ||
        error?.message?.includes("server")
      ) {
        errorMessage = t.serverError;
      }

      toast.showError(errorMessage, {
        duration: 4000,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = useCallback(() => {
    setIsOtpModalVisible(false);

    // إظهار رسالة نجاح التحقق باستخدام التراجم
    toast.showSuccess(t.verificationSuccessful, {
      duration: 3000,
      position: "top",
    });

    // التأكد من فتح أي قفل قبل الانتقال
    if (isNavigationLocked) {
      forceUnlock();
    }

    // الانتقال بعد فترة قصيرة مع إضافة force option
    setTimeout(() => {
      replace("/(auth)/reset/ResetPassword", { force: true });
    }, 1500);
  }, [
    t.verificationSuccessful,
    toast,
    isNavigationLocked,
    forceUnlock,
    replace,
  ]);

  const handleSwitchType = useCallback(() => {
    // منع التبديل أثناء التحميل
    if (isLoading) {
      toast.showWarning(t.pleaseWait, {
        duration: 2000,
        position: "top",
      });
      return;
    }

    dismissKeyboard();

    // فتح القفل قبل الانتقال
    if (isNavigationLocked) {
      forceUnlock();
    }

    // تأخير بسيط للتأكد من فتح القفل
    setTimeout(() => {
      replace(isPhone ? "/(auth)/reset/email" : "/(auth)/reset/phone", {
        force: true,
      });
    }, 100);
  }, [
    dismissKeyboard,
    isPhone,
    isLoading,
    isNavigationLocked,
    forceUnlock,
    t.pleaseWait,
    toast,
    replace,
  ]);

  // إضافة تنظيف عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      // تنظيف أي عمليات معلقة
      if (isNavigationLocked) {
        forceUnlock();
      }
    };
  }, [isNavigationLocked, forceUnlock]);

  // Calculate proper keyboard offset based on safe area
  const keyboardVerticalOffset = Platform.select({
    ios: insets.bottom,
    android: 0,
  });

  const styles = createStyles(
    colors,
    fonts,
    isSmallScreen,
    keyboardVisible,
    keyboardHeight,
    insets
  );

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
          <View style={styles.container}>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Back Button */}
              <View style={styles.backButtonContainer}>
                <TouchableOpacity
                  onPress={handleBackPress}
                  style={[
                    styles.backButton,
                    isLoading && styles.disabledButton,
                  ]}
                  activeOpacity={isLoading ? 1 : 0.7}
                  disabled={isLoading}
                  accessibilityLabel={t.backButtonHint}
                  accessibilityHint={t.backButtonHint}
                >
                  <Image
                    source={icons.backArrow}
                    style={[styles.backIcon, isLoading && styles.disabledIcon]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              {/* Page Content */}
              <View style={styles.contentContainer}>
                <Image
                  source={icons.smartphone}
                  resizeMode="contain"
                  style={[styles.phoneIcon, { tintColor: colors.primary }]}
                />

                <Text style={styles.title}>
                  {isPhone ? t.enterPhone : t.enterEmail}
                </Text>

                <InputField
                  label=""
                  placeholder={
                    isPhone ? t.phonePlaceholder : t.emailPlaceholder
                  }
                  value={form.value}
                  onChangeText={handleChangeText}
                  maxLength={isPhone ? 9 : undefined}
                  onFocus={handleInputFocus}
                  editable={!isLoading}
                  keyboardType={isPhone ? "numeric" : "email-address"}
                  autoCapitalize={isPhone ? "none" : "none"}
                  autoCorrect={false}
                  accessibilityLabel={isPhone ? t.phoneLabel : t.emailLabel}
                />

                <View style={styles.switchContainer}>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      isLoading && styles.disabledSwitchButton,
                    ]}
                    onPress={handleSwitchType}
                    activeOpacity={isLoading ? 1 : 0.7}
                    disabled={isLoading}
                    accessibilityLabel={t.switchTypeHint}
                    accessibilityHint={t.switchTypeHint}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        isLoading && styles.disabledSwitchText,
                      ]}
                    >
                      {isPhone ? t.switchToEmail : t.switchToPhone}
                    </Text>
                  </TouchableOpacity>
                </View>

                <CustomButton
                  title={isLoading ? t.loading : t.continue}
                  loading={isLoading}
                  onPress={handleSendOtp}
                  disabled={isLoading || isNavigationLocked}
                  accessibilityLabel={t.continueButtonHint}
                  accessibilityHint={t.continueButtonHint}
                />
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      {isOtpModalVisible && (
        <VerificationEandP
          ismodal={isOtpModalVisible}
          form={{ value: form.value }}
          userId={userId}
          close={() => setIsOtpModalVisible(false)}
          onSuccess={handleOtpSuccess}
          isphone={isPhone}
        />
      )}
    </View>
  );
};

const createStyles = (
  colors: any,
  fonts: any,
  isSmallScreen: boolean,
  keyboardVisible: boolean,
  keyboardHeight: number,
  insets: any
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: Platform.select({
        ios: keyboardVisible ? 20 : insets.bottom + 20,
        android: keyboardVisible ? keyboardHeight * 0.1 : 20,
      }),
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    backButtonContainer: {
      width: "100%",
      alignItems: "flex-start",
      paddingHorizontal: 10,
      paddingTop: 5,
      paddingBottom: keyboardVisible ? 20 : 50,
    },
    backButton: {
      backgroundColor: colors.surface,
      borderRadius: 25,
      padding: 12,
    },
    disabledButton: {
      backgroundColor: colors.disabled || colors.surface,
      opacity: 0.6,
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: colors.icon,
    },
    disabledIcon: {
      tintColor: colors.textSecondary || colors.icon,
    },
    phoneIcon: {
      width: isSmallScreen ? 140 : 180,
      height: isSmallScreen ? 120 : 160,
      marginBottom: keyboardVisible ? 10 : 20,
    },
    title: {
      fontFamily: fonts.Bold || fonts.SemiBold,
      color: colors.text,
      marginTop: keyboardVisible ? 10 : 24,
      marginBottom: keyboardVisible ? 20 : 48,
      fontSize: isSmallScreen ? 16 : 18,
      textAlign: "center",
    },
    switchContainer: {
      width: "100%",
      paddingHorizontal: 8,
      paddingRight: 12,
      paddingTop: 4,
      flexDirection: "row-reverse",
      justifyContent: "flex-start",
      alignItems: "center",
      marginBottom: keyboardVisible ? 40 : 80,
    },
    switchButton: {
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    disabledSwitchButton: {
      opacity: 0.5,
    },
    switchText: {
      color: colors.error,
      fontSize: 12,
      fontFamily: fonts.Medium || fonts.Regular,
    },
    disabledSwitchText: {
      color: colors.textSecondary || colors.error,
    },
  });

export default ForgetReset;
