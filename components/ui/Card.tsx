import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import * as React from "react";
import { Text, TextStyle, View, ViewStyle } from "react-native";

// Types for React Native Card components
export type CardType =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error";

interface CardProps {
  children: React.ReactNode;
  type?: CardType;
  style?: ViewStyle;
  elevated?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
  size?: "sm" | "md" | "lg";
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
  justify?: "flex-start" | "flex-end" | "center" | "space-between";
}

// Hook to get card theme based on type
const useCardTheme = (type: CardType) => {
  const { colors } = useTheme();

  return React.useMemo(() => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    };

    const typeStyles: Record<CardType, ViewStyle> = {
      default: baseStyle,
      primary: {
        ...baseStyle,
        borderColor: colors.primary,
        backgroundColor: colors.surface,
      },
      secondary: {
        ...baseStyle,
        borderColor: colors.borderDark,
        backgroundColor: colors.backgroundSecondary,
      },
      success: {
        ...baseStyle,
        borderColor: colors.success,
        backgroundColor: colors.surface,
      },
      warning: {
        ...baseStyle,
        borderColor: colors.warning,
        backgroundColor: colors.surface,
      },
      error: {
        ...baseStyle,
        borderColor: colors.error,
        backgroundColor: colors.surface,
      },
    };

    return {
      cardStyle: typeStyles[type],
    };
  }, [colors, type]);
};

// Main Card Component
const Card = React.memo(
  React.forwardRef<View, CardProps>(
    (
      { children, type = "default", style, elevated = false, ...props },
      ref
    ) => {
      const { cardStyle } = useCardTheme(type);
      const { getBorderRadius } = useResponsive();

      const baseCardStyle: ViewStyle = React.useMemo(
        () => ({
          borderRadius: getBorderRadius("medium"),
          borderWidth: 1,
          overflow: "hidden",
          ...cardStyle,
          // No shadows - completely removed shadow properties
        }),
        [cardStyle, getBorderRadius]
      );

      return (
        <View ref={ref} style={[baseCardStyle, style]} {...props}>
          {children}
        </View>
      );
    }
  )
);

// Card Header Component
const CardHeader = React.memo(
  React.forwardRef<View, CardHeaderProps>(
    ({ children, style, ...props }, ref) => {
      const { spacing } = useResponsive();

      const headerStyle: ViewStyle = React.useMemo(
        () => ({
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.sm,
        }),
        [spacing]
      );

      return (
        <View ref={ref} style={[headerStyle, style]} {...props}>
          {children}
        </View>
      );
    }
  )
);

// Card Title Component
const CardTitle = React.memo(
  React.forwardRef<Text, CardTitleProps>(
    ({ children, style, size = "md", ...props }, ref) => {
      const { colors } = useTheme();
      const { typography } = useResponsive();
      const fontFamily = useFontFamily();

      const titleStyle: TextStyle = React.useMemo(() => {
        const sizeStyles = {
          sm: { fontSize: typography.h4 },
          md: { fontSize: typography.h3 },
          lg: { fontSize: typography.h2 },
        };

        return {
          color: colors.text,
          fontFamily:
            fontFamily.SemiBold || fontFamily.Bold || fontFamily.Regular,
          lineHeight: sizeStyles[size].fontSize * 1.2,
          letterSpacing: -0.5,
          marginBottom: 4,
          ...sizeStyles[size],
        };
      }, [colors.text, typography, fontFamily, size]);

      return (
        <Text ref={ref} style={[titleStyle, style]} {...props}>
          {children}
        </Text>
      );
    }
  )
);

// Card Description Component
const CardDescription = React.memo(
  React.forwardRef<Text, CardDescriptionProps>(
    ({ children, style, ...props }, ref) => {
      const { colors } = useTheme();
      const { typography } = useResponsive();
      const fontFamily = useFontFamily();

      const descriptionStyle: TextStyle = React.useMemo(
        () => ({
          color: colors.textSecondary,
          fontSize: typography.body,
          fontFamily: fontFamily.Regular,
          lineHeight: typography.body * 1.4,
          marginBottom: 2,
        }),
        [colors.textSecondary, typography, fontFamily]
      );

      return (
        <Text ref={ref} style={[descriptionStyle, style]} {...props}>
          {children}
        </Text>
      );
    }
  )
);

// Card Content Component
const CardContent = React.memo(
  React.forwardRef<View, CardContentProps>(
    ({ children, style, ...props }, ref) => {
      const { spacing } = useResponsive();

      const contentStyle: ViewStyle = React.useMemo(
        () => ({
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
        }),
        [spacing]
      );

      return (
        <View ref={ref} style={[contentStyle, style]} {...props}>
          {children}
        </View>
      );
    }
  )
);

// Card Footer Component
const CardFooter = React.memo(
  React.forwardRef<View, CardFooterProps>(
    ({ children, style, justify = "flex-start", ...props }, ref) => {
      const { spacing } = useResponsive();

      const footerStyle: ViewStyle = React.useMemo(
        () => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: justify,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.lg,
          paddingTop: spacing.sm,
        }),
        [spacing, justify]
      );

      return (
        <View ref={ref} style={[footerStyle, style]} {...props}>
          {children}
        </View>
      );
    }
  )
);

// Set display names for debugging
Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

// Compound component pattern - allows Card.Header syntax
const CardWithComponents = Card as typeof Card & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
};

CardWithComponents.Header = CardHeader;
CardWithComponents.Title = CardTitle;
CardWithComponents.Description = CardDescription;
CardWithComponents.Content = CardContent;
CardWithComponents.Footer = CardFooter;

export {
  CardWithComponents as Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};

// Export individual components for flexibility
export default CardWithComponents;
