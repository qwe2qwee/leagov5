// ============================
// components/Search/SearchSuggestions.tsx
// ============================

import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextStyle, TouchableOpacity, View } from "react-native";

interface SearchSuggestionsProps {
  suggestions: {
    brands: any[];
    models: any[];
    cars: any[];
  };
  searchQuery: string;
  onSuggestionSelect: (suggestion: string) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  searchQuery,
  onSuggestionSelect,
}) => {
  const { colors } = useTheme();
  const { getSpacing, getFontSize } = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

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
    suggestionsContainer: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    suggestionSection: {
      paddingVertical: spacing.sm,
    },
    suggestionSectionTitle: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.Medium,
      color: colors.textMuted,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xs,
      textAlign: isRTL ? ("right" as const) : ("left" as const),
    } as TextStyle,
    suggestionItem: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
      alignItems: "center" as const,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    suggestionText: {
      fontSize: fontSizes.md,
      color: colors.text,
      fontFamily: fonts.Regular,
    } as TextStyle,
    highlightText: {
      fontFamily: fonts.Bold,
      color: colors.primary,
    } as TextStyle,
  };

  // Helper function to highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Text key={index} style={styles.highlightText}>
          {part}
        </Text>
      ) : (
        part
      )
    );
  };

  return (
    <View style={styles.suggestionsContainer}>
      {/* Brand Suggestions */}
      {suggestions.brands.length > 0 && (
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionSectionTitle}>
            {currentLanguage === "ar" ? "العلامات التجارية" : "Brands"}
          </Text>
          {suggestions.brands.map((brand: any, index: number) => {
            const brandName =
              currentLanguage === "ar" ? brand.name_ar : brand.name_en;
            return (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => onSuggestionSelect(brandName)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="car-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.suggestionText}>
                  {highlightText(brandName, searchQuery)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Model Suggestions */}
      {suggestions.models.length > 0 && (
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionSectionTitle}>
            {currentLanguage === "ar" ? "الموديلات" : "Models"}
          </Text>
          {suggestions.models.map((model: any, index: number) => {
            const modelName =
              currentLanguage === "ar" ? model.name_ar : model.name_en;
            return (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => onSuggestionSelect(modelName)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="search"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.suggestionText}>
                  {highlightText(modelName, searchQuery)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Car Suggestions */}
      {suggestions.cars.length > 0 && (
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionSectionTitle}>
            {currentLanguage === "ar" ? "السيارات" : "Cars"}
          </Text>
          {suggestions.cars.map((car: any, index: number) => {
            const carName =
              currentLanguage === "ar"
                ? `${car.brand_name_ar} ${car.model_name_ar}`
                : `${car.brand_name_en} ${car.model_name_en}`;
            return (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => onSuggestionSelect(carName)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="car-sport-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.suggestionText}>
                  {highlightText(carName, searchQuery)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default SearchSuggestions;
