// components/ui/ScreenHeader.tsx

import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { isRTL, currentLanguage } = useLanguageStore();
  const fonts = useFontFamily();

  const styles = StyleSheet.create({
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      // Optimized header margin for better space usage
      marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
    },
    backButton: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      // Better button padding for phone touch targets
      paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      paddingHorizontal: responsive.getResponsiveValue(10, 12, 16, 18, 20),
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    backText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
      // Optimized text spacing
      marginHorizontal: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    title: {
      fontSize: responsive.getFontSize(18, 17, 20),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      textAlign: "center",
    },

    spacer: {
      width: responsive.getResponsiveValue(70, 80, 90, 100, 110),
    },
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons
          name={isRTL ? "chevron-forward" : "chevron-back"}
          size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
          color={colors.text}
        />
        <Text style={styles.backText}>
          {currentLanguage === "ar" ? "العودة" : "Back"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.spacer} />
    </View>
  );
}
