// ============================
// components/Search/SearchOverlay.tsx - Updated Version
// ============================

import { useCars } from "@/hooks/supabaseHooks/useCars";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useLocation } from "@/hooks/useLocation";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchResults from "./SearchResults";
import SearchSuggestions from "./SearchSuggestions";
import SearchTransition from "./SearchTransition";

interface SearchOverlayProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsSearchActive: (active: boolean) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({
  searchQuery,
  setSearchQuery,
  setIsSearchActive,
}) => {
  const { colors } = useTheme();
  const { getSpacing, getFontSize, isSmallScreen } = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const insets = useSafeAreaInsets();

  const {
    searchResults,
    suggestions,
    searchLoading,
    searchCars,
    getQuickSuggestions,
    clearSearchResults,
    clearSuggestions,
  } = useCars();

  const { userLocation } = useLocation();

  // State management
  const [selectedFilters, setSelectedFilters] = useState({
    minPrice: "",
    maxPrice: "",
    seats: "all",
    fuelType: "all",
    transmission: "all",
    showNewOnly: false,
    showDiscountedOnly: false,
  });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [recentSearches, setRecentSearches] = useState([
    "تويوتا",
    "مرسيدس",
    "BMW",
  ]);

  // Refs
  const searchInputRef = useRef<TextInput>(null);

  const spacing = {
    xs: getSpacing(4),
    sm: getSpacing(8),
    md: getSpacing(16),
    xl: getSpacing(32),
  };

  const fontSizes = {
    md: getFontSize(16),
  };

  // Keyboard event handlers
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      handleKeyboardShow
    );
    const keyboardHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      handleKeyboardHide
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const handleKeyboardShow = useCallback((event: any) => {
    setKeyboardVisible(true);
    setKeyboardHeight(event.endCoordinates.height);
  }, []);

  const handleKeyboardHide = useCallback(() => {
    setKeyboardVisible(false);
    setKeyboardHeight(0);
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        // Get suggestions for autocomplete
        await getQuickSuggestions(searchQuery, currentLanguage);

        // Perform actual search if query is long enough
        if (searchQuery.trim().length > 2) {
          await searchCars(
            searchQuery,
            currentLanguage,
            selectedFilters,
            "distance",
            userLocation || undefined
          );
        }
      } else {
        clearSuggestions();
        clearSearchResults();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedFilters, currentLanguage, userLocation]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim() && !recentSearches.includes(query)) {
        setRecentSearches((prev) => [query, ...prev.slice(0, 4)]);
      }
    },
    [recentSearches, setSearchQuery]
  );

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      clearSuggestions();
      searchInputRef.current?.blur();
    },
    [setSearchQuery, clearSuggestions]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    clearSearchResults();
    clearSuggestions();
    searchInputRef.current?.focus();
  }, [clearSearchResults, clearSuggestions, setSearchQuery]);

  const deactivateSearch = useCallback(() => {
    setIsSearchActive(false);
    clearSuggestions();
    Keyboard.dismiss();
  }, [setIsSearchActive, clearSuggestions]);

  const styles = {
    searchOverlay: {
      position: "absolute" as const,
      paddingTop: insets.top,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
      zIndex: 1000,
    },
    searchHeader: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
      alignItems: "center" as const,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      paddingTop: Platform.OS === "ios" ? spacing.xl : spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    activeSearchContainer: {
      flex: 1,
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
      alignItems: "center" as const,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: isSmallScreen ? 8 : 12,
      paddingHorizontal: spacing.md,
      paddingVertical: isSmallScreen ? 6 : 8,
      gap: spacing.sm,
      marginRight: isRTL ? 0 : spacing.sm,
      marginLeft: isRTL ? spacing.sm : 0,
    },
    activeSearchInput: {
      flex: 1,
      fontSize: fontSizes.md,
      color: colors.text,
      fontFamily: fonts.Regular,
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      paddingVertical: 4,
    } as TextStyle,
    cancelButton: {
      paddingVertical: spacing.sm,
    },
    cancelText: {
      fontSize: fontSizes.md,
      color: colors.primary,
      fontFamily: fonts.Medium,
    } as TextStyle,
    searchContent: {
      flex: 1,
      paddingBottom: keyboardVisible ? keyboardHeight : 0,
    },
  };

  // Transform suggestions to match expected format for SearchSuggestions component
  const transformedSuggestions = {
    brands: suggestions
      .filter((s) => s.source === "brand")
      .map((s) => ({ name_ar: s.suggestion, name_en: s.suggestion })),
    models: suggestions
      .filter((s) => s.source === "model")
      .map((s) => ({ name_ar: s.suggestion, name_en: s.suggestion })),
    cars: suggestions
      .filter((s) => s.source === "car")
      .map((s) => ({
        brand_name_ar: s.suggestion.split(" ")[0] || s.suggestion,
        brand_name_en: s.suggestion.split(" ")[0] || s.suggestion,
        model_name_ar:
          s.suggestion.split(" ").slice(1).join(" ") || s.suggestion,
        model_name_en:
          s.suggestion.split(" ").slice(1).join(" ") || s.suggestion,
      })),
  };

  return (
    <View style={styles.searchOverlay}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.activeSearchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={styles.activeSearchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder={
              currentLanguage === "ar"
                ? "ابحث عن السيارات..."
                : "Search for cars..."
            }
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => clearSuggestions()}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={deactivateSearch}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>
            {currentLanguage === "ar" ? "إلغاء" : "Cancel"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Content */}
      <View style={styles.searchContent}>
        {/* Search Transition (Recent & Trending) */}
        {!searchQuery && (
          <SearchTransition
            recentSearches={recentSearches}
            onSuggestionSelect={handleSuggestionSelect}
          />
        )}

        {/* Search Suggestions */}
        {suggestions.length > 0 && searchResults.length === 0 && (
          <SearchSuggestions
            suggestions={transformedSuggestions}
            searchQuery={searchQuery}
            onSuggestionSelect={handleSuggestionSelect}
          />
        )}

        {/* Search Results */}
        {searchQuery && (
          <SearchResults
            searchResults={searchResults}
            searchLoading={searchLoading}
            searchQuery={searchQuery}
          />
        )}
      </View>
    </View>
  );
};

export default SearchOverlay;
