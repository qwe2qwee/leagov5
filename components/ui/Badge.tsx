import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { BadgeProps } from "@/types/CardTypes";
import { Text, View } from "react-native";

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const { getFontSize } = useResponsive();
  const fonts = useFontFamily();

  const getBadgeStyles = () => {
    const baseStyle = {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start" as const,
    };

    switch (variant) {
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: colors.backgroundSecondary,
        };
      case "destructive":
        return {
          ...baseStyle,
          backgroundColor: colors.error,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "secondary":
        return colors.text;
      case "destructive":
        return colors.textInverse;
      case "outline":
        return colors.text;
      default:
        return colors.textInverse;
    }
  };

  return (
    <View style={[getBadgeStyles(), style]}>
      <Text
        style={[
          {
            fontSize: getFontSize(11),
            fontFamily: fonts.SemiBold,
            color: getTextColor(),
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};
