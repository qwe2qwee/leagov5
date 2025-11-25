import { signInOTPTranslations } from "@/constants/Lang/AuthLangs";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ------------------------------------
// 🔠 Type Definitions
// ------------------------------------

interface SignInOTPComponentProps {
  closeModal: () => void;
  onVerifyOTP: (otp: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
  otpLength?: number;
  emailORPhoneNumber: string;
  language: "ar" | "en";
  userId: string;
  otpType: "phone" | "email";
}

interface OTPValidationResult {
  isValid: boolean;
  message: string;
}

// ------------------------------------
// 🔧 Demo API Functions
// ------------------------------------

const demoVerifyOTP = async (
  userId: string,
  otp: string,
  otpType: "phone" | "email"
): Promise<{ success: boolean; error?: string; user?: any }> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Demo OTP validation - replace with actual API call in production
  const validOTPs = ["1234", "0000", "1111", "9999"];

  if (validOTPs.includes(otp)) {
    return {
      success: true,
      user: {
        id: userId,
        email: otpType === "email" ? "demo@example.com" : null,
        phone: otpType === "phone" ? "+966501234567" : null,
        name: "Demo User",
        verified: true,
      },
    };
  } else {
    return {
      success: false,
      error: "Invalid OTP. Please try again.",
    };
  }
};

// ------------------------------------
// 🎯 SignIn OTP Component
// ------------------------------------

const SignInOTPComponent: React.FC<SignInOTPComponentProps> = ({
  closeModal,
  onVerifyOTP,
  onResendOTP,
  otpLength = 4,
  emailORPhoneNumber,
  language,
  userId,
  otpType,
}) => {
  const { colors } = useTheme();
  const fonts = useFontFamily();
  const {
    isSmallScreen,
    isMediumScreen,
    isVerySmallScreen,
    height,
    width,
    getFontSize,
    getSpacing,
  } = useResponsive();

  // Get translations based on current language
  const t = signInOTPTranslations[language] || signInOTPTranslations.en;

  // ------------------------------------
  // 🔄 State Management
  // ------------------------------------

  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");

  // Refs for input fields
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // RTL support
  const isRTL = language === "ar";

  // ------------------------------------
  // 🕐 Timer Effect
  // ------------------------------------

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto focus first input
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
  }, []);

  // ------------------------------------
  // 🔍 Validation Functions
  // ------------------------------------

  const validateOTP = (otpString: string): OTPValidationResult => {
    if (!otpString || otpString.length !== otpLength) {
      return {
        isValid: false,
        message: t.enterCompleteOTP,
      };
    }

    if (!/^\d+$/.test(otpString)) {
      return {
        isValid: false,
        message: t.numbersOnlyError,
      };
    }

    return { isValid: true, message: "" };
  };

  // ------------------------------------
  // 🎮 Event Handlers
  // ------------------------------------

  const handleOtpChange = (value: string, index: number) => {
    // Clear error when user starts typing
    if (error) setError("");

    // Handle paste operation
    if (value.length > 1) {
      const pastedOtp = value.slice(0, otpLength).split("");
      const newOtp = [...otp];

      pastedOtp.forEach((digit, i) => {
        if (index + i < otpLength) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      // Focus last filled input or verify if complete
      const lastIndex = Math.min(index + pastedOtp.length, otpLength - 1);
      if (newOtp.join("").length === otpLength) {
        Keyboard.dismiss();
      } else {
        inputRefs.current[lastIndex]?.focus();
      }
      return;
    }

    // Handle single character input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto move to next input or verify when complete
    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (newOtp.join("").length === otpLength) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    const validation = validateOTP(otpString);

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    if (attempts >= 3) {
      setError(t.maxAttemptsReached);
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Call demo API
      const result = await demoVerifyOTP(userId, otpString, otpType);

      if (result.success) {
        // Call parent success handler
        await onVerifyOTP(otpString);
      } else {
        setAttempts((prev) => prev + 1);
        setError(result.error || t.invalidOTP);

        // Clear OTP inputs for retry
        setOtp(Array(otpLength).fill(""));
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (error) {
      setAttempts((prev) => prev + 1);
      setError(t.invalidOTP);
      console.error("OTP Verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError("");

    try {
      await onResendOTP();

      // Reset timer and states
      setResendTimer(60);
      setCanResend(false);
      setAttempts(0);
      setOtp(Array(otpLength).fill(""));

      // Show success message
      Alert.alert(t.successTitle, t.otpSent);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 500);
    } catch (error) {
      setError(t.failedToResend);
      console.error("Resend OTP failed:", error);
    } finally {
      setIsResending(false);
    }
  };

  // ------------------------------------
  // 📐 Responsive Calculations
  // ------------------------------------

  const getOTPInputSize = () => {
    const availableWidth = width - getSpacing(32); // Account for padding
    const totalMargin =
      (otpLength - 1) * (isVerySmallScreen ? 4 : isSmallScreen ? 6 : 8);
    const inputWidth = Math.min(
      (availableWidth - totalMargin) / otpLength,
      isVerySmallScreen ? 36 : isSmallScreen ? 42 : isMediumScreen ? 48 : 56
    );

    return {
      width: Math.floor(inputWidth),
      height: isVerySmallScreen
        ? 44
        : isSmallScreen
        ? 48
        : isMediumScreen
        ? 54
        : 60,
      fontSize: getFontSize
        ? getFontSize(18)
        : isVerySmallScreen
        ? 16
        : isSmallScreen
        ? 18
        : 20,
    };
  };

  const otpInputSize = getOTPInputSize();

  const styles = StyleSheet.create({
    scrollContainer: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingVertical: getSpacing ? getSpacing(16) : 16,
    },
    container: {
      paddingHorizontal: getSpacing ? getSpacing(20) : 20,
      paddingVertical: getSpacing ? getSpacing(20) : 20,
      minHeight: isVerySmallScreen
        ? 260
        : isSmallScreen
        ? 280
        : isMediumScreen
        ? 320
        : 360,
    },
    header: {
      alignItems: "center",
      marginBottom: getSpacing ? getSpacing(24) : 24,
      paddingHorizontal: 8,
    },
    title: {
      fontSize: getFontSize
        ? getFontSize(20)
        : isVerySmallScreen
        ? 18
        : isSmallScreen
        ? 20
        : 22,
      fontFamily: fonts.Bold || "System",
      color: colors.text,
      marginBottom: getSpacing ? getSpacing(8) : 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: getFontSize
        ? getFontSize(14)
        : isVerySmallScreen
        ? 12
        : isSmallScreen
        ? 14
        : 15,
      fontFamily: fonts.Regular || "System",
      color: colors.textSecondary || "#666666",
      textAlign: "center",
      lineHeight: getFontSize ? getFontSize(20) : isVerySmallScreen ? 16 : 20,
      marginBottom: getSpacing ? getSpacing(8) : 8,
      paddingHorizontal: 4,
    },
    destination: {
      fontSize: getFontSize
        ? getFontSize(15)
        : isVerySmallScreen
        ? 13
        : isSmallScreen
        ? 15
        : 16,
      fontFamily: fonts.SemiBold || "System",
      color: colors.text || "#FF5C39",
      textAlign: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.primaryLight || "#FFF5F3",
      borderRadius: 6,
      marginTop: 4,
      maxWidth: width * 0.85,
      flexShrink: 1,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: getSpacing ? getSpacing(16) : 16,
      paddingHorizontal: 4,
    },
    otpInput: {
      width: otpInputSize.width,
      height: otpInputSize.height,
      borderWidth: 2,
      borderColor: colors.border || "#e0e0e0",
      borderRadius: 8,
      fontSize: otpInputSize.fontSize,
      fontFamily: fonts.Bold || "System",
      color: colors.text,
      backgroundColor: colors.surface,
      marginHorizontal: isVerySmallScreen ? 2 : isSmallScreen ? 3 : 4,
      textAlign: "center",
    },
    otpInputFilled: {
      borderColor: colors.primary || "#FF5C39",
    },
    otpInputError: {
      borderColor: colors.error || "#FF0000",
    },
    errorText: {
      fontSize: getFontSize ? getFontSize(12) : isVerySmallScreen ? 11 : 12,
      fontFamily: fonts.Medium || "System",
      color: colors.error || "#FF0000",
      textAlign: "center",
      marginBottom: getSpacing ? getSpacing(16) : 16,
      paddingHorizontal: 16,
      lineHeight: getFontSize ? getFontSize(16) : isVerySmallScreen ? 14 : 16,
    },
    verifyButton: {
      backgroundColor: colors.primary || "#FF5C39",
      borderRadius: 8,
      paddingVertical: isVerySmallScreen ? 10 : isSmallScreen ? 12 : 14,
      paddingHorizontal: 32,
      alignItems: "center",
      marginBottom: getSpacing ? getSpacing(16) : 16,
      minHeight: isVerySmallScreen ? 40 : 44,
      justifyContent: "center",
    },
    verifyButtonDisabled: {
      opacity: 0.6,
    },
    verifyButtonText: {
      fontSize: getFontSize ? getFontSize(16) : isVerySmallScreen ? 14 : 16,
      fontFamily: fonts.SemiBold || "System",
      color: "#ffffff",
    },
    resendContainer: {
      alignItems: "center",
      marginBottom: getSpacing ? getSpacing(16) : 16,
      minHeight: isVerySmallScreen ? 28 : isSmallScreen ? 32 : 36,
      justifyContent: "center",
    },
    resendButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 4,
      minHeight: isVerySmallScreen ? 28 : 32,
      justifyContent: "center",
      alignItems: "center",
    },
    resendButtonText: {
      fontSize: getFontSize ? getFontSize(14) : isVerySmallScreen ? 12 : 14,
      fontFamily: fonts.SemiBold || "System",
      color: colors.primary || "#FF5C39",
      textDecorationLine: "underline",
    },
    timerText: {
      fontSize: getFontSize ? getFontSize(14) : isVerySmallScreen ? 12 : 14,
      fontFamily: fonts.Regular || "System",
      color: colors.textSecondary || "#666666",
      textAlign: "center",
    },
    closeButton: {
      borderWidth: 1,
      borderColor: colors.border || "#e0e0e0",
      borderRadius: 8,
      paddingVertical: isVerySmallScreen ? 8 : isSmallScreen ? 10 : 12,
      paddingHorizontal: 24,
      alignItems: "center",
      marginHorizontal: 8,
      backgroundColor: colors.surface || "#f9f9f9",
      minHeight: isVerySmallScreen ? 36 : 40,
      justifyContent: "center",
    },
    closeButtonText: {
      fontSize: getFontSize ? getFontSize(14) : isVerySmallScreen ? 12 : 14,
      fontFamily: fonts.Medium || "System",
      color: colors.textSecondary || "#666666",
    },
  });

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>
            {otpType === "phone" ? t.subtitlePhone : t.subtitleEmail}
          </Text>
          <Text style={styles.destination}>{emailORPhoneNumber}</Text>
        </View>

        {/* OTP Inputs */}
        <View style={styles.otpContainer}>
          {Array(otpLength)
            .fill("")
            .map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  otp[index] && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={otp[index]}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="numeric"
                maxLength={otpLength} // Allow paste
                textAlign="center"
                selectTextOnFocus
                blurOnSubmit={false}
                autoCorrect={false}
                autoCapitalize="none"
              />
            ))}
        </View>

        {/* Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (isVerifying || otp.join("").length !== otpLength) &&
              styles.verifyButtonDisabled,
          ]}
          onPress={handleVerifyOTP}
          disabled={isVerifying || otp.join("").length !== otpLength}
          activeOpacity={0.8}
        >
          {isVerifying ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>{t.verify}</Text>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOTP}
              disabled={isResending}
              activeOpacity={0.7}
            >
              {isResending ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.resendButtonText}>{t.resend}</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              {t.resendIn} {resendTimer} {t.seconds}
            </Text>
          )}
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={closeModal}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>{t.close}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SignInOTPComponent;
