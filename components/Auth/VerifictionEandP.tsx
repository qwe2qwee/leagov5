import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

import { translationsVerificationForgot } from "@/constants/Lang/AuthLangs";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore"; // 👈 استخدام التوست الجديد
import { useToast } from "@/store/useToastStore";
import { icons } from "../../constants";
import CustomButton from "../ui/CustomButton";
import CustomOtpInputs from "./CustomOtpInputs";

// Demo functions - replace with actual implementations
const demoAppwriteApi = {
  completePasswordReset: async (userId: string, otp: string) => {
    console.log("Demo: completePasswordReset called with:", { userId, otp });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true };
  },

  getUserIdByPhoneOrEmail: async (identifier: string) => {
    console.log("Demo: getUserIdByPhoneOrEmail called with:", identifier);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `demo_user_${Math.random().toString(36).substr(2, 9)}`;
  },

  sendOtpToEmail: async (email: string) => {
    console.log("Demo: sendOtpToEmail called with:", email);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true };
  },

  sendOtpToPhone: async (phone: string) => {
    console.log("Demo: sendOtpToPhone called with:", phone);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true };
  },

  verifyOtpAndResetPassword: async (userId: string, otp: string) => {
    console.log("Demo: verifyOtpAndResetPassword called with:", {
      userId,
      otp,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true };
  },
};

// Demo auth store hook
const useDemoAuthStore = () => ({
  getCurrentUser: async () => {
    console.log("Demo: getCurrentUser called");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: "demo_user", name: "Demo User" };
  },
});

interface VerificationProps {
  ismodal: boolean;
  form: {
    phone?: string;
    email?: string;
    value?: string;
    [key: string]: any;
  };
  onSuccess?: () => void;
  isphone: boolean;
  close: () => void;
  userId?: string;
  navigateToReset?: string;
}

const VerificationEandP: React.FC<VerificationProps> = ({
  ismodal,
  form,
  onSuccess,
  isphone,
  close,
  userId,
  navigateToReset = "/ResetPassword",
}) => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasResentOtp, setHasResentOtp] = useState(false);

  const { colors } = useTheme();
  const fontFamily = useFontFamily();
  const responsive = useResponsive();
  const { currentLanguage: language } = useLanguageStore();
  const { getCurrentUser } = useDemoAuthStore();
  const toast = useToast(); // 👈 استخدام التوست الجديد

  const t = translationsVerificationForgot[language];
  const identifier = isphone ? `+966${form?.value}` : form?.value;

  const handleResendOtp = async () => {
    if (hasResentOtp) return;

    try {
      if (isphone) {
        await demoAppwriteApi.sendOtpToPhone(identifier!);
      } else {
        await demoAppwriteApi.sendOtpToEmail(identifier!);
      }

      setHasResentOtp(true);

      // 👈 استخدام التوست للنجاح
      toast.showSuccess(t.codeResent, {
        duration: 3000,
        position: "top",
      });
    } catch (error) {
      console.error("Error resending OTP:", error);

      // 👈 استخدام التوست للأخطاء
      toast.showError(t.resendOtpError, {
        duration: 4000,
        position: "top",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      // 👈 استخدام التوست للتحذير
      toast.showWarning(t.fullOtpRequired, {
        duration: 3000,
        position: "top",
      });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let userIdToVerify = userId as any;

      if (!userIdToVerify) {
        userIdToVerify = await demoAppwriteApi.getUserIdByPhoneOrEmail(
          identifier!
        );
        if (!userIdToVerify) {
          // 👈 استخدام التوست للخطأ
          toast.showError(t.userNotFound, {
            duration: 4000,
            position: "top",
          });
          return;
        }
      }

      if (isphone) {
        await demoAppwriteApi.verifyOtpAndResetPassword(userIdToVerify, otp);
      } else {
        await demoAppwriteApi.completePasswordReset(userIdToVerify, otp);
      }

      // 👈 استخدام التوست للنجاح
      toast.showSuccess(t.otpSuccess, {
        duration: 3000,
        position: "top",
      });

      await getCurrentUser();

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error verifying OTP:", error);

      // 👈 استخدام التوست للخطأ
      toast.showError(t.otpError, {
        duration: 4000,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
      setHasResentOtp(false);
      setOtp("");
    }
  };

  const onClose = () => {
    setHasResentOtp(false);
    close();
  };

  const styles = createStyles(colors, fontFamily, responsive);

  return (
    <Modal
      isVisible={ismodal}
      animationIn="fadeIn"
      animationInTiming={300}
      animationOut="fadeOut"
      animationOutTiming={300}
      onBackdropPress={onClose}
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      propagateSwipe
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Header with Close Button */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Image source={icons.close} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {isphone ? t.verifyPhone : t.verifyEmail}
            </Text>

            {/* Description */}
            <Text style={styles.description}>
              {isphone ? t.otpPromptPhone : t.otpPromptEmail}
            </Text>

            {/* Identifier (Phone/Email) */}
            <Text style={styles.identifier}>{identifier}</Text>

            {/* OTP Input - 4 digits */}
            <View style={styles.otpContainer}>
              <CustomOtpInputs
                numberOfInputs={4} // 👈 تأكيد أنه 4 خانات
                onChangeOtp={(value) => setOtp(value)}
                autoFocus={true}
              />
            </View>

            {/* Continue Button */}
            <CustomButton
              title={t.continue}
              style={styles.continueButton}
              onPress={handleVerifyOtp}
              loading={isSubmitting}
              disabled={isSubmitting || otp.length < 4} // 👈 التحقق من 4 أرقام
            />

            {/* Resend Code Button */}
            <TouchableOpacity
              disabled={hasResentOtp || isSubmitting}
              onPress={handleResendOtp}
              style={[
                styles.resendButton,
                (hasResentOtp || isSubmitting) && styles.resendButtonDisabled,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text
                style={[
                  styles.resendText,
                  (hasResentOtp || isSubmitting) && styles.resendTextDisabled,
                ]}
              >
                {hasResentOtp ? t.codeResent : t.resendCode}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 
        👈 لا حاجة لـ ErrorModal بعد الآن!
        <ErrorModal
          isVisible={!!error}
          message={error || ""}
          onClose={clearError}
          isSecuss={isSecuss}
          language={language}
        />
      */}
    </Modal>
  );
};

const createStyles = (colors: any, fontFamily: any, responsive: any) => {
  const {
    width,
    height,
    isVerySmallScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    getResponsiveValue,
    getFontSize,
    getSpacing,
  } = responsive;

  return StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: getSpacing(16),
      paddingVertical: getSpacing(20),
    },
    container: {
      width: "100%",
      maxWidth: isSmallScreen ? width * 0.95 : Math.min(400, width * 0.9),
      alignSelf: "center",
      backgroundColor: colors.background,
      borderRadius: getResponsiveValue(12, 14, 16, 18),
      padding: getSpacing(24),
    },
    header: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      marginBottom: getSpacing(16),
    },
    closeButton: {
      padding: getSpacing(8),
      borderRadius: 20,
      backgroundColor: colors.inputBackground || "transparent",
    },
    closeIcon: {
      width: getResponsiveValue(20, 22, 24, 26),
      height: getResponsiveValue(20, 22, 24, 26),
      tintColor: colors.icon || colors.text,
    },
    title: {
      fontSize: getFontSize(isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20),
      color: colors.primary,
      fontFamily: fontFamily?.Bold || "System",
      textAlign: "center",
      marginBottom: getSpacing(8),
      lineHeight: getFontSize(isVerySmallScreen ? 22 : isSmallScreen ? 24 : 26),
    },
    description: {
      fontSize: getFontSize(isVerySmallScreen ? 14 : 16),
      color: colors.textSecondary || colors.text,
      fontFamily: fontFamily?.Regular || "System",
      textAlign: "center",
      marginBottom: getSpacing(8),
      lineHeight: getFontSize(isVerySmallScreen ? 20 : 22),
      paddingHorizontal: getSpacing(8),
    },
    identifier: {
      fontSize: getFontSize(isVerySmallScreen ? 14 : 16),
      color: colors.text,
      fontFamily: fontFamily?.SemiBold || "System",
      textAlign: "center",
      marginBottom: getSpacing(24),
      paddingHorizontal: getSpacing(16),
    },
    otpContainer: {
      marginBottom: getSpacing(32),
      paddingHorizontal: getSpacing(8),
    },
    continueButton: {
      width: "100%",
      paddingVertical: getSpacing(16),
      backgroundColor: colors.primary,
      borderRadius: getResponsiveValue(10, 12, 14),
      marginBottom: getSpacing(16),
      opacity: 1,
    },
    resendButton: {
      paddingVertical: getSpacing(12),
      paddingHorizontal: getSpacing(16),
      alignSelf: "center",
      borderRadius: getResponsiveValue(8, 10, 12),
    },
    resendButtonDisabled: {
      opacity: 0.6,
    },
    resendText: {
      textAlign: "center",
      fontSize: getFontSize(isVerySmallScreen ? 14 : 16),
      color: colors.primary,
      fontFamily: fontFamily?.Medium || "System",
      textDecorationLine: "underline",
    },
    resendTextDisabled: {
      color: colors.textMuted || colors.textSecondary,
      textDecorationLine: "none",
    },
  });
};

export default VerificationEandP;
