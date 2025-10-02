// components/Bookings/EmptyState.tsx
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        emptyContainer: {
          alignItems: "center",
          paddingVertical: responsive.spacing.xxl * 2,
          gap: responsive.spacing.md,
        },
        emptyIcon: {
          width: responsive.getResponsiveValue(80, 90, 100, 110, 120),
          height: responsive.getResponsiveValue(80, 90, 100, 110, 120),
          borderRadius: responsive.getResponsiveValue(40, 45, 50, 55, 60),
          backgroundColor: colors.backgroundSecondary,
          justifyContent: "center",
          alignItems: "center",
        },
        emptyText: {
          fontSize: responsive.typography.body,
          fontFamily: fonts.Regular,
          color: colors.textSecondary,
          textAlign: "center",
        },
      }),
    [colors, responsive, fonts]
  );

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="calendar-outline"
          size={responsive.getIconSize("large") * 1.5}
          color={colors.textSecondary}
        />
      </View>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};
