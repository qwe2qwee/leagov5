// ============================
// components/Search/SearchHeader.tsx
// ============================

import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
  onClearSearch: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  isSearchActive,
  setIsSearchActive,
  onClearSearch,
}) => {
  const { colors } = useTheme();
  const { getSpacing, getFontSize, isSmallScreen } = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const spacing = {
    sm: getSpacing(8),
    md: getSpacing(16),
    xl: getSpacing(32),
  };

  const fontSizes = {
    md: getFontSize(16),
  };

  const styles = {
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: Platform.OS === "ios" ? spacing.xl : spacing.sm,
    },
    searchContainer: {
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
      alignItems: "center" as const,
    },
    searchInput: {
      flex: 1,
      flexDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
      alignItems: "center" as const,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: isSmallScreen ? 8 : 12,
      paddingHorizontal: spacing.md,
      paddingVertical: isSmallScreen ? spacing.sm : spacing.md,
      gap: spacing.sm,
    },
    searchPlaceholder: {
      flex: 1,
      color: colors.textMuted,
      fontSize: fontSizes.md,
      fontFamily: fonts.Regular,
      textAlign: isRTL ? ("right" as const) : ("left" as const),
    } as TextStyle,
  };

  const handleActivateSearch = () => {
    setIsSearchActive(true);
  };

  return (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchInput}
          onPress={handleActivateSearch}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>
            {searchQuery ||
              (currentLanguage === "ar"
                ? "ابحث عن السيارات..."
                : "Search for cars...")}
          </Text>
          {searchQuery ? (
            <TouchableOpacity onPress={onClearSearch}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchHeader;
