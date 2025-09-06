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

const CustomButton = ({
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
  const responsive = useResponsive();
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
      width: "100%",
      // Better responsive border radius that scales with screen size
      borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      // Improved responsive padding for better proportions
      padding: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      // Better responsive minimum height using the button height helper
      minHeight: loading
        ? responsive.getButtonHeight("primary") +
          responsive.getResponsiveValue(6, 8, 10, 12, 14)
        : responsive.getButtonHeight("primary"),
      opacity: loading || disabled ? 0.6 : 1,
      ...buttonStyle,
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      // Better responsive font size using getFontSize with proper bounds
      fontSize: responsive.getFontSize(16, 15, 19),
      fontWeight: "bold",
      fontFamily: fonts.Bold || "System",
      // Improved responsive line height
      lineHeight: Math.round(responsive.getFontSize(16, 15, 19) * 1.2),
      ...textColorStyle,
    },
    iconContainer: {
      // Responsive icon spacing that scales with button size
      marginHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
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

export default CustomButton;

// Basic usage examples:

// Example 1: Primary action button
// <CustomButton
//   title="Book Now"
//   bgVariant="primary"
//   onPress={() => console.log('booked')}
// />

// Example 2: Button with icon and loading state
// <CustomButton
//   title="Login"
//   bgVariant="success"
//   IconLeft={() => <LoginIcon />}
//   loading={isLoading}
//   onPress={handleLogin}
// />

// Example 3: Outline button for secondary actions
// <CustomButton
//   title="Cancel"
//   bgVariant="outline"
//   textVariant="primary"
//   onPress={() => navigation.goBack()}
// />
