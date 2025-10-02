import { useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Memoize expensive calculations
  return useMemo(() => {
    // Safe Area values
    const safeAreaTop = insets.top;
    const safeAreaBottom = insets.bottom;
    const safeAreaLeft = insets.left;
    const safeAreaRight = insets.right;

    // Available screen dimensions (excluding safe areas)
    const availableHeight = height - safeAreaTop - safeAreaBottom;
    const availableWidth = width - safeAreaLeft - safeAreaRight;

    // More granular screen size detection (using available height)
    const isVerySmallScreen = availableHeight < 600 || width < 320;
    const isSmallScreen = availableHeight < 650 || width < 360;
    const isMediumScreen = !isSmallScreen && availableHeight < 750;
    const isLargeScreen = availableHeight >= 750 && availableHeight < 900;
    const isVeryLargeScreen = availableHeight >= 900;

    // Aspect ratio calculations
    const aspectRatio = width / height;
    const isWideScreen = aspectRatio > 0.55;
    const isTallScreen = aspectRatio < 0.45;

    // Device type detection
    const isTablet = width >= 768 || height >= 1024;
    const isPhone = !isTablet;

    // Platform-specific adjustments
    const isIOS = Platform.OS === "ios";
    const isAndroid = Platform.OS === "android";

    // Scale factor
    const scaleFactor = Math.min(width / 375, height / 812);

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
      const platformAdjustment = isAndroid ? 0.95 : 1;
      const finalSize =
        Math.max(
          minSize || baseSize * 0.8,
          Math.min(maxSize || baseSize * 1.2, scaledSize)
        ) * platformAdjustment;
      return Math.round(finalSize);
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

    // 🆕 Safe Area aware helpers

    // Header height including safe area
    const getHeaderHeight = (includeSafeArea = true) => {
      const baseHeight = isIOS ? 60 : 56; // Pure header content height
      const contentHeight = getResponsiveValue(
        baseHeight * 0.9,
        baseHeight,
        baseHeight,
        baseHeight * 1.05,
        baseHeight * 1.1
      );
      return includeSafeArea ? contentHeight + safeAreaTop : contentHeight;
    };

    // Bottom tab bar height including safe area
    const getTabBarHeight = (includeSafeArea = true) => {
      const baseHeight = 60; // Pure tab content height
      const contentHeight = getResponsiveValue(
        baseHeight * 0.9,
        baseHeight,
        baseHeight,
        baseHeight * 1.05,
        baseHeight * 1.1
      );
      return includeSafeArea ? contentHeight + safeAreaBottom : contentHeight;
    };

    // Available content height (screen minus header and tabs)
    const getContentHeight = (hasHeader = true, hasTabBar = true) => {
      let usedHeight = 0;
      if (hasHeader) usedHeight += getHeaderHeight(true);
      if (hasTabBar) usedHeight += getTabBarHeight(true);
      return height - usedHeight;
    };

    // Modal positioning - centered with safe areas
    const getModalPosition = () => {
      const modalHeight = Math.min(availableHeight * 0.8, 600);
      const modalWidth = Math.min(width * 0.9, 400);
      return {
        width: modalWidth,
        height: modalHeight,
        marginTop: safeAreaTop + (availableHeight - modalHeight) / 2,
        alignSelf: "center" as const,
      };
    };

    // Safe padding for screens
    const getSafePadding = (includeHorizontal = false) => {
      return {
        paddingTop: safeAreaTop,
        paddingBottom: safeAreaBottom,
        ...(includeHorizontal && {
          paddingLeft: safeAreaLeft,
          paddingRight: safeAreaRight,
        }),
      };
    };

    // Floating action button position
    const getFABPosition = () => {
      const spacing = getSpacing(16);
      return {
        position: "absolute" as const,
        bottom: safeAreaBottom + spacing,
        right: spacing,
      };
    };

    // Toast/notification position
    const getToastPosition = (type: "top" | "bottom" = "top") => {
      const spacing = getSpacing(16);
      if (type === "top") {
        return {
          position: "absolute" as const,
          top: safeAreaTop + spacing,
          left: spacing,
          right: spacing,
        };
      } else {
        return {
          position: "absolute" as const,
          bottom: safeAreaBottom + spacing,
          left: spacing,
          right: spacing,
        };
      }
    };

    // Other existing helpers...
    const getCardHeight = () => {
      return getResponsiveValue(120, 140, 160, 180, 200);
    };

    const getCardWidth = () => {
      const padding = getSpacing(32);
      return width - padding;
    };

    const getButtonHeight = (
      type: "primary" | "secondary" | "small" = "primary"
    ) => {
      const baseHeight = type === "small" ? 40 : type === "secondary" ? 48 : 52;
      return getResponsiveValue(
        baseHeight * 0.8,
        baseHeight * 0.9,
        baseHeight,
        baseHeight * 1.05,
        baseHeight * 1.1
      );
    };

    const getInputHeight = () => {
      return getResponsiveValue(44, 48, 52, 56, 60);
    };

    const getModalWidth = () => {
      if (isTablet) return width * 0.6;
      return width * 0.9;
    };

    const getGridColumns = () => {
      if (isTablet) return 3;
      if (isVeryLargeScreen) return 2;
      return 1;
    };

    const getCalendarHeight = () => {
      return getResponsiveValue(280, 320, 360, 400, 450);
    };

    const getMessageMaxWidth = () => {
      return width * 0.75;
    };

    const getListItemHeight = (
      type: "compact" | "standard" | "detailed" = "standard"
    ) => {
      const heights = { compact: 44, standard: 64, detailed: 88 };
      const baseHeight = heights[type];
      return getResponsiveValue(
        baseHeight * 0.9,
        baseHeight,
        baseHeight,
        baseHeight * 1.05,
        baseHeight * 1.1
      );
    };

    const getImageSize = (type: "avatar" | "card" | "full" = "avatar") => {
      const baseSizes = { avatar: 40, card: 120, full: width * 0.8 };
      const baseSize = baseSizes[type];

      if (type === "full") return baseSize;

      return getResponsiveValue(
        baseSize * 0.8,
        baseSize * 0.9,
        baseSize,
        baseSize * 1.1,
        baseSize * 1.2
      );
    };

    const getBorderRadius = (size: "small" | "medium" | "large" = "medium") => {
      const radii = { small: 6, medium: 12, large: 20 };
      return radii[size] * scaleFactor;
    };

    const getIconSize = (size: "small" | "medium" | "large" = "medium") => {
      const sizes = { small: 16, medium: 24, large: 32 };
      const baseSize = sizes[size];
      return getFontSize(baseSize, baseSize * 0.8, baseSize * 1.3);
    };

    // Typography and spacing scales - memoized
    const typography = {
      h1: getFontSize(32, 28, 40),
      h2: getFontSize(26, 22, 32),
      h3: getFontSize(22, 18, 28),
      h4: getFontSize(18, 16, 24),
      body: getFontSize(16, 14, 20),
      caption: getFontSize(14, 12, 16),
      small: getFontSize(12, 10, 14),
    };

    const spacing = {
      xs: getSpacing(4),
      sm: getSpacing(8),
      md: getSpacing(16),
      lg: getSpacing(24),
      xl: getSpacing(32),
      xxl: getSpacing(48),
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
      isIOS,
      isAndroid,

      // Screen characteristics
      isWideScreen,
      isTallScreen,
      aspectRatio,

      // Dimensions
      width,
      height,
      availableWidth,
      availableHeight,

      // Safe Area insets
      safeAreaTop,
      safeAreaBottom,
      safeAreaLeft,
      safeAreaRight,

      // Basic responsive helpers
      scaleFactor,
      getResponsiveValue,
      getFontSize,
      getSpacing,

      // FitMatch-specific helpers
      getCardHeight,
      getCardWidth,
      getButtonHeight,
      getInputHeight,
      getModalWidth,
      getGridColumns,
      getCalendarHeight,
      getMessageMaxWidth,
      getListItemHeight,
      getImageSize,
      getBorderRadius,
      getIconSize,

      // 🆕 Safe Area aware helpers
      getHeaderHeight,
      getTabBarHeight,
      getContentHeight,
      getModalPosition,
      getSafePadding,
      getFABPosition,
      getToastPosition,

      // Pre-calculated scales
      typography,
      spacing,
    };
  }, [width, height, insets]);
}
