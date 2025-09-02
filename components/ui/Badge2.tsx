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

// Badge Size Configuration
const getBadgeSize = (
  size: BadgeSize,
  responsive: ReturnType<typeof useResponsive>
) => {
  const sizes = {
    sm: {
      paddingHorizontal: responsive.spacing.sm,
      paddingVertical: responsive.spacing.xs / 2,
      fontSize: responsive.typography.small,
      borderRadius: responsive.getBorderRadius("small") * 2, // More rounded
      minHeight: 20,
    },
    md: {
      paddingHorizontal: responsive.spacing.md,
      paddingVertical: responsive.spacing.xs,
      fontSize: responsive.typography.caption,
      borderRadius: responsive.getBorderRadius("medium"),
      minHeight: 24,
    },
    lg: {
      paddingHorizontal: responsive.spacing.lg,
      paddingVertical: responsive.spacing.sm,
      fontSize: responsive.typography.body,
      borderRadius: responsive.getBorderRadius("medium"),
      minHeight: 32,
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
      lineHeight: sizeConfig.fontSize * 1.2,
    };

    const iconSpacing = responsive.spacing.xs;

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
