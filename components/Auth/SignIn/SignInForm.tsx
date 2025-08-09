import InputField from "@/components/Auth/InputField";
import OAuth from "@/components/Auth/OAuth";
import CustomButton from "@/components/ui/CustomButton";
import { icons } from "@/constants";
import { translationsLogin } from "@/constants/Lang/AuthLangs";
import {
  useSignInContext,
  useSignInMethodConfig,
} from "@/hooks/SingInHooks/useSignInContext";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SignInForm = () => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const {
    isVerySmallScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    height,
    width,
    getFontSize,
    getSpacing,
    getResponsiveValue,
  } = responsive;

  const fonts = useFontFamily();
  const { push } = useSafeNavigate();

  // استخدام السياق الخاص بتسجيل الدخول
  const {
    signInMethod,
    form,
    fieldErrors,
    loading,
    language,
    isRTL,
    isKeyboardVisible,
    handleInputChange,
    handleSignInMethodChange,
    handleSignInWithOTP,
    handleSignInWithPassword,
  } = useSignInContext();

  // الحصول على تكوين واجهة المستخدم حسب الطريقة المختارة
  const {
    inputLabel,
    inputPlaceholder,
    buttonText,
    keyboardType,
    maxLength,
    showPasswordField,
    texts,
    isOTPMethod,
    isPasswordMethod,
  } = useSignInMethodConfig();

  const t = translationsLogin[language];

  // دالة التعامل مع إرسال النموذج
  const handleSubmit = () => {
    if (isPasswordMethod) {
      handleSignInWithPassword();
    } else {
      handleSignInWithOTP();
    }
  };

  // دالة تنسيق رقم الجوال
  const handlePhoneInput = (text: string) => {
    if (signInMethod === "phone") {
      const cleanText = text.replace(/\D/g, ""); // إزالة غير الأرقام
      handleInputChange("value", cleanText);
    } else {
      handleInputChange("value", text);
    }
  };

  // قيمة الحقل المعروضة
  const getDisplayValue = () => {
    if (signInMethod === "phone") {
      return form.value.replace("+966", ""); // إزالة كود البلد للعرض
    }
    return form.value;
  };

  // حساب القيم المرنة
  const spacing = {
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
  };

  const fontSize = {
    methodTab: getFontSize(12, 10, 16),
    link: getFontSize(14, 12, 18),
    quickSwitch: getFontSize(12, 10, 16),
    forgotPassword: getFontSize(12, 10, 16),
  };

  const styles = StyleSheet.create({
    formContainer: {
      flex: 1,
      paddingHorizontal: spacing.horizontal,
      paddingTop: spacing.vertical,
      paddingBottom: spacing.bottom,
      minHeight: isKeyboardVisible ? height * 0.6 : height * 0.8,
    },

    // تبديل طرق تسجيل الدخول
    methodSwitcher: {
      flexDirection: isRTL ? "row-reverse" : "row",
      backgroundColor: colors.surface || "#f5f5f5",
      borderRadius: getResponsiveValue(8, 10, 12, 14, 16),
      padding: getResponsiveValue(2, 3, 4, 5, 6),
      marginBottom: spacing.methodSwitcher,
      elevation: isVerySmallScreen ? 1 : 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },

    methodTab: {
      flex: 1,
      paddingVertical: getResponsiveValue(8, 10, 12, 14, 16),
      paddingHorizontal: getResponsiveValue(6, 8, 12, 16, 20),
      borderRadius: getResponsiveValue(6, 7, 8, 10, 12),
      alignItems: "center",
      justifyContent: "center",
      minHeight: getResponsiveValue(36, 40, 44, 48, 52),
    },

    activeMethodTab: {
      backgroundColor: colors.primary || "#FF5C39",
      elevation: 2,
      shadowColor: colors.primary || "#FF5C39",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },

    methodTabText: {
      fontSize: fontSize.methodTab,
      fontFamily: fonts.Medium || fonts.Regular || "System",
      color: colors.text || "#666666",
      textAlign: "center",
      lineHeight: fontSize.methodTab * 1.3,
    },

    activeMethodTabText: {
      color: "#ffffff",
      fontFamily: fonts.SemiBold || fonts.Medium || "System",
    },

    // حاوية الحقول
    inputContainer: {
      width: "100%",
      marginBottom: spacing.input,
      flex: isKeyboardVisible ? 1 : 0,
    },

    // نسيت كلمة المرور
    forgotPasswordContainer: {
      width: "100%",
      paddingHorizontal: getSpacing(4),
      flexDirection: isRTL ? "row" : "row-reverse",
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
      textAlign: isRTL ? "right" : "left",
      lineHeight: fontSize.forgotPassword * 1.3,
    },

    // زر تسجيل الدخول
    signInButton: {
      marginTop: spacing.button,
      marginBottom: isKeyboardVisible ? getSpacing(8) : spacing.button,
      width: "100%",
    },

    // التبديل السريع
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

    // رابط إنشاء الحساب
    linkContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing.link,
      marginBottom: getResponsiveValue(16, 20, 30, 40, 50),
      paddingVertical: getSpacing(8),
      paddingHorizontal: getSpacing(12),
      minHeight: getResponsiveValue(32, 36, 40, 44, 48),
      flexWrap: "wrap", // للتعامل مع النصوص الطويلة
    },

    linkText: {
      fontSize: fontSize.link,
      fontFamily: fonts.Regular || "System",
      color: colors.text || "#000000",
      textAlign: "center",
      lineHeight: fontSize.link * 1.3,
      flexShrink: 1, // يسمح بالانكماش عند الحاجة
    },

    linkTextPrimary: {
      fontSize: fontSize.link,
      fontFamily: fonts.SemiBold || "System",
      color: colors.primary || "#FF5C39",
      lineHeight: fontSize.link * 1.3,
      flexShrink: 1, // يسمح بالانكماش عند الحاجة
      ...(isRTL
        ? { marginRight: getSpacing(6) }
        : { marginLeft: getSpacing(6) }),
    },

    // إضافة styles للتحكم في المساحة عند ظهور لوحة المفاتيح
    keyboardAwareContainer: {
      flex: 1,
      justifyContent: isKeyboardVisible ? "flex-start" : "space-between",
    },

    // حاوية للمحتوى الذي يختفي عند ظهور لوحة المفاتيح
    hiddenOnKeyboard: {
      opacity: isKeyboardVisible ? 0 : 1,
      height: isKeyboardVisible ? 0 : "auto",
      overflow: "hidden",
      marginTop: isKeyboardVisible ? 0 : spacing.link,
    },

    // تحسين للشاشات الصغيرة جداً
    compactMode: {
      paddingHorizontal: isVerySmallScreen ? 8 : spacing.horizontal,
      paddingVertical: isVerySmallScreen ? 4 : spacing.vertical,
    },

    // محدد طريقة تسجيل الدخول المدمج
    compactMethodSwitcher: {
      flexDirection: isRTL ? "row-reverse" : "row",
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
  });

  return (
    <View
      style={[styles.formContainer, isVerySmallScreen && styles.compactMode]}
    >
      <View style={styles.keyboardAwareContainer}>
        {/* تبديل طرق تسجيل الدخول */}
        <View style={styles.hiddenOnKeyboard}>
          <View
            style={
              isVerySmallScreen
                ? styles.compactMethodSwitcher
                : styles.methodSwitcher
            }
          >
            <TouchableOpacity
              style={[
                isVerySmallScreen ? styles.compactMethodTab : styles.methodTab,
                signInMethod === "phone" && styles.activeMethodTab,
              ]}
              onPress={() => handleSignInMethodChange("phone")}
              activeOpacity={0.7}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text
                style={[
                  styles.methodTabText,
                  signInMethod === "phone" && styles.activeMethodTabText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={isVerySmallScreen}
                minimumFontScale={0.8}
              >
                {texts.phoneMethodTitle}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                isVerySmallScreen ? styles.compactMethodTab : styles.methodTab,
                signInMethod === "email" && styles.activeMethodTab,
              ]}
              onPress={() => handleSignInMethodChange("email")}
              activeOpacity={0.7}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text
                style={[
                  styles.methodTabText,
                  signInMethod === "email" && styles.activeMethodTabText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={isVerySmallScreen}
                minimumFontScale={0.8}
              >
                {texts.emailMethodTitle}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                isVerySmallScreen ? styles.compactMethodTab : styles.methodTab,
                signInMethod === "password" && styles.activeMethodTab,
              ]}
              onPress={() => handleSignInMethodChange("password")}
              activeOpacity={0.7}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text
                style={[
                  styles.methodTabText,
                  signInMethod === "password" && styles.activeMethodTabText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={isVerySmallScreen}
                minimumFontScale={0.8}
              >
                {texts.passwordMethodTitle}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          {/* حقل البريد الإلكتروني أو رقم الجوال */}
          <InputField
            label={inputLabel}
            placeholder={inputPlaceholder}
            icon={
              signInMethod === "phone"
                ? icons.phone
                : signInMethod === "email"
                ? icons.email
                : icons.person
            }
            value={getDisplayValue()}
            onChangeText={handlePhoneInput}
            keyboardType={keyboardType}
            maxLength={maxLength}
            returnKeyType={showPasswordField ? "next" : "done"}
            autoCorrect={false}
            autoCapitalize={signInMethod === "email" ? "none" : "words"}
            onSubmitEditing={showPasswordField ? undefined : handleSubmit}
          />

          {/* حقل كلمة المرور (يظهر فقط في طريقة كلمة المرور) */}
          {showPasswordField && (
            <InputField
              label={texts.passwordLabel}
              placeholder={texts.passwordPlaceholder}
              icon={icons.lock}
              value={form.password}
              onChangeText={(text) => handleInputChange("password", text)}
              secureTextEntry
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
              onSubmitEditing={handleSubmit}
            />
          )}

          {/* رابط نسيت كلمة المرور */}
          {(showPasswordField ||
            signInMethod === "phone" ||
            signInMethod === "email") && (
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => push("/(auth)/reset/email")}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text
                  style={styles.forgotPasswordText}
                  numberOfLines={1}
                  adjustsFontSizeToFit={isVerySmallScreen}
                  minimumFontScale={0.8}
                >
                  {texts.forgotPassword}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sign In Button */}
        <View style={styles.signInButton}>
          <CustomButton
            title={buttonText}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </View>

        {/* التبديل السريع بين الطرق & OAuth & Sign Up Link - مخفي عند ظهور لوحة المفاتيح */}
        <View style={styles.hiddenOnKeyboard}>
          {/* التبديل السريع بين الطرق */}
          {isPasswordMethod && (
            <View style={styles.quickSwitchContainer}>
              <TouchableOpacity
                style={styles.quickSwitchButton}
                onPress={() => handleSignInMethodChange("phone")}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text
                  style={styles.quickSwitchText}
                  numberOfLines={1}
                  adjustsFontSizeToFit={isVerySmallScreen}
                  minimumFontScale={0.8}
                >
                  {texts.switchToOTP}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isOTPMethod && (
            <View style={styles.quickSwitchContainer}>
              <TouchableOpacity
                style={styles.quickSwitchButton}
                onPress={() => handleSignInMethodChange("password")}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text
                  style={styles.quickSwitchText}
                  numberOfLines={1}
                  adjustsFontSizeToFit={isVerySmallScreen}
                  minimumFontScale={0.8}
                >
                  {texts.switchToPassword}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* OAuth Section */}
          <OAuth />

          {/* رابط إنشاء حساب */}
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => push("/(auth)/sign-up")}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={styles.linkText}
              numberOfLines={isVerySmallScreen ? 1 : 2}
              adjustsFontSizeToFit={isVerySmallScreen}
              minimumFontScale={0.8}
            >
              {texts.createAccount}
            </Text>
            <Text
              style={styles.linkTextPrimary}
              numberOfLines={1}
              adjustsFontSizeToFit={isVerySmallScreen}
              minimumFontScale={0.8}
            >
              {texts.signUpLink}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SignInForm;
