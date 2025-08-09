import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { InputFieldProps } from "@/types/AuthTypes";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  placeholder,
  onChangeText,
  maxLength,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();
  const { isSmallScreen, isMediumScreen, isLargeScreen } = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  const styles = createStyles(
    colors,
    fonts,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isRTL,
    isFocused
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        {icon && (
          <Image source={icon} style={styles.icon} resizeMode="contain" />
        )}
        <TextInput
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted || "#8B8E93"}
          onChangeText={onChangeText}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.textInput}
          {...props}
        />
      </View>
    </View>
  );
};

// ------------------------------------
// 🎨 Styles
// ------------------------------------

const createStyles = (
  colors: any,
  fonts: any,
  isSmallScreen: boolean,
  isMediumScreen: boolean,
  isLargeScreen: boolean,
  isRTL: boolean,
  isFocused: boolean
) =>
  StyleSheet.create({
    container: {
      marginVertical: isSmallScreen ? 6 : isMediumScreen ? 8 : 10,
      width: "100%",
    },

    label: {
      fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 18,
      fontFamily: fonts.SemiBold || "System",
      marginBottom: isSmallScreen ? 8 : isMediumScreen ? 10 : 12,
      color: colors.text || "#000000",
      textAlign: isRTL ? "right" : "left",
      lineHeight: isSmallScreen ? 18 : isMediumScreen ? 20 : 22,
    },

    inputContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "flex-start",
      position: "relative",
      borderWidth: isFocused ? 2 : 1,
      borderColor: isFocused
        ? colors.primary || "#FF5C39"
        : colors.border || "#E1E5E9",
      borderRadius: isSmallScreen ? 10 : isMediumScreen ? 12 : 14,
      backgroundColor: colors.backgroundSecondary || "#F8F9FA",
      paddingVertical: isSmallScreen ? 2 : isMediumScreen ? 3 : 4,
      minHeight: isSmallScreen ? 48 : isMediumScreen ? 52 : 56,
    },

    icon: {
      width: isSmallScreen ? 20 : isMediumScreen ? 22 : 24,
      height: isSmallScreen ? 20 : isMediumScreen ? 22 : 24,
      ...(isRTL
        ? { marginRight: isSmallScreen ? 10 : isMediumScreen ? 12 : 14 }
        : { marginLeft: isSmallScreen ? 10 : isMediumScreen ? 12 : 14 }),
    },

    textInput: {
      borderRadius: isSmallScreen ? 10 : isMediumScreen ? 12 : 14,
      paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
      paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
      fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : 16,
      fontFamily: fonts.Medium || fonts.Regular || "System",
      textAlign: isRTL ? "right" : "left",
      flex: 1,
      color: colors.text || "#000000",
      writingDirection: isRTL ? "rtl" : "ltr",
      lineHeight: isSmallScreen ? 18 : isMediumScreen ? 20 : 22,
      minHeight: isSmallScreen ? 20 : isMediumScreen ? 22 : 24,
    },
  });

export default InputField;
