// components/Bookings/Tabs.tsx
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { BookingStatus, TabItem } from "./types";

interface TabsProps {
  tabs: TabItem[];
  activeTab: "all" | BookingStatus;
  onChangeTab: (tabId: "all" | BookingStatus) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChangeTab }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        tabsContainer: {
          backgroundColor: colors.surface,
          paddingVertical: responsive.spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        tabsScroll: {
          paddingHorizontal: responsive.spacing.md,
          gap: responsive.spacing.xs,
        },
        tab: {
          paddingHorizontal: responsive.spacing.md,
          paddingVertical: responsive.spacing.sm,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: responsive.getBorderRadius("medium"),
          borderWidth: 1,
          borderColor: "transparent",
          minHeight: responsive.getResponsiveValue(36, 38, 40, 42, 44),
          justifyContent: "center",
        },
        activeTab: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        tabText: {
          fontSize: responsive.typography.caption,
          fontFamily: fonts.Medium || fonts.Regular,
          color: colors.textSecondary,
        },
        activeTabText: {
          color: colors.textInverse,
          fontFamily: fonts.SemiBold || fonts.Bold,
        },
      }),
    [colors, responsive, fonts, isRTL]
  );

  return (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {tabs.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.tab, activeTab === item.id && styles.activeTab]}
            onPress={() => onChangeTab(item.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === item.id && styles.activeTabText,
              ]}
            >
              {item.label} ({item.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
