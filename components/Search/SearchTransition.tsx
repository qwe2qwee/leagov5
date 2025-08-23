// ============================
// components/Search/SearchTransition.tsx
// ============================

import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextStyle, TouchableOpacity, View } from "react-native";

interface SearchTransitionProps {
  recentSearches: string[];
  onSuggestionSelect: (suggestion: string) => void;
}

const SearchTransition: React.FC<SearchTransitionProps> = ({
  recentSearches,
  onSuggestionSelect,
}) => {
  const { colors } = useTheme();
  const { getSpacing, getFontSize } = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  // Default trending searches
  const trendingSearches = ["كامري", "أكورد", "سونتا"];

  const spacing = {
    xs: getSpacing(4),
    sm: getSpacing(8),
    md: getSpacing(16),
  };

  const fontSizes = {
    sm: getFontSize(14),
    md: getFontSize(16),
  };

  const styles = {
    transitionContainer: {
      padding: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSizes.md,
      fontFamily: fonts.SemiBold,
      color: colors.text,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
      textAlign: isRTL ? ("right" as const) : ("left" as const),
    } as TextStyle,
    chipContainer: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
      flexWrap: "wrap" as const,
      gap: spacing.sm,
    },
    chip: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
      alignItems: "center" as const,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      gap: 6,
    },
    trendingChip: {
      backgroundColor: colors.primary + "10",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    chipText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      fontFamily: fonts.Regular,
    } as TextStyle,
    trendingChipText: {
      color: colors.primary,
      fontFamily: fonts.Medium,
    } as TextStyle,
  };

  return (
    <View style={styles.transitionContainer}>
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            {currentLanguage === "ar"
              ? "عمليات البحث الحديثة"
              : "Recent Searches"}
          </Text>
          <View style={styles.chipContainer}>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => onSuggestionSelect(search)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.chipText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Trending Searches */}
      {/* <Text style={styles.sectionTitle}>
        {currentLanguage === "ar" ? "الأكثر بحثاً" : "Trending"}
      </Text>
      <View style={styles.chipContainer}>
        {trendingSearches.map((trend, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.chip, styles.trendingChip]}
            onPress={() => onSuggestionSelect(trend)}
            activeOpacity={0.7}
          >
            <Ionicons name="trending-up" size={14} color={colors.primary} />
            <Text style={[styles.chipText, styles.trendingChipText]}>
              {trend}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}
    </View>
  );
};

export default SearchTransition;
