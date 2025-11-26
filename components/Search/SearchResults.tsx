// ============================
// components/Search/SearchResults.tsx - Fixed Version
// ============================

import CarCard from "@/components/Home/CarCard";
import { useTabBarHeight } from "@/context/TabBarHeightContext";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { transformCarData } from "@/utils/cars/transformCarData";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TextStyle, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SkeletonLoader from "./SkeletonLoader";

interface SearchResultsProps {
  searchResults: any[];
  searchLoading: boolean;
  searchQuery: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults,
  searchLoading,
  searchQuery,
}) => {
  const { colors } = useTheme();
  const { getSpacing, getFontSize, width,  } = useResponsive();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const insets = useSafeAreaInsets();

  const spacing = {
    md: getSpacing(16),
    sm: getSpacing(8),
    xl: getSpacing(32),
    lg: getSpacing(24),
  };

  const { height: tabBarHeight } = useTabBarHeight();

  const fontSizes = {
    sm: getFontSize(14),
    lg: getFontSize(18),
    md: getFontSize(16),
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
      marginBottom:  responsive.spacing.xl + responsive.safeAreaBottom + responsive.spacing.md + responsive.spacing.md + responsive.spacing.md,
    },
    resultsCount: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.backgroundSecondary,
      fontFamily: fonts.Regular,
      textAlign: isRTL ? ("right" as const) : ("left" as const),
    } as TextStyle,
    flatListContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: tabBarHeight + insets.bottom - spacing.lg * 3, // Extra padding for tab bar
    },
    cardContainer: {
      width: (width - spacing.md * 3) / 2, // Account for padding and gap
      marginBottom: spacing.md,
    },
    noResultsContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: spacing.xl,
      minHeight: 300,
    },
    noResultsText: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.Medium,
      color: colors.textSecondary,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      textAlign: "center" as const,
    } as TextStyle,
    noResultsSubText: {
      fontSize: fontSizes.sm,
      color: colors.textMuted,
      fontFamily: fonts.Regular,
      textAlign: "center" as const,
      lineHeight: fontSizes.sm * 1.4,
    } as TextStyle,
  };

  if (searchLoading) {
    return <SkeletonLoader count={6} />;
  }

  if (searchResults.length === 0 && searchQuery.trim().length > 2) {
    return (
      <View style={styles.container}>
        <View style={styles.noResultsContainer}>
          <Ionicons name="search" size={48} color={colors.textMuted} />
          <Text style={styles.noResultsText}>
            {currentLanguage === "ar"
              ? "لم يتم العثور على نتائج"
              : "No results found"}
          </Text>
          <Text style={styles.noResultsSubText}>
            {currentLanguage === "ar"
              ? "جرب تعديل كلمات البحث أو تصفح الفئات المختلفة"
              : "Try adjusting your search or browse different categories"}
          </Text>
        </View>
      </View>
    );
  }

  if (searchResults.length === 0) {
    return null;
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
      <Text style={styles.resultsCount}>
        {searchResults.length} {currentLanguage === "ar" ? "نتيجة" : "result"}
        {searchResults.length !== 1 && currentLanguage === "en" ? "s" : ""}
        {currentLanguage === "ar" ? " موجودة" : " found"}
      </Text>
      <FlatList
        data={searchResults}
        renderItem={renderCarItem}
        keyExtractor={(item) => transformCarData(item).id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.flatListContent,
          searchResults.length > 1 && { alignItems: "center" as const },
        ]}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default SearchResults;
