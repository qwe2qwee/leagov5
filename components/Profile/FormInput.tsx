import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, Text, TextInput, View } from "react-native";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  onSubmitEditing?: () => void;
  required?: boolean;
  helperText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  maxLength?: number;
  showCharCounter?: boolean;
  validationState?: "default" | "success" | "error";
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  disabled = false,
  keyboardType = "default",
  onSubmitEditing,
  required = false,
  helperText,
  icon,
  maxLength,
  showCharCounter = false,
  validationState = "default",
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();
  const [isFocused, setIsFocused] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  const getBorderColor = () => {
    if (disabled) return colors.borderLight;
    if (validationState === "error") return colors.error;
    if (validationState === "success") return colors.success;
    return isFocused ? colors.primary : colors.border;
  };

  const animatedBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      validationState === "error"
        ? colors.error
        : validationState === "success"
        ? colors.success
        : colors.border,
      colors.primary,
    ],
  });

  const animatedShadow = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <View
      style={{
        marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      }}
    >
      {/* Label with required indicator */}
      <View
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        }}
      >
        <Text
          style={{
            fontSize: responsive.getFontSize(15, 14, 17),
            fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
            color: colors.text,
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>

        {/* Validation icon */}
        {!disabled && validationState !== "default" && (
          <View
            style={{
              marginLeft: isRTL ? 0 : 8,
              marginRight: isRTL ? 8 : 0,
            }}
          >
            <Ionicons
              name={
                validationState === "success"
                  ? "checkmark-circle"
                  : "close-circle"
              }
              size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
              color={
                validationState === "success" ? colors.success : colors.error
              }
            />
          </View>
        )}
      </View>

      {/* Input container with icon */}
      <Animated.View
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          minHeight: responsive.getInputHeight(),
          backgroundColor: disabled
            ? colors.backgroundTertiary
            : colors.surface,
          borderWidth: disabled ? 1 : 2,
          borderColor: disabled ? colors.borderLight : getBorderColor(),
          borderRadius: responsive.getResponsiveValue(12, 14, 16, 18, 20),
          paddingHorizontal: responsive.getResponsiveValue(16, 18, 20, 22, 24),
          opacity: disabled ? 0.6 : 1,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused && !disabled ? 0.15 : 0,
          shadowRadius: animatedShadow,
          elevation: isFocused && !disabled ? 3 : 0,
        }}
      >
        {/* Left Icon */}
        {icon && (
          <View
            style={{
              marginRight: isRTL ? 0 : responsive.getResponsiveValue(12, 14, 16, 18, 20),
              marginLeft: isRTL ? responsive.getResponsiveValue(12, 14, 16, 18, 20) : 0,
            }}
          >
            <Ionicons
              name={icon}
              size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
              color={
                disabled
                  ? colors.textMuted
                  : isFocused
                  ? colors.primary
                  : colors.textSecondary
              }
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={!disabled}
          keyboardType={keyboardType}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={onSubmitEditing ? "done" : "next"}
          maxLength={maxLength}
          style={{
            flex: 1,
            paddingVertical: responsive.getResponsiveValue(14, 16, 18, 20, 22),
            fontSize: responsive.getFontSize(16, 15, 18),
            fontFamily: fonts.Regular,
            color: disabled ? colors.textMuted : colors.text,
            textAlign: isRTL ? "right" : "left",
          }}
          placeholderTextColor={colors.textMuted}
        />

        {/* Lock icon for disabled fields */}
        {disabled && (
          <View
            style={{
              marginLeft: isRTL ? 0 : responsive.getResponsiveValue(8, 10, 12, 14, 16),
              marginRight: isRTL ? responsive.getResponsiveValue(8, 10, 12, 14, 16) : 0,
            }}
          >
            <Ionicons
              name="lock-closed"
              size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
              color={colors.textMuted}
            />
          </View>
        )}
      </Animated.View>

      {/* Helper text and character counter */}
      {(helperText || (showCharCounter && maxLength)) && (
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: responsive.getResponsiveValue(6, 8, 10, 12, 14),
          }}
        >
          {helperText && (
            <Text
              style={{
                fontSize: responsive.getFontSize(12, 11, 14),
                fontFamily: fonts.Regular,
                color:
                  validationState === "error"
                    ? colors.error
                    : validationState === "success"
                    ? colors.success
                    : colors.textMuted,
                textAlign: isRTL ? "right" : "left",
                flex: 1,
              }}
            >
              {helperText}
            </Text>
          )}

          {showCharCounter && maxLength && (
            <Text
              style={{
                fontSize: responsive.getFontSize(12, 11, 14),
                fontFamily: fonts.Regular,
                color:
                  value.length >= maxLength ? colors.error : colors.textMuted,
                textAlign: isRTL ? "left" : "right",
                marginLeft: isRTL ? 0 : 8,
                marginRight: isRTL ? 8 : 0,
              }}
            >
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default FormInput;

