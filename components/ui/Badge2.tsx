import { ColorUtils } from "@/constants/Colors";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import * as React from "react";
import {
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";

// Badge Variant Types
type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info"
  // Car rental specific variants
  | "available"
  | "booked"
  | "maintenance"
  | "economy"
  | "standard"
  | "premium"
  | "luxury";

type BadgeSize = "sm" | "md" | "lg";

// Badge Props Interface
export interface BadgeProps extends Omit<TouchableOpacityProps, "style"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

// Utility function to merge styles
const mergeStyles = <T extends ViewStyle | TextStyle>(
  baseStyle: T,
  customStyle?: T
): T => {
  if (!customStyle) return baseStyle;
  return { ...baseStyle, ...customStyle };
};

// Badge Variants Configuration
const getBadgeVariants = (
  variant: BadgeVariant,
  theme: ReturnType<typeof useTheme>,
  responsive: ReturnType<typeof useResponsive>
) => {
  const { colors } = theme;

  const variants: Record<
    BadgeVariant,
    {
      backgroundColor: string;
      borderColor: string;
      textColor: string;
      activeOpacity?: number;
    }
  > = {
    default: {
      backgroundColor: colors.primary,
      borderColor: "transparent",
      textColor: colors.textInverse,
      activeOpacity: 0.8,
    },
    secondary: {
      backgroundColor: colors.backgroundTertiary,
      borderColor: "transparent",
      textColor: colors.textSecondary,
      activeOpacity: 0.7,
    },
    destructive: {
      backgroundColor: colors.error,
      borderColor: "transparent",
      textColor: colors.textInverse,
      activeOpacity: 0.8,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: colors.border,
      textColor: colors.text,
      activeOpacity: 0.6,
    },
    success: {
      backgroundColor: colors.success,
      borderColor: "transparent",
      textColor: colors.textInverse,
      activeOpacity: 0.8,
    },
    warning: {
      backgroundColor: colors.warning,
      borderColor: "transparent",
      textColor: theme.scheme === "dark" ? colors.text : colors.textInverse,
      activeOpacity: 0.8,
    },
    info: {
      backgroundColor: colors.info,
      borderColor: "transparent",
      textColor: colors.textInverse,
      activeOpacity: 0.8,
    },
    // Car rental specific variants using semantic colors
    available: {
      backgroundColor: ColorUtils.withOpacity(colors.success, 0.15),
      borderColor: colors.success,
      textColor: colors.success,
      activeOpacity: 0.7,
    },
    booked: {
      backgroundColor: ColorUtils.withOpacity(colors.warning, 0.15),
      borderColor: colors.warning,
      textColor: theme.scheme === "dark" ? colors.warning : "#B45309",
      activeOpacity: 0.7,
    },
    maintenance: {
      backgroundColor: ColorUtils.withOpacity(colors.error, 0.15),
      borderColor: colors.error,
      textColor: colors.error,
      activeOpacity: 0.7,
    },
    economy: {
      backgroundColor: ColorUtils.withOpacity("#6C757D", 0.15),
      borderColor: "#6C757D",
      textColor: "#6C757D",
      activeOpacity: 0.7,
    },
    standard: {
      backgroundColor: ColorUtils.withOpacity("#17A2B8", 0.15),
      borderColor: "#17A2B8",
      textColor: "#17A2B8",
      activeOpacity: 0.7,
    },
    premium: {
      backgroundColor: ColorUtils.withOpacity("#6F42C1", 0.15),
      borderColor: "#6F42C1",
      textColor: "#6F42C1",
      activeOpacity: 0.7,
    },
    luxury: {
      backgroundColor: ColorUtils.withOpacity("#E83E8C", 0.15),
      borderColor: "#E83E8C",
      textColor: "#E83E8C",
      activeOpacity: 0.7,
    },
  };

  return variants[variant];
};

// Badge Size Configuration - Improved with responsive sizing
const getBadgeSize = (
  size: BadgeSize,
  responsive: ReturnType<typeof useResponsive>
) => {
  const sizes = {
    sm: {
      // More responsive horizontal padding that scales better on small screens
      paddingHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      // Responsive vertical padding with better proportions
      paddingVertical: responsive.getResponsiveValue(2, 3, 4, 5, 6),
      // Use responsive font sizing for better scaling
      fontSize: responsive.getFontSize(11, 10, 13),
      // Better responsive border radius
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      // Responsive minimum height that scales with screen size
      minHeight: responsive.getResponsiveValue(18, 20, 22, 24, 26),
    },
    md: {
      // Better scaling for medium badges
      paddingHorizontal: responsive.getResponsiveValue(10, 12, 16, 18, 20),
      paddingVertical: responsive.getResponsiveValue(4, 5, 6, 7, 8),
      fontSize: responsive.getFontSize(13, 12, 15),
      borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      minHeight: responsive.getResponsiveValue(22, 24, 26, 28, 30),
    },
    lg: {
      // Large badges with optimal spacing for all screen sizes
      paddingHorizontal: responsive.getResponsiveValue(14, 16, 20, 24, 28),
      paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      fontSize: responsive.getFontSize(15, 14, 17),
      borderRadius: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      minHeight: responsive.getResponsiveValue(28, 32, 36, 40, 44),
    },
  };

  return sizes[size];
};

// Badge Component
const Badge = React.forwardRef<any, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      style,
      textStyle,
      children,
      onPress,
      disabled = false,
      icon,
      iconPosition = "left",
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const responsive = useResponsive();
    const fonts = useFontFamily();

    const variantConfig = getBadgeVariants(variant, theme, responsive);
    const sizeConfig = getBadgeSize(size, responsive);

    const badgeStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: variantConfig.backgroundColor,
      borderColor: variantConfig.borderColor,
      borderWidth: variantConfig.borderColor === "transparent" ? 0 : 1,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      paddingVertical: sizeConfig.paddingVertical,
      borderRadius: sizeConfig.borderRadius,
      minHeight: sizeConfig.minHeight,
      opacity: disabled ? 0.5 : 1,
    };

    const badgeTextStyle: TextStyle = {
      color: variantConfig.textColor,
      fontSize: sizeConfig.fontSize,
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      textAlign: "center",
      // Improved responsive line height calculation
      lineHeight: Math.round(sizeConfig.fontSize * 1.3),
    };

    // Responsive icon spacing that scales with badge size
    const iconSpacing = responsive.getResponsiveValue(3, 4, 5, 6, 7);

    // If onPress is provided, use TouchableOpacity, otherwise use View
    const Component = onPress ? TouchableOpacity : View;
    const touchableProps = onPress
      ? {
          onPress,
          disabled,
          activeOpacity: variantConfig.activeOpacity || 0.7,
        }
      : {};

    return (
      <Component
        ref={onPress ? ref : undefined}
        style={mergeStyles(badgeStyle, style)}
        {...(onPress ? touchableProps : {})}
        {...props}
      >
        {icon && iconPosition === "left" && (
          <View style={{ marginRight: iconSpacing }}>{icon}</View>
        )}

        <Text style={mergeStyles(badgeTextStyle, textStyle)}>{children}</Text>

        {icon && iconPosition === "right" && (
          <View style={{ marginLeft: iconSpacing }}>{icon}</View>
        )}
      </Component>
    );
  }
);

Badge.displayName = "Badge";

// Export types for external use
export type { BadgeSize, BadgeVariant };

export { Badge };

// Basic usage examples:

// Example 1: Simple status badge
// <Badge variant="success" size="sm">Available</Badge>

// Example 2: Interactive badge with icon
// <Badge variant="premium" size="md" onPress={() => console.log('pressed')}>
//   Premium Car
// </Badge>

// Example 3: Car rental category badge
// <Badge variant="luxury" size="lg" icon={<StarIcon />} iconPosition="left">
//   Luxury Vehicle
// </Badge>
