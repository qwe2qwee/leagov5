import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // More granular screen size detection
  const isVerySmallScreen = height < 600 || width < 320; // Very old devices
  const isSmallScreen = height < 650 || width < 360; // Small phones
  const isMediumScreen = !isSmallScreen && height < 750; // Medium phones
  const isLargeScreen = height >= 750 && height < 900; // Large phones
  const isVeryLargeScreen = height >= 900; // Tablets and very large phones

  // Aspect ratio calculations
  const aspectRatio = width / height;
  const isWideScreen = aspectRatio > 0.55; // Landscape-ish or wide screens
  const isTallScreen = aspectRatio < 0.45; // Very tall screens

  // Device type detection (approximate)
  const isTablet = width >= 768 || height >= 1024;
  const isPhone = !isTablet;

  // Scale factor based on screen size (useful for responsive sizing)
  const scaleFactor = Math.min(width / 375, height / 812); // Based on iPhone X as reference

  // Safe responsive values
  const getResponsiveValue = (
    verySmall: number,
    small: number,
    medium: number,
    large: number,
    veryLarge?: number
  ) => {
    if (isVerySmallScreen) return verySmall;
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    if (isLargeScreen) return large;
    return veryLarge || large;
  };

  // Font size helpers
  const getFontSize = (
    baseSize: number,
    minSize?: number,
    maxSize?: number
  ) => {
    const scaledSize = baseSize * scaleFactor;
    const finalSize = Math.max(
      minSize || baseSize * 0.8,
      Math.min(maxSize || baseSize * 1.2, scaledSize)
    );
    return finalSize;
  };

  // Spacing helpers
  const getSpacing = (baseSpacing: number) => {
    return getResponsiveValue(
      baseSpacing * 0.6,
      baseSpacing * 0.8,
      baseSpacing,
      baseSpacing * 1.1,
      baseSpacing * 1.2
    );
  };

  return {
    // Screen size booleans
    isVerySmallScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isVeryLargeScreen,

    // Device type
    isTablet,
    isPhone,

    // Screen characteristics
    isWideScreen,
    isTallScreen,
    aspectRatio,

    // Dimensions
    width,
    height,

    // Responsive helpers
    scaleFactor,
    getResponsiveValue,
    getFontSize,
    getSpacing,
  };
}
