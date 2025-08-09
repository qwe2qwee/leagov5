import InputField from "@/components/Auth/InputField";
import OAuth from "@/components/Auth/OAuth";
import CustomButton from "@/components/ui/CustomButton";
import { icons } from "@/constants";
import { translationsignUp } from "@/constants/Lang/AuthLangs";
import { useSignUpContext } from "@/hooks/SignupHooks/useSignUpContext";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SignUpForm = () => {
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

  const {
    form,
    loading,
    language,
    isRTL,
    isKeyboardVisible,
    handleInputChange,
    onSignUpPress,
  } = useSignUpContext();

  const t = translationsignUp[language];

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
  };

  const fontSize = {
    link: getFontSize(14, 12, 18),
    linkPrimary: getFontSize(14, 12, 18),
  };

  const styles = StyleSheet.create({
    formContainer: {
      flex: 1,
      paddingHorizontal: spacing.horizontal,
      paddingTop: spacing.vertical,
      paddingBottom: spacing.bottom,
      minHeight: isKeyboardVisible ? height * 0.6 : height * 0.8,
    },

    // حاوية الحقول
    inputContainer: {
      width: "100%",
      marginBottom: spacing.input,
      flex: isKeyboardVisible ? 1 : 0,
    },

    // زر إنشاء الحساب
    signUpButton: {
      marginTop: spacing.button,
      marginBottom: isKeyboardVisible ? getSpacing(8) : spacing.button,
      width: "100%",
    },

    // رابط تسجيل الدخول
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
      fontSize: fontSize.linkPrimary,
      fontFamily: fonts.SemiBold || "System",
      color: colors.primary || "#FF5C39",
      lineHeight: fontSize.linkPrimary * 1.3,
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
  });

  return (
    <View
      style={[styles.formContainer, isVerySmallScreen && styles.compactMode]}
    >
      <View style={styles.keyboardAwareContainer}>
        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <InputField
            label={t.name}
            placeholder={t.name}
            icon={icons.person}
            value={form.name}
            onChangeText={(text) => handleInputChange("name", text)}
            returnKeyType="next"
            autoCorrect={false}
            autoCapitalize="words"
          />

          <InputField
            label={t.email}
            placeholder={t.email}
            icon={icons.email}
            value={form.email}
            onChangeText={(text) => handleInputChange("email", text)}
            keyboardType="email-address"
            returnKeyType="next"
            autoCorrect={false}
            autoCapitalize="none"
          />

          <InputField
            label={t.phone}
            placeholder={t.placeHol}
            icon={icons.phone}
            value={form.phone.replace("+966", "")}
            maxLength={9}
            onChangeText={(text) => {
              const cleanText = text.replace(/\D/g, ""); // Remove non-digits
              handleInputChange("phone", `+966${cleanText}`);
            }}
            keyboardType="numeric"
            returnKeyType="done"
          />
        </View>

        {/* Sign Up Button */}
        <View style={styles.signUpButton}>
          <CustomButton
            title={t.signUp}
            onPress={onSignUpPress}
            loading={loading}
            disabled={loading}
          />
        </View>

        {/* OAuth Section & Sign In Link - مخفي عند ظهور لوحة المفاتيح */}
        <View style={styles.hiddenOnKeyboard}>
          <OAuth />

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => push("/(auth)/sign-in")}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={styles.linkText}
              numberOfLines={isVerySmallScreen ? 1 : 2}
              adjustsFontSizeToFit={isVerySmallScreen}
              minimumFontScale={0.8}
            >
              {t.alreadyAccount}
            </Text>
            <Text
              style={styles.linkTextPrimary}
              numberOfLines={1}
              adjustsFontSizeToFit={isVerySmallScreen}
              minimumFontScale={0.8}
            >
              {t.signIn}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SignUpForm;
