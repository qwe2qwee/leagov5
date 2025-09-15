import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React from "react";
import { Text, TextInput, View } from "react-native";

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
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  return (
    <View
      style={{
        marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      }}
    >
      <Text
        style={{
          fontSize: responsive.getFontSize(15, 14, 17),
          fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
          color: colors.text,
          marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
          textAlign: isRTL ? "right" : "left",
        }}
      >
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={!disabled}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={onSubmitEditing ? "done" : "next"}
        style={{
          minHeight: responsive.getInputHeight(),
          paddingHorizontal: responsive.getResponsiveValue(16, 18, 20, 22, 24),
          paddingVertical: responsive.getResponsiveValue(14, 16, 18, 20, 22),
          backgroundColor: disabled
            ? colors.backgroundTertiary
            : colors.surface,
          borderWidth: 1.5,
          borderColor: disabled ? colors.borderLight : colors.border,
          borderRadius: responsive.getResponsiveValue(12, 14, 16, 18, 20),
          fontSize: responsive.getFontSize(16, 15, 18),
          fontFamily: fonts.Regular,
          color: disabled ? colors.textMuted : colors.text,
          textAlign: isRTL ? "right" : "left",
          opacity: disabled ? 0.7 : 1,
        }}
        placeholderTextColor={colors.textMuted}
      />

      {helperText && (
        <Text
          style={{
            fontSize: responsive.getFontSize(12, 11, 14),
            fontFamily: fonts.Regular,
            color: colors.textMuted,
            marginTop: responsive.getResponsiveValue(6, 8, 10, 12, 14),
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
};

export default FormInput;
