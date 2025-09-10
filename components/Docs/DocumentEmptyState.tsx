import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DocumentEmptyStateProps {
  message: string;
}

const DocumentEmptyState: React.FC<DocumentEmptyStateProps> = ({ message }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();

  const styles = StyleSheet.create({
    emptyState: {
      alignItems: "center",
      padding: responsive.getResponsiveValue(24, 28, 32, 36, 40),
    },
    emptyIcon: {
      marginBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    emptyText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="document-outline"
        size={responsive.getResponsiveValue(48, 52, 56, 60, 64)}
        color={colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

export default DocumentEmptyState;
