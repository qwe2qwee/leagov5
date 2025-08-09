import { otpTranslations } from "@/constants/Lang/AuthLangs";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React, { useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Demo icons
const icons = {
  close: { uri: "https://cdn-icons-png.flaticon.com/512/1828/1828778.png" },
};

// Demo CustomButton component
const CustomButton: React.FC<{
  title: string;
  onPress: () => void;
  style?: any;
}> = ({ title, onPress, style }) => {
  const { colors } = useTheme();
  const fonts = useFontFamily();

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
          minWidth: 120,
        },
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={{
          color: colors.textInverse,
          fontSize: 16,
          fontWeight: "bold",
          fontFamily: fonts.SemiBold || fonts.Bold,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

interface OTPComponentProps {
  onVerifyOTP: (otp: string) => void;
  onResendOTP: () => void;
  closeModal?: () => void;
  otpLength?: number; // Default to 4
  language?: "en" | "ar";
  emailORPhoneNumber: string;
}

const OTPComponent: React.FC<OTPComponentProps> = ({
  onVerifyOTP,
  onResendOTP,
  otpLength = 4,
  closeModal,
  emailORPhoneNumber,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { colors } = useTheme();
  const fonts = useFontFamily();
  const { isSmallScreen, width, height } = useResponsive();
  const { currentLanguage: language } = useLanguageStore();

  // Get translations for current language
  const t = otpTranslations[language];

  // Enhanced responsive calculations
  const isVerySmallScreen = height < 600 || width < 320;
  const isExtraSmallWidth = width < 300;
  const isTinyScreen = height < 500 || width < 280;

  // Calculate optimal OTP input size based on available width
  const availableWidth =
    width - (isExtraSmallWidth ? 24 : isTinyScreen ? 28 : 32); // container padding
  const totalGap =
    (otpLength - 1) *
    (isExtraSmallWidth ? 6 : isTinyScreen ? 8 : isVerySmallScreen ? 8 : 10);
  const maxInputWidth = Math.floor((availableWidth - totalGap) / otpLength);
  const inputSize = Math.max(
    30,
    Math.min(
      maxInputWidth,
      isTinyScreen ? 35 : isVerySmallScreen ? 38 : isSmallScreen ? 42 : 50
    )
  );

  const handleChange = async (text: string, index: number) => {
    try {
      if (!inputRefs.current[index]) {
        console.error(
          "OTPComponent: handleChange: inputRefs.current[index] is null."
        );
        return;
      }

      if (text.length > 1) return;

      const updatedOtp = [...otp];
      updatedOtp[index] = text;
      setOtp(updatedOtp);

      // Move focus to the next input if a digit is entered
      if (text && index < otpLength - 1) {
        inputRefs.current[index + 1]?.focus?.();
      }

      // If the last digit is entered, verify OTP automatically
      if (updatedOtp.every((digit) => digit !== "")) {
        handleVerify(updatedOtp.join(""));
      }
    } catch (error) {
      console.error("OTPComponent: handleChange: ", error);
    }
  };

  const handleKeyPress = (
    event: { nativeEvent: { key: string } },
    index: number
  ) => {
    try {
      const { key } = event.nativeEvent;

      if (key === "Backspace" && !otp[index] && index > 0) {
        // Move focus to the previous input if backspace is pressed and current input is empty
        inputRefs.current[index - 1]?.focus?.();
        const updatedOtp = [...otp];
        updatedOtp[index - 1] = ""; // Clear the previous input
        setOtp(updatedOtp);
      }
    } catch (error) {
      console.error("OTPComponent: handleKeyPress: ", error);
    }
  };

  const handleVerify = async (enteredOtp: string) => {
    try {
      setIsVerifying(true);
      setError(null);

      // Demo API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Demo: Simulate API response (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (enteredOtp.length === otpLength) {
        if (isSuccess) {
          console.log(
            `✅ Demo: OTP ${enteredOtp} verified successfully for ${emailORPhoneNumber}`
          );
          onVerifyOTP("ok");
        } else {
          // Simulate API error
          setError(t.invalidOTP);
        }
      } else {
        setError(t.completeOTP);
      }
    } catch (error) {
      console.error("OTPComponent: handleVerify: ", error);
      setError(t.verificationError);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    console.log(`📱 Demo: Resending OTP to ${emailORPhoneNumber}`);
    setOtp(Array(otpLength).fill(""));
    setError(null);
    // Focus on first input
    inputRefs.current[0]?.focus?.();
    onResendOTP();
  };

  const styles = createStyles(
    colors,
    fonts,
    isSmallScreen,
    isVerySmallScreen,
    isExtraSmallWidth,
    isTinyScreen,
    width,
    inputSize,
    otpLength
  );

  return (
    <View style={styles.container}>
      {closeModal && (
        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
          <Image source={icons.close} style={styles.closeIcon} />
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{t.title}</Text>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{t.descriptionText}</Text>

        <View style={styles.phoneContainer}>
          <Text numberOfLines={1} style={styles.phoneText}>
            {emailORPhoneNumber}
          </Text>
        </View>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={[styles.otpInput, error ? styles.otpInputError : null]}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            editable={!isVerifying}
          />
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <CustomButton
        title={isVerifying ? t.verifying : t.verify}
        onPress={() => handleVerify(otp.join(""))}
        style={styles.verifyButton}
      />

      <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
        <Text style={styles.resendText}>{t.resendOTP}</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (
  colors: any,
  fonts: any,
  isSmallScreen: boolean,
  isVerySmallScreen: boolean,
  isExtraSmallWidth: boolean,
  isTinyScreen: boolean,
  width: number,
  inputSize: number,
  otpLength: number
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      padding: isTinyScreen
        ? 8
        : isVerySmallScreen
        ? 12
        : isSmallScreen
        ? 14
        : 16,
      position: "relative",
      borderRadius: 12,
      minHeight: isTinyScreen
        ? 250
        : isVerySmallScreen
        ? 280
        : isSmallScreen
        ? 300
        : 350,
      maxWidth: "100%",
      width: "100%",
    },
    closeButton: {
      position: "absolute",
      top: isTinyScreen ? 4 : isVerySmallScreen ? 6 : 8,
      right: isTinyScreen ? 4 : isVerySmallScreen ? 6 : 8,
      padding: isTinyScreen ? 4 : isVerySmallScreen ? 6 : 8,
      zIndex: 10,
      minWidth: 32,
      minHeight: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    closeIcon: {
      width: isTinyScreen ? 16 : isVerySmallScreen ? 20 : 24,
      height: isTinyScreen ? 16 : isVerySmallScreen ? 20 : 24,
      tintColor: colors.icon,
    },
    title: {
      fontSize: isTinyScreen
        ? 12
        : isVerySmallScreen
        ? 14
        : isSmallScreen
        ? 16
        : 18,
      fontWeight: "bold",
      marginBottom: isTinyScreen ? 8 : isVerySmallScreen ? 12 : 16,
      color: colors.text,
      fontFamily: fonts.Bold || fonts.SemiBold,
      textAlign: "center",
      paddingHorizontal: 8,
      lineHeight: isTinyScreen
        ? 16
        : isVerySmallScreen
        ? 18
        : isSmallScreen
        ? 22
        : 24,
    },
    descriptionContainer: {
      marginBottom: isTinyScreen ? 8 : isVerySmallScreen ? 12 : 16,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: isTinyScreen ? 4 : isExtraSmallWidth ? 8 : 16,
      width: "100%",
    },
    descriptionText: {
      fontSize: isTinyScreen ? 10 : isVerySmallScreen ? 12 : 14,
      color: colors.textSecondary,
      fontFamily: fonts.Regular,
      textAlign: "center",
      lineHeight: isTinyScreen ? 14 : isVerySmallScreen ? 16 : 20,
    },
    phoneContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      minHeight: isTinyScreen ? 12 : isVerySmallScreen ? 14 : 16,
      marginTop: 4,
    },
    phoneText: {
      fontSize: isTinyScreen ? 10 : isVerySmallScreen ? 12 : 14,
      color: colors.primary,
      fontFamily: fonts.Medium || fonts.Regular,
      textAlign: "center",
      flexShrink: 1,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: isTinyScreen ? 4 : isVerySmallScreen ? 6 : 8,
      gap: isTinyScreen
        ? 4
        : isExtraSmallWidth
        ? 6
        : isVerySmallScreen
        ? 8
        : isSmallScreen
        ? 10
        : 12,
      paddingHorizontal: 4,
      width: "100%",
      flexWrap: "nowrap",
    },
    otpInput: {
      borderWidth: isTinyScreen ? 1 : 2,
      borderColor: colors.primary,
      borderRadius: isTinyScreen ? 4 : isVerySmallScreen ? 6 : 8,
      padding: isTinyScreen
        ? 4
        : isVerySmallScreen
        ? 8
        : isSmallScreen
        ? 10
        : 12,
      width: inputSize,
      height: inputSize,
      textAlign: "center",
      fontSize: Math.max(14, Math.min(18, inputSize * 0.4)),
      color: colors.primary,
      backgroundColor: colors.background,
      fontFamily: fonts.Bold || fonts.SemiBold,
      flex: 0,
      minWidth: 30,
    },
    otpInputError: {
      borderColor: colors.error,
      color: colors.error,
    },
    errorText: {
      color: colors.error,
      fontSize: isTinyScreen ? 9 : isVerySmallScreen ? 11 : 12,
      marginBottom: isTinyScreen ? 4 : isVerySmallScreen ? 6 : 8,
      fontFamily: fonts.Regular,
      textAlign: "center",
      paddingHorizontal: 8,
      lineHeight: isTinyScreen ? 12 : isVerySmallScreen ? 14 : 16,
    },
    verifyButton: {
      marginTop: isTinyScreen
        ? 8
        : isVerySmallScreen
        ? 16
        : isSmallScreen
        ? 24
        : 32,
      minWidth: isTinyScreen ? 80 : isVerySmallScreen ? 100 : 120,
      paddingVertical: isTinyScreen ? 8 : isVerySmallScreen ? 12 : 16,
      paddingHorizontal: isTinyScreen ? 12 : isVerySmallScreen ? 16 : 20,
    },
    resendButton: {
      marginTop: isTinyScreen ? 8 : isVerySmallScreen ? 12 : 16,
      paddingVertical: isTinyScreen ? 4 : isVerySmallScreen ? 6 : 8,
      paddingHorizontal: isTinyScreen ? 6 : isVerySmallScreen ? 8 : 12,
      minHeight: 32,
      justifyContent: "center",
    },
    resendText: {
      color: colors.primary,
      fontSize: isTinyScreen ? 10 : isVerySmallScreen ? 12 : 14,
      textDecorationLine: "underline",
      fontFamily: fonts.Medium || fonts.Regular,
      textAlign: "center",
    },
  });

export default OTPComponent;
