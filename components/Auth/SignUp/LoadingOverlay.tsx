// File: components/Auth/LoadingOverlay.tsx
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// Constants
import { translationsignUp } from "@/constants/Lang/AuthLangs";

// Hooks
import { useSignUpContext } from "@/hooks/SignupHooks/useSignUpContext";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";

// Context

type Language = "ar" | "en";

const LoadingOverlay = () => {
  const { colors } = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();
  const { loading } = useSignUpContext();

  const t = translationsignUp[language as Language];

  const styles = StyleSheet.create({
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    loadingText: {
      color: colors.textInverse || "#ffffff",
      marginTop: 10,
      fontFamily: fonts.Regular || "System",
    },
  });

  if (!loading) return null;

  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={colors.primary || "#FF5C39"} />
      <Text style={styles.loadingText}>{t.loading || "Loading..."}</Text>
    </View>
  );
};

export default LoadingOverlay;
