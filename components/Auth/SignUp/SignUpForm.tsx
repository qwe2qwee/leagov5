import InputField from "@/components/Auth/InputField";
import CustomButton from "@/components/ui/CustomButton";
import { icons } from "@/constants";
import { translationsignUp } from "@/constants/Lang/AuthLangs";
import { useAuth } from "@/hooks/supabaseHooks/auth/context";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { useFormStore } from "@/store/auth/useSignUpStore";
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

const SignUpForm = () => {
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

  // Auth hook
  const {
    signUpWithEmail,
    signUpWithPhone,
    checkEmailExists,
    checkPhoneExists,
  } = useAuth();

  // Form store
  const {
    form,
    fieldErrors: errors,
    handleInputChange,
    validateForm,
    resetForm,
    formatPhoneNumber,
  } = useFormStore();

  // Loading state for signup
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Local keyboard state (not in Zustand)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { currentLanguage } = useLanguageStore.getState();

  // Simple labels
  const labels = translationsignUp[currentLanguage];

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
    }),
    [isKeyboardVisible, getResponsiveValue]
  );

  const fontSize = useMemo(
    () => ({
      link: getFontSize(14, 12, 18),
      linkPrimary: getFontSize(14, 12, 18),
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
          minHeight: isKeyboardVisible ? height * 0.6 : height * 0.8,
        },
        inputContainer: {
          width: "100%",
          marginBottom: spacing.input,
          flex: isKeyboardVisible ? 1 : 0,
        },
        signUpButton: {
          marginTop: spacing.button,
          marginBottom: isKeyboardVisible ? getSpacing(2) : spacing.button,
          width: "100%",
        },
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
          fontSize: fontSize.linkPrimary,
          fontFamily: fonts.SemiBold || "System",
          color: colors.primary || "#FF5C39",
          lineHeight: fontSize.linkPrimary * 1.3,
          flexShrink: 1,
          marginLeft: getSpacing(6),
        },
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

  const handleNameChange = useCallback(
    (text: string) => handleInputChange("name", text),
    [handleInputChange]
  );

  const handleEmailChange = useCallback(
    (text: string) => handleInputChange("email", text),
    [handleInputChange]
  );

  const handlePhoneChange = useCallback(
    (text: string) => {
      const cleanText = text.replace(/\D/g, "");
      if (cleanText.length <= 9) {
        // Store as +966 format internally, but display without +966 to user
        const formattedPhone = cleanText ? `+966${cleanText}` : "";
        handleInputChange("phone", formattedPhone);
      }
    },
    [handleInputChange]
  );

  const handleSignUpPress = useCallback(async () => {
    // First validate the form
    const isValid = validateForm();
    if (!isValid) {
      console.log("Form has errors:", errors);
      return;
    }

    setIsSigningUp(true);

    try {
      // Prepare user data
      const userData = {
        name: form.name,
        phone: form.phone ? formatPhoneNumber(form.phone) : undefined,
        email: form.email ? form.email.toLowerCase() : undefined,
      };

      let result;
      let identifier;
      let method: "email" | "phone";

      // Always prioritize email over phone for OTP
      if (form.email && form.email.trim()) {
        console.log("📧 Starting email signup process");

        // Check if email already exists
        const emailExists = await checkEmailExists(form.email);
        if (emailExists) {
          Alert.alert("Error", "Email already registered");
          return;
        }

        identifier = form.email.toLowerCase();
        method = "email";
        result = await signUpWithEmail(identifier, userData);
      } else if (form.phone && form.phone.trim()) {
        console.log("📱 Starting phone signup process");

        const formattedPhone = formatPhoneNumber(form.phone);

        // Check if phone already exists
        const phoneExists = await checkPhoneExists(formattedPhone);
        if (phoneExists) {
          Alert.alert("Error", "Phone number already registered");
          return;
        }

        identifier = formattedPhone;
        method = "phone";
        result = await signUpWithPhone(identifier, userData);
      } else {
        Alert.alert("Error", "Please provide an email or phone number");
        return;
      }

      if (result.error) {
        Alert.alert("Error", result.error);
        return;
      }

      // Success - navigate to OTP page
      console.log("✅ Signup successful, navigating to OTP");
      push(
        `/otp-modal?identifier=${encodeURIComponent(
          identifier
        )}&method=${method}&type=signup`
      );
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "An error occurred during signup");
    } finally {
      setIsSigningUp(false);
    }
  }, [
    validateForm,
    form,
    errors,
    formatPhoneNumber,
    signUpWithEmail,
    signUpWithPhone,
    checkEmailExists,
    checkPhoneExists,
    push,
  ]);

  const handleSignInPress = useCallback(() => {
    push("/(auth)/sign-in");
  }, [push]);

  const handleResetForm = useCallback(() => {
    resetForm();
  }, [resetForm]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.formContainer, isVerySmallScreen && styles.compactMode]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.keyboardAwareContainer}>
        <View style={styles.inputContainer}>
          <InputField
            label={labels.name}
            placeholder={labels.name}
            icon={icons.person}
            value={form.name}
            onChangeText={handleNameChange}
            returnKeyType="next"
            autoCorrect={false}
            autoCapitalize="words"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <InputField
            label={labels.email}
            placeholder={labels.email}
            icon={icons.email}
            value={form.email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            returnKeyType="next"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <InputField
            label={labels.phone}
            placeholder={labels.placeHol}
            icon={icons.phone}
            value={form.phone.replace("+966", "")}
            maxLength={9}
            onChangeText={handlePhoneChange}
            keyboardType="numeric"
            returnKeyType="done"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.signUpButton}>
          <CustomButton
            title={labels.signUp}
            onPress={handleSignUpPress}
            loading={isSigningUp}
            disabled={isSigningUp}
          />

          <CustomButton
            title="Reset Form"
            onPress={handleResetForm}
            disabled={isSigningUp}
            style={{ marginTop: getSpacing(8) }}
          />
        </View>

        <View style={styles.hiddenOnKeyboard}>
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={handleSignInPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={styles.linkText}
              numberOfLines={isVerySmallScreen ? 1 : 2}
              adjustsFontSizeToFit={isVerySmallScreen}
              minimumFontScale={0.8}
            >
              {labels.alreadyAccount}
            </Text>
            <Text
              style={styles.linkTextPrimary}
              numberOfLines={1}
              adjustsFontSizeToFit={isVerySmallScreen}
              minimumFontScale={0.8}
            >
              {labels.signIn}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUpForm;
