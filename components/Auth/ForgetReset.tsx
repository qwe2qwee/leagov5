import { forgetResetTranslations } from "@/constants/Lang/AuthLangs";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
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
import CustomButton from "../ui/CustomButton";
import InputField from "./InputField";
import VerifictionEandP from "./VerifictionEandP";

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

// Demo language store
const useLanguageStore = () => ({
  currentLanguage: "en" as "ar" | "en",
  isRTL: false,
});

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
    // Check for pending operations before navigation
    if (isLoading) {
      toast.showWarning(t.pleaseWait, {
        duration: 2000,
        position: "top",
      });
      return;
    }

    dismissKeyboard();

    // If navigation is locked, unlock it
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

  // Validation helper functions
  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.trim();
    return cleanPhone.length === 9 && /^\d{9}$/.test(cleanPhone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSendOtp = async () => {
    // Check lock state before starting
    if (isNavigationLocked) {
      console.log("Navigation is locked, preventing OTP send");
      toast.showWarning(t.navigationLocked, {
        duration: 2000,
        position: "top",
      });
      return;
    }

    // Validate empty field
    if (!form.value.trim()) {
      toast.showWarning(t.errorEmptyField, {
        duration: 3000,
        position: "top",
      });
      return;
    }

    // Enhanced validation
    if (isPhone && !validatePhoneNumber(form.value)) {
      toast.showError(t.errorInvalidPhone, {
        duration: 3000,
        position: "top",
      });
      return;
    }

    if (!isPhone && !validateEmail(form.value)) {
      toast.showError(t.errorInvalidEmail, {
        duration: 3000,
        position: "top",
      });
      return;
    }

    dismissKeyboard();
    setIsLoading(true);
    const formattedValue = isPhone
      ? `+966${form.value.trim()}`
      : form.value.trim();

    try {
      // Show checking message
      toast.showInfo(isPhone ? t.checkingPhone : t.checkingEmail, {
        duration: 1500,
        position: "top",
      });

      if (isPhone) {
        const phoneExists = await isPhoneNumberExisting(formattedValue);
        if (!phoneExists) {
          toast.showError(t.errorPhoneNotFound, {
            duration: 4000,
            position: "top",
          });
          return;
        }

        // Show sending message
        toast.showInfo(t.sendingOtp, {
          duration: 1000,
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

        // Show sending message
        toast.showInfo(t.sendingOtp, {
          duration: 1000,
          position: "top",
        });

        await sendOtpToEmail(formattedValue);
      }

      // Show success message using translation
      toast.showSuccess(isPhone ? t.otpSentPhone : t.otpSentEmail, {
        duration: 3000,
        position: "top",
      });

      setIsOtpModalVisible(true);
    } catch (error) {
      console.error("Failed to send OTP:", error);

      // Enhanced error handling
      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("Network")
        ) {
          toast.showError(t.networkError, {
            duration: 4000,
            position: "top",
          });
        } else if (
          error.message.includes("server") ||
          error.message.includes("Server")
        ) {
          toast.showError(t.serverError, {
            duration: 4000,
            position: "top",
          });
        } else {
          toast.showError(t.sendOtpError, {
            duration: 4000,
            position: "top",
          });
        }
      } else {
        toast.showError(t.sendOtpError, {
          duration: 4000,
          position: "top",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = useCallback(() => {
    setIsOtpModalVisible(false);

    // Show success verification message
    toast.showSuccess(t.verificationSuccessful, {
      duration: 3000,
      position: "top",
    });

    // Ensure any lock is released before navigation
    if (isNavigationLocked) {
      forceUnlock();
    }

    // Navigate after short delay with force option
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
    // Prevent switching during loading
    if (isLoading) {
      toast.showWarning(t.pleaseWait, {
        duration: 2000,
        position: "top",
      });
      return;
    }

    dismissKeyboard();

    // Unlock before navigation
    if (isNavigationLocked) {
      forceUnlock();
    }

    // Small delay to ensure unlock
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

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any pending operations
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
                  accessibilityRole="button"
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
                    accessibilityRole="button"
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
                />
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      {isOtpModalVisible && (
        <VerifictionEandP
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
      paddingHorizontal: 1,
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
