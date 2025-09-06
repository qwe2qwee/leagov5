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

// Main Card Component - Improved responsive sizing
const Card = React.memo(
  React.forwardRef<View, CardProps>(
    (
      { children, type = "default", style, elevated = false, ...props },
      ref
    ) => {
      const { cardStyle } = useCardTheme(type);
      const responsive = useResponsive();

      const baseCardStyle: ViewStyle = React.useMemo(
        () => ({
          // Better responsive border radius that scales with screen size
          borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
          borderWidth: 1,
          overflow: "hidden",
          ...cardStyle,
          // No shadows - completely removed shadow properties
        }),
        [cardStyle, responsive]
      );

      return (
        <View ref={ref} style={[baseCardStyle, style]} {...props}>
          {children}
        </View>
      );
    }
  )
);

// Card Header Component - Improved responsive padding
const CardHeader = React.memo(
  React.forwardRef<View, CardHeaderProps>(
    ({ children, style, ...props }, ref) => {
      const responsive = useResponsive();

      const headerStyle: ViewStyle = React.useMemo(
        () => ({
          // Better responsive horizontal padding
          paddingHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
          // Better responsive top padding
          paddingTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
          // Better responsive bottom padding
          paddingBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
        }),
        [responsive]
      );

      return (
        <View ref={ref} style={[headerStyle, style]} {...props}>
          {children}
        </View>
      );
    }
  )
);

// Card Title Component - Improved responsive typography
const CardTitle = React.memo(
  React.forwardRef<Text, CardTitleProps>(
    ({ children, style, size = "md", ...props }, ref) => {
      const { colors } = useTheme();
      const responsive = useResponsive();
      const fontFamily = useFontFamily();

      const titleStyle: TextStyle = React.useMemo(() => {
        // Improved responsive font sizes with better scaling
        const sizeStyles = {
          sm: { fontSize: responsive.getFontSize(16, 15, 19) },
          md: { fontSize: responsive.getFontSize(18, 17, 22) },
          lg: { fontSize: responsive.getFontSize(22, 20, 26) },
        };

        return {
          color: colors.text,
          fontFamily:
            fontFamily.SemiBold || fontFamily.Bold || fontFamily.Regular,
          lineHeight: Math.round(sizeStyles[size].fontSize * 1.3),
          letterSpacing: -0.5,
          // Responsive margin bottom
          marginBottom: responsive.getResponsiveValue(3, 4, 5, 6, 7),
          ...sizeStyles[size],
        };
      }, [colors.text, responsive, fontFamily, size]);

      return (
        <Text ref={ref} style={[titleStyle, style]} {...props}>
          {children}
        </Text>
      );
    }
  )
);

// Card Description Component - Improved responsive typography
const CardDescription = React.memo(
  React.forwardRef<Text, CardDescriptionProps>(
    ({ children, style, ...props }, ref) => {
      const { colors } = useTheme();
      const responsive = useResponsive();
      const fontFamily = useFontFamily();

      const descriptionStyle: TextStyle = React.useMemo(
        () => ({
          color: colors.textSecondary,
          // Better responsive font size for descriptions
          fontSize: responsive.getFontSize(14, 13, 16),
          fontFamily: fontFamily.Regular,
          // Improved responsive line height
          lineHeight: Math.round(responsive.getFontSize(14, 13, 16) * 1.4),
          // Responsive margin bottom
          marginBottom: responsive.getResponsiveValue(1, 2, 3, 4, 5),
        }),
        [colors.textSecondary, responsive, fontFamily]
      );

      return (
        <Text ref={ref} style={[descriptionStyle, style]} {...props}>
          {children}
        </Text>
      );
    }
  )
);

// Card Content Component - Improved responsive padding
const CardContent = React.memo(
  React.forwardRef<View, CardContentProps>(
    ({ children, style, ...props }, ref) => {
      const responsive = useResponsive();

      const contentStyle: ViewStyle = React.useMemo(
        () => ({
          // Better responsive horizontal padding
          paddingHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
          // Better responsive bottom padding
          paddingBottom: responsive.getResponsiveValue(10, 12, 16, 18, 20),
        }),
        [responsive]
      );

      return (
        <View ref={ref} style={[contentStyle, style]} {...props}>
          {children}
        </View>
      );
    }
  )
);

// Card Footer Component - Improved responsive padding
const CardFooter = React.memo(
  React.forwardRef<View, CardFooterProps>(
    ({ children, style, justify = "flex-start", ...props }, ref) => {
      const responsive = useResponsive();

      const footerStyle: ViewStyle = React.useMemo(
        () => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: justify,
          // Better responsive horizontal padding
          paddingHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
          // Better responsive bottom padding
          paddingBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
          // Better responsive top padding
          paddingTop: responsive.getResponsiveValue(6, 8, 10, 12, 14),
        }),
        [responsive, justify]
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

// Basic usage examples:

// Example 1: Simple product card
// <Card type="default">
//   <Card.Header>
//     <Card.Title size="md">Tesla Model 3</Card.Title>
//     <Card.Description>Electric Vehicle</Card.Description>
//   </Card.Header>
//   <Card.Content>
//     <Text>Premium electric sedan with autopilot capabilities</Text>
//   </Card.Content>
// </Card>

// Example 2: Car rental booking card
// <Card type="primary">
//   <Card.Header>
//     <Card.Title size="lg">BMW X5</Card.Title>
//     <Card.Description>Luxury SUV</Card.Description>
//   </Card.Header>
//   <Card.Content>
//     <Text>Available for booking from $120/day</Text>
//   </Card.Content>
//   <Card.Footer justify="space-between">
//     <Button variant="outline">Details</Button>
//     <Button variant="primary">Book Now</Button>
//   </Card.Footer>
// </Card>

// Example 3: Status card with warning
// <Card type="warning">
//   <Card.Header>
//     <Card.Title size="sm">Maintenance Required</Card.Title>
//   </Card.Header>
//   <Card.Content>
//     <Text>Vehicle needs service before next rental</Text>
//   </Card.Content>
// </Card>
