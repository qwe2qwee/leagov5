import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { DimensionValue, View, ViewStyle } from "react-native";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  color?: "default" | "light" | "dark" | "primary" | "muted";
  thickness?: number;
  style?: ViewStyle;
  length?: DimensionValue; // For custom length - using proper React Native type
}

const Separator = React.forwardRef<View, SeparatorProps>(
  (
    {
      orientation = "horizontal",
      color = "default",
      thickness,
      style,
      length,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    const { getResponsiveValue } = useResponsive();

    const separatorStyle: ViewStyle = React.useMemo(() => {
      // Default thickness based on orientation and screen size
      const defaultThickness = getResponsiveValue(0.5, 0.75, 1, 1, 1.5);
      const finalThickness = thickness ?? defaultThickness;

      // Color mapping using LEAGO colors
      const colorMap = {
        default: colors.border,
        light: colors.borderLight,
        dark: colors.borderDark,
        primary: colors.primary,
        muted: colors.textMuted,
      };

      const backgroundColor = colorMap[color];

      // Base style
      const baseStyle: ViewStyle = {
        backgroundColor,
        flexShrink: 0,
      };

      // Orientation-specific styles
      if (orientation === "horizontal") {
        return {
          ...baseStyle,
          height: finalThickness,
          width: (length ?? "100%") as DimensionValue,
        };
      } else {
        return {
          ...baseStyle,
          width: finalThickness,
          height: (length ?? "100%") as DimensionValue,
        };
      }
    }, [orientation, color, thickness, length, colors, getResponsiveValue]);

    return <View ref={ref} style={[separatorStyle, style]} {...props} />;
  }
);

Separator.displayName = "Separator";

export { Separator };
export default Separator;
