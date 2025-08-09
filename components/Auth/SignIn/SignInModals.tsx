import { signInModalsTranslations } from "@/constants/Lang/AuthLangs";
import {
  useSignInContext,
  useSignInMethodConfig,
} from "@/hooks/SingInHooks/useSignInContext";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/store/useToastStore";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import SignInOTPComponent from "./SignInOTPComponent";

const SignInModals = () => {
  const { colors } = useTheme();
  const fonts = useFontFamily();
  const { isSmallScreen, isMediumScreen, height, width } = useResponsive();
  const toast = useToast();

  const {
    signInMethod,
    form,
    userId,
    language,
    isRTL,
    isOtpModalVisible,
    setIsOtpModalVisible,
    errorModalVisible,
    errorMessage,
    isSuccess,
    handleOtpSuccess,
    handleResendOtp,
    handleErrorModalClose,
  } = useSignInContext();

  const { texts } = useSignInMethodConfig();

  // Get translations based on current language
  const t =
    signInModalsTranslations[language as "en" | "ar"] ||
    signInModalsTranslations.en;

  // Handle errors using new toast system
  useEffect(() => {
    if (errorMessage && errorModalVisible) {
      toast.showError(errorMessage, {
        duration: 4000,
        position: "top",
      });
      handleErrorModalClose();
    }
  }, [errorMessage, errorModalVisible, toast, handleErrorModalClose]);

  // Handle success using new toast system
  useEffect(() => {
    if (isSuccess && errorModalVisible) {
      toast.showSuccess(t.signInSuccessful, {
        duration: 3000,
        position: "top",
      });
      handleErrorModalClose();
    }
  }, [isSuccess, errorModalVisible, t, toast, handleErrorModalClose]);

  // Determine OTP type
  const getOTPType = () => {
    if (signInMethod === "phone") {
      return "phone";
    } else if (signInMethod === "email") {
      return "email";
    }
    return "phone";
  };

  // Get destination value (email or phone)
  const getOTPDestination = () => {
    if (signInMethod === "phone") {
      const cleanPhone = form.value.replace(/\D/g, "");
      return cleanPhone.startsWith("966")
        ? `+${cleanPhone}`
        : `+966${cleanPhone}`;
    } else if (signInMethod === "email") {
      return form.value.trim();
    }
    return form.value;
  };

  // Handle OTP verification
  const handleOTPVerification = async (otp: string) => {
    try {
      if (otp && otp.length === 4) {
        await handleOtpSuccess();
      } else {
        toast.showWarning(t.invalidVerificationCode, {
          duration: 3000,
          position: "top",
        });
      }
    } catch (error) {
      toast.showError(t.verificationFailed, {
        duration: 4000,
        position: "top",
      });
    }
  };

  // Handle resend with toast
  const handleResendWithToast = async () => {
    try {
      await handleResendOtp();
      toast.showInfo(t.verificationCodeResent, {
        duration: 2500,
        position: "top",
      });
    } catch (error) {
      toast.showError(t.resendFailed, {
        duration: 3500,
        position: "top",
      });
    }
  };

  const styles = createStyles(
    colors,
    fonts,
    isSmallScreen,
    isMediumScreen,
    height,
    width,
    isRTL
  );

  return (
    <>
      {/* OTP Modal */}
      <ReactNativeModal
        isVisible={isOtpModalVisible}
        onBackButtonPress={() => setIsOtpModalVisible(false)}
        onBackdropPress={() => setIsOtpModalVisible(false)}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.7}
        style={styles.modal}
        avoidKeyboard={true}
      >
        <View style={styles.modalContainer}>
          {/* OTP Component Container */}
          <View style={styles.otpComponentContainer}>
            <SignInOTPComponent
              closeModal={() => setIsOtpModalVisible(false)}
              onVerifyOTP={handleOTPVerification}
              onResendOTP={handleResendWithToast}
              otpLength={4}
              emailORPhoneNumber={getOTPDestination()}
              language={language}
              userId={userId}
              otpType={getOTPType()}
            />
          </View>
        </View>
      </ReactNativeModal>
    </>
  );
};

// ------------------------------------
// 🎨 Enhanced Responsive Styles
// ------------------------------------

const createStyles = (
  colors: any,
  fonts: any,
  isSmallScreen: boolean,
  isMediumScreen: boolean,
  height: number,
  width: number,
  isRTL: boolean
) => {
  // Dynamic sizing calculations
  const getModalPadding = () => {
    if (isSmallScreen) return 16;
    if (isMediumScreen) return 20;
    return 24;
  };

  const getModalMargin = () => {
    if (isSmallScreen) return 16;
    if (isMediumScreen) return 20;
    return 24;
  };

  const getFontSize = (base: number) => {
    const multiplier = isSmallScreen ? 0.9 : isMediumScreen ? 0.95 : 1;
    return Math.round(base * multiplier);
  };

  const getMarginBottom = (base: number) => {
    const multiplier = isSmallScreen ? 0.8 : isMediumScreen ? 0.9 : 1;
    return Math.round(base * multiplier);
  };

  const modalPadding = getModalPadding();

  return StyleSheet.create({
    modal: {
      margin: 0, // Remove default margins to control sizing
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: colors.background || "#ffffff",
      borderRadius: 16,
      width: isSmallScreen ? width * 0.95 : width * 0.9,
      alignSelf: "center",

      // Remove maxHeight constraint
      // maxHeight: height * 0.85, // <-- Remove this line
      // Add explicit padding instead of flex
      paddingVertical: modalPadding,
    },

    modalHeader: {
      alignItems: "center",
      paddingHorizontal: modalPadding,
      paddingTop: modalPadding,
      paddingBottom: getMarginBottom(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.border || "#e0e0e0",
    },
    modalTitle: {
      fontSize: getFontSize(20),
      fontFamily: fonts.Bold || fonts.SemiBold || "System",
      color: colors.text || "#000000",
      textAlign: "center",
      marginBottom: getMarginBottom(8),
    },
    modalSubtitle: {
      fontSize: getFontSize(14),
      fontFamily: fonts.Regular || "System",
      color: colors.textSecondary || "#666666",
      textAlign: "center",
      lineHeight: getFontSize(20),
      marginBottom: getMarginBottom(8),
      paddingHorizontal: 8,
    },
    destinationText: {
      fontSize: getFontSize(15),
      fontFamily: fonts.SemiBold || fonts.Medium || "System",
      color: colors.primary || "#FF5C39",
      textAlign: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.primaryLight || "#FFF5F3",
      borderRadius: 8,
      marginTop: 4,
      maxWidth: "90%",
    },

    otpComponentContainer: {
      // Remove flex: 1
      paddingHorizontal: modalPadding - 8,
      // Add minimum height instead
      minHeight: 450,
    },

    cancelButton: {
      marginHorizontal: modalPadding,
      marginVertical: modalPadding,
      paddingVertical: isSmallScreen ? 10 : 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: colors.surface || "#f5f5f5",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border || "#e0e0e0",
    },
    cancelButtonText: {
      fontSize: getFontSize(16),
      fontFamily: fonts.Medium || "System",
      color: colors.textSecondary || "#666666",
      textAlign: "center",
    },
  });
};

export default SignInModals;
