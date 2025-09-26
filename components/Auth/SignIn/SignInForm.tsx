import InputField from "@/components/Auth/InputField";
import CustomButton from "@/components/ui/CustomButton";
import { icons } from "@/constants";
import { translationsLogin } from "@/constants/Lang/AuthLangs";
import { useSignInContext } from "@/hooks/SingInHooks/useSignInContext";
import { useAuth } from "@/hooks/supabaseHooks/auth/context";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { useSignInStore } from "@/store/auth/useSignInStore";
import useLanguageStore from "@/store/useLanguageStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SignInForm = () => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const {
    isVerySmallScreen,
    height,
    getFontSize,
    getSpacing,
    getResponsiveValue,
  } = responsive;

  const fonts = useFontFamily();
  const { push } = useSafeNavigate();
  const scrollViewRef = useRef<ScrollView>(null);
  const { isKeyboardVisible } = useSignInContext();

  // Auth hook (we only use phone flows here)
  const { signInWithPhone, checkPhoneExists } = useAuth();

  // Form store
  const {
    form,
    fieldErrors: errors,
    isSigningIn,
    handleInputChange,
    validateForm,
    resetForm,
    formatPhoneNumber,
    setIsSigningIn,
  } = useSignInStore();

  // Local keyboard state (not in Zustand)
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { currentLanguage } = useLanguageStore.getState
    ? useLanguageStore.getState()
    : useLanguageStore();
  // note: the store usage above matches original pattern; if your useLanguageStore signature differs adjust accordingly

  console.log("SignInForm Render: ", { form, errors, isKeyboardVisible });

  // Labels (fixed to phone)
  const getLabels = useMemo(() => {
    const baseLabels = translationsLogin[currentLanguage || "en"] || {};
    return {
      ...baseLabels,
      inputLabel: "Phone Number",
      inputPlaceholder: "Enter your phone number",
      buttonText: "Send OTP",
      phone: baseLabels.phone || "Phone",
      loginTitle: baseLabels.loginTitle || "Send OTP",
      forgotPassword: baseLabels.forgotPassword || "Forgot password?",
      createAccount: baseLabels.createAccount || "Don't have an account?",
      signUp: baseLabels.signUp || "Sign up",
    };
  }, [currentLanguage]);

  const spacing = useMemo(
    () => ({
      horizontal: getResponsiveValue(12, 16, 20, 24, 28),
      vertical: isKeyboardVisible
        ? getResponsiveValue(4, 6, 8, 10, 12)
        : getResponsiveValue(16, 20, 24, 30, 36),
      bottom: getResponsiveValue(12, 16, 20, 24, 28),
      input: getResponsiveValue(12, 16, 20, 24, 28),
      button: getResponsiveValue(12, 16, 20, 24, 28),
      link: getResponsiveValue(12, 16, 20, 24, 28),
      methodSwitcher: getResponsiveValue(16, 20, 24, 28, 32),
      quickSwitch: getResponsiveValue(8, 12, 16, 20, 24),
    }),
    [isKeyboardVisible, getResponsiveValue]
  );

  const fontSize = useMemo(
    () => ({
      link: getFontSize(14, 12, 18),
      quickSwitch: getFontSize(12, 10, 16),
      forgotPassword: getFontSize(12, 10, 16),
    }),
    [getFontSize]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        formContainer: {
          flex: 1,
          paddingHorizontal: spacing.horizontal,
          paddingTop: spacing.vertical,
          paddingBottom: spacing.bottom,
          height: isKeyboardVisible ? 120 : height * 0.1,
        },

        // Input container
        inputContainer: {
          width: "100%",
          marginBottom: spacing.input,
          flex: isKeyboardVisible ? 1 : 0,
        },

        // Forgot password
        forgotPasswordContainer: {
          width: "100%",
          paddingHorizontal: getSpacing(4),
          flexDirection: "row-reverse",
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: getSpacing(6),
        },

        forgotPasswordButton: {
          flexDirection: "row",
          paddingHorizontal: getSpacing(8),
          paddingVertical: getSpacing(4),
          minHeight: getResponsiveValue(28, 32, 36, 40, 44),
          alignItems: "center",
          justifyContent: "center",
          borderRadius: getSpacing(4),
        },

        forgotPasswordText: {
          color: colors.error || "#FF0000",
          fontSize: fontSize.forgotPassword,
          textDecorationLine: "underline",
          fontFamily: fonts.SemiBold || fonts.Bold || "System",
          textAlign: "left",
          lineHeight: fontSize.forgotPassword * 1.3,
        },

        // Sign in button
        signInButton: {
          marginTop: spacing.button,
          marginBottom: isKeyboardVisible ? getSpacing(8) : spacing.button,
          width: "100%",
        },

        // Quick switch
        quickSwitchContainer: {
          alignItems: "center",
          marginBottom: spacing.quickSwitch,
        },

        quickSwitchButton: {
          paddingHorizontal: getResponsiveValue(12, 16, 20, 24, 28),
          paddingVertical: getResponsiveValue(6, 8, 10, 12, 14),
          borderRadius: getResponsiveValue(16, 18, 20, 22, 24),
          backgroundColor: colors.surface || "#f0f0f0",
          minHeight: getResponsiveValue(32, 36, 40, 44, 48),
          alignItems: "center",
          justifyContent: "center",
          elevation: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },

        quickSwitchText: {
          fontSize: fontSize.quickSwitch,
          fontFamily: fonts.Medium || "System",
          color: colors.primary || "#FF5C39",
          textAlign: "center",
          lineHeight: fontSize.quickSwitch * 1.3,
        },

        // Sign up link
        linkContainer: {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: spacing.link,
          marginBottom: getResponsiveValue(16, 20, 30, 40, 50),
          paddingVertical: getSpacing(8),
          paddingHorizontal: getSpacing(12),
          minHeight: getResponsiveValue(32, 36, 40, 44, 48),
          flexWrap: "wrap",
        },

        linkText: {
          fontSize: fontSize.link,
          fontFamily: fonts.Regular || "System",
          color: colors.text || "#000000",
          textAlign: "center",
          lineHeight: fontSize.link * 1.3,
          flexShrink: 1,
        },

        linkTextPrimary: {
          fontSize: fontSize.link,
          fontFamily: fonts.SemiBold || "System",
          color: colors.primary || "#FF5C39",
          lineHeight: fontSize.link * 1.3,
          flexShrink: 1,
          marginLeft: getSpacing(6),
        },

        // Keyboard aware
        keyboardAwareContainer: {
          flex: 1,
          justifyContent: isKeyboardVisible ? "flex-start" : "space-between",
        },

        hiddenOnKeyboard: {
          opacity: isKeyboardVisible ? 0 : 1,
          height: isKeyboardVisible ? 0 : "auto",
          overflow: "hidden",
          marginTop: isKeyboardVisible ? 0 : spacing.link,
        },

        compactMode: {
          paddingHorizontal: isVerySmallScreen ? 8 : spacing.horizontal,
          paddingVertical: isVerySmallScreen ? 4 : spacing.vertical,
        },

        errorText: {
          fontSize: getFontSize(12, 10, 14),
          fontFamily: fonts.Regular || "System",
          color: colors.error || "#FF3333",
          textAlign: "left",
          marginTop: getSpacing(4),
          marginBottom: getSpacing(8),
        },

        compactMethodSwitcher: {
          flexDirection: "row",
          backgroundColor: colors.surface || "#f5f5f5",
          borderRadius: getSpacing(6),
          padding: 2,
          marginBottom: getSpacing(12),
        },

        compactMethodTab: {
          flex: 1,
          paddingVertical: getSpacing(6),
          paddingHorizontal: getSpacing(4),
          borderRadius: getSpacing(4),
          alignItems: "center",
          justifyContent: "center",
          minHeight: 28,
        },
      }),
    [
      spacing,
      isKeyboardVisible,
      height,
      fontSize,
      fonts,
      colors,
      getSpacing,
      getResponsiveValue,
      isVerySmallScreen,
      getFontSize,
    ]
  );

  // Handle input changes - phone only
  const handleValueChange = useCallback(
    (text: string) => {
      // keep only digits and limit to 9 local digits (e.g., '5XXXXXXXX')
      const cleanText = text.replace(/\D/g, "");
      const formattedPhone = cleanText ? `+966${cleanText}` : "";
      handleInputChange("value", formattedPhone);
    },
    [handleInputChange]
  );

  // Handle sign in (phone-only)
  const handleSignIn = useCallback(async () => {
    const isValid = validateForm();
    if (!isValid) {
      console.log("Form has errors:", errors);
      return;
    }

    setIsSigningIn(true);

    try {
      const formattedPhone = formatPhoneNumber(form.value);
      console.log("Signing in with phone:", formattedPhone);

      const phoneExists = await checkPhoneExists(formattedPhone);
      if (!phoneExists) {
        Alert.alert("Error", "Phone number not found");
        return;
      }

      const result = await signInWithPhone(formattedPhone);
      if (result.error) {
        Alert.alert("Error", result.error);
        return;
      }

      // Navigate to OTP entry
      push(
        `/otp-modal?identifier=${encodeURIComponent(
          formattedPhone
        )}&method=phone&type=signin`
      );
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "An error occurred during sign in");
    } finally {
      setIsSigningIn(false);
    }
  }, [
    validateForm,
    form.value,
    errors,
    formatPhoneNumber,
    signInWithPhone,
    checkPhoneExists,
    push,
    setIsSigningIn,
  ]);

  const handleSignUpPress = useCallback(() => {
    push("/(auth)/sign-up");
  }, [push]);

  const handleResetForm = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // Get display value for input (strip the +966 for user convenience)
  const getDisplayValue = () => {
    return form.value.replace("+966", "");
  };

  return (
    <ScrollView
      style={[styles.formContainer, isVerySmallScreen && styles.compactMode]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.keyboardAwareContainer}>
        {/* Input Fields (phone only) */}
        <View style={styles.inputContainer}>
          <InputField
            label={getLabels.phone}
            icon={icons.phone}
            value={getDisplayValue()}
            onChangeText={handleValueChange}
            keyboardType="numeric"
            maxLength={9}
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="none"
            onSubmitEditing={handleSignIn}
            placeholder={getLabels.inputPlaceholder}
          />
          {errors.value && <Text style={styles.errorText}>{errors.value}</Text>}
        </View>

        {/* Sign In Button */}
        <View style={styles.signInButton}>
          <CustomButton
            title={getLabels.loginTitle}
            onPress={handleSignIn}
            loading={isSigningIn}
            disabled={isSigningIn}
          />

          <CustomButton
            title="Reset Form"
            onPress={handleResetForm}
            disabled={isSigningIn}
            style={{ marginTop: getSpacing(8) }}
          />
        </View>

        {/* Sign Up Link */}
        <View style={styles.hiddenOnKeyboard}>
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={handleSignUpPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={styles.linkText}
              numberOfLines={isVerySmallScreen ? 1 : 2}
              adjustsFontSizeToFit={isVerySmallScreen}
              minimumFontScale={0.8}
            >
              {getLabels.createAccount}
            </Text>
            <Text
              style={styles.linkTextPrimary}
              numberOfLines={1}
              adjustsFontSizeToFit={isVerySmallScreen}
              minimumFontScale={0.8}
            >
              {getLabels.signUp}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignInForm;
