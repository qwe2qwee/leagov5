// ============================
// components/Search/SkeletonLoader.tsx
// ============================

import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { View } from "react-native";

interface SkeletonLoaderProps {
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 4 }) => {
  const { colors } = useTheme();
  const { getSpacing, isSmallScreen, isMediumScreen, width } = useResponsive();

  // Grid card width - same calculation as FeaturedCars
  const gridCardWidth = (width - getSpacing(20) * 2 - getSpacing(3)) / 2;

  const getImageHeight = () => {
    if (isSmallScreen) return 100;
    if (isMediumScreen) return 120;
    return 140;
  };

  const cardStyle = {
    width: gridCardWidth,
    height: getImageHeight() + getSpacing(130), // Same height as CarCard
    backgroundColor: colors.surface,
    borderRadius: getSpacing(8),
    overflow: "hidden" as const,
    marginBottom: getSpacing(8),
    padding: 0,
  };

  const imageSkeletonStyle = {
    height: getImageHeight(),
    backgroundColor: colors.border || colors.backgroundSecondary,
    opacity: 0.6,
  };

  const contentStyle = {
    padding: getSpacing(8),
    flex: 1,
    justifyContent: "space-between" as const,
  };

  const lineStyle = {
    backgroundColor: colors.border || colors.backgroundSecondary,
    borderRadius: 4,
    marginBottom: getSpacing(4),
    opacity: 0.5,
  };

  const buttonSkeletonStyle = {
    backgroundColor: colors.border || colors.backgroundSecondary,
    borderRadius: getSpacing(6),
    opacity: 0.4,
  };

  const gridCardStyle = cardStyle;

  const gridContainerStyle = {
    padding: getSpacing(16),
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
  };

  const gridItemStyle = {
    width: gridCardWidth,
    marginBottom: getSpacing(16),
  };

  return (
    <View style={gridContainerStyle}>
      {[...Array(count)].map((_, index) => (
        <View key={index} style={gridItemStyle}>
          <View style={gridCardStyle}>
            {/* Image skeleton */}
            <View style={imageSkeletonStyle} />

            {/* Content skeleton */}
            <View style={contentStyle}>
              <View>
                {/* Title lines */}
                <View
                  style={[
                    lineStyle,
                    { height: 14, width: "85%", marginBottom: getSpacing(2) },
                  ]}
                />
                <View
                  style={[
                    lineStyle,
                    { height: 12, width: "65%", marginBottom: getSpacing(6) },
                  ]}
                />

                {/* Features skeleton */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: getSpacing(4),
                    marginBottom: getSpacing(8),
                  }}
                >
                  <View
                    style={[
                      lineStyle,
                      { height: 10, width: 45, marginBottom: 0 },
                    ]}
                  />
                  <View
                    style={[
                      lineStyle,
                      { height: 10, width: 55, marginBottom: 0 },
                    ]}
                  />
                </View>

                {/* Price and availability */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: getSpacing(8),
                  }}
                >
                  <View>
                    <View
                      style={[
                        lineStyle,
                        { height: 16, width: 60, marginBottom: getSpacing(2) },
                      ]}
                    />
                    <View
                      style={[
                        lineStyle,
                        { height: 8, width: 40, marginBottom: 0 },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      lineStyle,
                      { height: 10, width: 70, marginBottom: 0 },
                    ]}
                  />
                </View>
              </View>

              {/* Button skeleton */}
              <View
                style={[
                  buttonSkeletonStyle,
                  {
                    height: getSpacing(8) * 2 + 12,
                    marginTop: getSpacing(2),
                  },
                ]}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default SkeletonLoader;
