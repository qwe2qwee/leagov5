// CarSearchScreen.tsx - updated (remove TouchableWithoutFeedback)
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FeaturedCars from "@/components/Search/FeaturedCars";
import SearchHeader from "@/components/Search/SearchHeader";
import SearchOverlay from "@/components/Search/SearchOverlay";
import { useTheme } from "@/hooks/useTheme";

const CarSearchScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top,
    },
    keyboardView: { flex: 1 },
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
    >
      {/* Note: removed TouchableWithoutFeedback wrapper that was interfering with FlatList touches */}
      <View style={styles.container}>
        <StatusBar
          barStyle={
            colors.text === "#11181C" ? "dark-content" : "light-content"
          }
          backgroundColor={colors.background}
        />

        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchActive={isSearchActive}
          setIsSearchActive={setIsSearchActive}
          onClearSearch={() => {
            setSearchQuery("");
            setIsSearchActive(false);
            Keyboard.dismiss();
          }}
        />

        {!isSearchActive && <FeaturedCars />}

        {isSearchActive && (
          <SearchOverlay
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsSearchActive={setIsSearchActive}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default CarSearchScreen;
