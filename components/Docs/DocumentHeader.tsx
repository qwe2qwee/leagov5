import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DocumentHeaderProps {
  title: string;
  subtitle: string;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ title, subtitle }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      gap: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    backButton: {
      width: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      height: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: responsive.getFontSize(24, 22, 28),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      textAlign: isRTL ? "right" : "left",
    },
    subtitle: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
    },
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons
          name={isRTL ? "chevron-forward" : "chevron-back"}
          size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
          color={colors.text}
        />
      </TouchableOpacity>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

export default DocumentHeader;
