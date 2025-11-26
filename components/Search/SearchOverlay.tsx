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

  // Refs for debouncing and preventing race conditions
  const searchInputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const suggestionsAbortRef = useRef<AbortController | null>(null);
  const currentSearchQuery = useRef(searchQuery);

  const spacing = {
    xs: getSpacing(4),
    sm: getSpacing(8),
    md: getSpacing(16),
    xl: getSpacing(32),
  };

  const fontSizes = {
    md: getFontSize(16),
  };

  // Update current search query ref
  useEffect(() => {
    currentSearchQuery.current = searchQuery;
  }, [searchQuery]);

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

  // Cleanup function to abort ongoing requests
  const cleanupRequests = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    if (suggestionsAbortRef.current) {
      suggestionsAbortRef.current.abort();
    }
  }, []);

  // Enhanced search with proper debouncing and race condition handling
  const performSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();

      // Cancel any ongoing requests
      cleanupRequests();

      // Clear results if query is empty
      if (!trimmedQuery) {
        clearSuggestions();
        clearSearchResults();
        return;
      }

      // Create new abort controllers
      searchAbortRef.current = new AbortController();
      suggestionsAbortRef.current = new AbortController();

      try {
        // Get suggestions for queries > 1 character
        if (trimmedQuery.length > 1) {
          const suggestionsPromise = getQuickSuggestions(
            trimmedQuery,
            currentLanguage
          );

          // Wait for suggestions (quick operation)
          await suggestionsPromise;

          // Check if query hasn't changed while we were getting suggestions
          if (currentSearchQuery.current !== query) {
            return; // Query changed, abort
          }
        }

        // Perform actual search for queries > 2 characters
        if (trimmedQuery.length > 2) {
          await searchCars(
            trimmedQuery,
            currentLanguage,
            selectedFilters,
            "distance",
            userLocation || undefined
          );

          // Final check if query is still the same
          if (currentSearchQuery.current !== query) {
            return; // Query changed, results are stale
          }
        }
      } catch (error: any) {
        // Only log error if it's not an abort
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
        }
      }
    },
    [
      currentLanguage,
      selectedFilters,
      userLocation,
      cleanupRequests,
      clearSuggestions,
      clearSearchResults,
      getQuickSuggestions,
      searchCars,
    ]
  );

  // Debounced search effect
  useEffect(() => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce

    // Cleanup on unmount or dependency change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRequests();
    };
  }, [cleanupRequests]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim() && !recentSearches.includes(query.trim())) {
        setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)]);
      }
    },
    [recentSearches, setSearchQuery]
  );

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      clearSuggestions();
      searchInputRef.current?.blur();

      // Add to recent searches
      if (!recentSearches.includes(suggestion)) {
        setRecentSearches((prev) => [suggestion, ...prev.slice(0, 4)]);
      }
    },
    [setSearchQuery, clearSuggestions, recentSearches]
  );

  const clearSearch = useCallback(() => {
    cleanupRequests();
    setSearchQuery("");
    clearSearchResults();
    clearSuggestions();
    searchInputRef.current?.focus();
  }, [cleanupRequests, setSearchQuery, clearSearchResults, clearSuggestions]);

  const deactivateSearch = useCallback(() => {
    cleanupRequests();
    setIsSearchActive(false);
    clearSuggestions();
    Keyboard.dismiss();
  }, [cleanupRequests, setIsSearchActive, clearSuggestions]);

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
      elevation: 2,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
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
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeSearchInput: {
      flex: 1,
      fontSize: fontSizes.md,
      color: colors.text,
      fontFamily: fonts.Regular,
      textAlign: isRTL ? ("right" as const) : ("left" as const),
      paddingVertical: 4,
      writingDirection:
        currentLanguage === "ar" ? ("rtl" as const) : ("ltr" as const),
    } as TextStyle,
    cancelButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    cancelText: {
      fontSize: fontSizes.md,
      color: colors.primary,
      fontFamily: fonts.Medium || fonts.Regular,
      writingDirection:
        currentLanguage === "ar" ? ("rtl" as const) : ("ltr" as const),
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
      .map((s) => ({
        name_ar: s.suggestion,
        name_en: s.suggestion,
      })),
    models: suggestions
      .filter((s) => s.source === "model")
      .map((s) => ({
        name_ar: s.suggestion,
        name_en: s.suggestion,
      })),
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
            onSubmitEditing={() => {
              clearSuggestions();
              searchInputRef.current?.blur();
            }}
            selectTextOnFocus={false}
            clearButtonMode="never"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={clearSearch}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.cancelText}>
            {currentLanguage === "ar" ? "إلغاء" : "Cancel"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Content */}
      <View style={styles.searchContent}>
        {/* Search Transition (Recent & Trending) */}
        {!searchQuery.trim() && (
          <SearchTransition
            recentSearches={recentSearches}
            onSuggestionSelect={handleSuggestionSelect}
          />
        )}

        {/* Search Suggestions - show only when we have suggestions and no search results */}
        {suggestions.length > 0 &&
          searchQuery.trim().length > 1 &&
          searchQuery.trim().length <= 2 && (
            <SearchSuggestions
              suggestions={transformedSuggestions}
              searchQuery={searchQuery}
              onSuggestionSelect={handleSuggestionSelect}
            />
          )}

        {/* Search Results - show when query is long enough */}
        {searchQuery.trim().length > 2 && (
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
