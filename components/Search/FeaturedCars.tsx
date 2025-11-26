// ============================
// components/Search/FeaturedCars.tsx - Fixed Version
// ============================

import CarCard from "@/components/Home/CarCard";
import { useTabBarHeight } from "@/context/TabBarHeightContext";
import { useCars } from "@/hooks/supabaseHooks/useCars";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useLocation } from "@/hooks/useLocation";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { transformCarData } from "@/utils/cars/transformCarData";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { FlatList, Text, TextStyle, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SkeletonLoader from "./SkeletonLoader";

const FeaturedCars: React.FC = () => {
  const { colors } = useTheme();
  const { getSpacing, getFontSize, width } = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const { cars, nearestCars, loading, getNearestCars } = useCars();
  const { height: tabBarHeight } = useTabBarHeight();
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();

  const {
    userLocation,
    loading: locationLoading,
    getCurrentLocation,
  } = useLocation();

  const spacing = {
    md: getSpacing(16),
    lg: getSpacing(24),
  };

  const fontSizes = {
    lg: getFontSize(18),
    xl: getFontSize(24),
  };

  // Fetch location and nearest cars on mount
  useEffect(() => {
    // Store handles caching, so this is safe to call
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      getNearestCars(userLocation.lat, userLocation.lon);
    }
  }, [userLocation]);

  const styles = {
    container: {
      flex: 1,
            marginBottom:  responsive.spacing.xl + responsive.safeAreaBottom + responsive.spacing.md,

    },
    header: {
      padding: spacing.md,
      paddingBottom: spacing.md / 2,
    },
    title: {
      fontSize: fontSizes.xl,
      fontFamily: fonts.Bold,
      color: colors.text,
      marginBottom: spacing.lg,
      textAlign: isRTL ? ("right" as const) : ("left" as const),
    } as TextStyle,
    featuredTitle: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.SemiBold,
      color: colors.text,
      textAlign: isRTL ? ("right" as const) : ("left" as const),
    } as TextStyle,
    flatListContent: {
      paddingBottom: tabBarHeight + insets.bottom - spacing.lg * 3,
    },
    cardContainer: {
      width: (width - spacing.md * 3) / 2, // Account for padding and gap
      marginBottom: spacing.md - 5,
    },
    noResultsContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: spacing.lg * 1.5,
      minHeight: 300,
    },
    noResultsText: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.Medium,
      color: colors.textSecondary,
      marginTop: spacing.md,
      textAlign: "center" as const,
    } as TextStyle,
  };

  const featuredData = nearestCars.length > 0 ? nearestCars : cars;

  if (loading || locationLoading) {
    return <SkeletonLoader />;
  }

  if (featuredData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noResultsContainer}>
          <Ionicons name="car-outline" size={48} color={colors.textMuted} />
          <Text style={styles.noResultsText}>
            {currentLanguage === "ar"
              ? "لا توجد سيارات متاحة"
              : "No cars available"}
          </Text>
        </View>
      </View>
    );
  }

  const renderCarItem = ({ item, index }: { item: any; index: number }) => {
    const transformedCar = transformCarData(item);
    const isLeftColumn = index % 2 === 0;

    return (
      <View
        style={[
          styles.cardContainer,
          {
            marginRight: isLeftColumn ? spacing.md / 2 : 0,
            marginLeft: isLeftColumn ? 0 : spacing.md / 2,
          },
        ]}
      >
        <CarCard
          car={transformedCar}
          onSelect={(car) => console.log("Selected car:", car)}
          language={currentLanguage}
          cardWidth={styles.cardContainer.width}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.featuredTitle}>
          {currentLanguage === "ar"
            ? userLocation
              ? "السيارات الأقرب"
              : "السيارات المميزة"
            : userLocation
            ? "Nearest Cars"
            : "Featured Cars"}
        </Text>
      </View>

      <FlatList
        data={featuredData}
        renderItem={renderCarItem}
        keyExtractor={(item) => transformCarData(item).id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.flatListContent,
          featuredData.length > 1 && { alignItems: "center" as const },
        ]}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default FeaturedCars;
