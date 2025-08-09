import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { ButtonProps } from "@/types/AuthTypes";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CustomButtonAuth = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  textStyle,
  loading = false,
  disabled = false,
  ...props
}: ButtonProps) => {
  const { colors } = useTheme();
  const { isSmallScreen } = useResponsive();
  const fonts = useFontFamily();

  const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: colors.backgroundTertiary,
        };
      case "danger":
        return {
          backgroundColor: colors.error,
        };
      case "success":
        return {
          backgroundColor: colors.success,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 0.5,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
  };

  const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
    switch (variant) {
      case "primary":
        return {
          color: colors.text,
        };
      case "secondary":
        return {
          color: colors.textInverse,
        };
      case "danger":
        return {
          color: colors.textInverse,
        };
      case "success":
        return {
          color: colors.textInverse,
        };
      default:
        return {
          color: colors.textInverse,
        };
    }
  };

  const buttonStyle = getBgVariantStyle(bgVariant);
  const textColorStyle = getTextVariantStyle(textVariant);

  const styles = StyleSheet.create({
    button: {
      padding: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",

      width: "91.666667%", // equivalent to w-11/12
      marginTop: 16,
      marginBottom: 32,
      borderRadius: 12,
      minHeight: loading ? 56 : 48,
      opacity: loading || disabled ? 0.6 : 1,
      ...buttonStyle,
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: "bold",
      fontFamily: fonts.Bold || "System",
      ...textColorStyle,
    },
    iconContainer: {
      marginHorizontal: 8,
    },
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColorStyle.color} />
      ) : (
        <View style={styles.contentContainer}>
          {IconLeft && (
            <View style={styles.iconContainer}>
              <IconLeft />
            </View>
          )}
          <Text style={styles.text}>{title}</Text>
          {IconRight && (
            <View style={styles.iconContainer}>
              <IconRight />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButtonAuth;
