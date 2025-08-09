import OTPComponent from "@/components/Auth/OTPComponent";
import { signUpModalsTranslations } from "@/constants/Lang/AuthLangs";
import { useSignUpContext } from "@/hooks/SignupHooks/useSignUpContext";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/store/useToastStore";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import ReactNativeModal from "react-native-modal";

const SignUpModals = () => {
  const { colors } = useTheme();
  const toast = useToast(); // 👈 النظام الجديد

  const {
    form,
    language,
    isModalVisible,
    setModalVisible,
    errorModalVisible,
    errorMessage,
    isSuccess,
    handleOtpSubmit,
    handleResendOtp,
    handleErrorModalClose,
  } = useSignUpContext();

  // Get translations for current language
  const t = signUpModalsTranslations[language];

  // 👈 معالجة الأخطاء باستخدام التوست الجديد
  useEffect(() => {
    if (errorMessage && errorModalVisible) {
      // إظهار رسالة الخطأ في التوست
      toast.showError(errorMessage, {
        duration: 4000,
        position: "top",
      });
      // إغلاق المودال مباشرة
      handleErrorModalClose();
    }
  }, [errorMessage, errorModalVisible, toast, handleErrorModalClose]);

  // 👈 معالجة النجاح باستخدام التوست الجديد
  useEffect(() => {
    if (isSuccess && errorModalVisible) {
      // إظهار رسالة النجاح
      toast.showSuccess(t.accountCreatedSuccess, {
        duration: 3000,
        position: "top",
      });
      handleErrorModalClose();
    }
  }, [
    isSuccess,
    errorModalVisible,
    t.accountCreatedSuccess,
    toast,
    handleErrorModalClose,
  ]);

  // 👈 دالة معالجة OTP محسنة مع توست
  const handleOTPVerification = async (otp: string) => {
    try {
      if (otp && otp.length === 4) {
        await handleOtpSubmit(otp);
        // رسالة النجاح ستظهر عبر useEffect أعلاه
      } else {
        // عرض خطأ OTP باستخدام التوست
        toast.showWarning(t.invalidVerificationCode, {
          duration: 3000,
          position: "top",
        });
      }
    } catch (error) {
      // معالجة أي أخطاء أخرى
      toast.showError(t.verificationFailed, {
        duration: 4000,
        position: "top",
      });
    }
  };

  // 👈 دالة إعادة الإرسال مع توست
  const handleResendWithToast = async () => {
    try {
      await handleResendOtp();
      toast.showInfo(t.verificationCodeResent, {
        duration: 2500,
        position: "top",
      });
    } catch (error) {
      toast.showError(t.failedToResendCode, {
        duration: 3500,
        position: "top",
      });
    }
  };

  const styles = StyleSheet.create({
    modalContainer: {
      backgroundColor: colors.background || "#ffffff",
      padding: 20,
      borderRadius: 12,
      margin: 20,
      maxHeight: "80%",
    },
  });

  return (
    <>
      {/* OTP Modal */}
      <ReactNativeModal
        isVisible={isModalVisible}
        onBackButtonPress={() => setModalVisible(false)}
        onBackdropPress={() => setModalVisible(false)}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContainer}>
          <OTPComponent
            closeModal={() => setModalVisible(false)}
            onVerifyOTP={handleOTPVerification} // 👈 استخدام النسخة المحسنة
            onResendOTP={handleResendWithToast} // 👈 استخدام النسخة المحسنة
            otpLength={4}
            emailORPhoneNumber={form.phone}
            language={language}
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default SignUpModals;
