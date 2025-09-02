import CarCard from "@/components/Home/CarCard";
import { useTabBarHeight } from "@/context/TabBarHeightContext";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  cars: any[];
  transformCarData: (c: any) => any;
  onCarPress?: (c: any) => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export default function CarsGrid({
  cars,
  transformCarData,
  isLoadingMore,
  hasMore,
  onLoadMore,
  refreshing = false,
  onRefresh,
}: Props) {
  const { colors } = useTheme();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { width, spacing, typography } = useResponsive();
  const fonts = useFontFamily();
  const { height: tabBarHeight } = useTabBarHeight();

  // Calculate card dimensions
  const cardPadding = spacing.lg;
  const cardGap = spacing.md;
  const cardWidth = (width - cardPadding * 2 - cardGap) / 2;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      paddingHorizontal: cardPadding,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    title: {
      fontSize: typography.h3,
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      writingDirection: currentLanguage === "ar" ? "rtl" : "ltr",
    },
    subtitle: {
      fontSize: typography.caption,
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      writingDirection: currentLanguage === "ar" ? "rtl" : "ltr",
      marginTop: spacing.xs,
    },
    flatListContent: {
      paddingHorizontal: cardPadding,
      paddingBottom: spacing.lg, // قللنا المساحة
    },
    cardContainer: {
      width: cardWidth,
      marginBottom: spacing.lg,
    },
    leftCard: {
      marginRight: cardGap / 2,
    },
    rightCard: {
      marginLeft: cardGap / 2,
    },
    loadMoreContainer: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      width: "100%",
    },
    loadMoreButton: {
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: spacing.md,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: spacing.sm,
      minHeight: 48,
      minWidth: 180,
    },
    loadMoreText: {
      fontSize: typography.body,
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.primary,
      textAlign: "center",
      writingDirection: currentLanguage === "ar" ? "rtl" : "ltr",
    },
    loadingIndicator: {
      paddingVertical: spacing.lg,
      alignItems: "center",
      width: "100%",
    },
    loadingText: {
      fontSize: typography.caption,
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      textAlign: "center",
      writingDirection: currentLanguage === "ar" ? "rtl" : "ltr",
    },
    emptyContainer: {
      paddingVertical: spacing.xl * 2,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
    },
    emptyText: {
      fontSize: typography.body,
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
      writingDirection: currentLanguage === "ar" ? "rtl" : "ltr",
      marginTop: spacing.md,
      lineHeight: typography.body * 1.4,
    },
    emptySubText: {
      fontSize: typography.caption,
      fontFamily: fonts.Regular,
      color: colors.textMuted,
      textAlign: "center",
      writingDirection: currentLanguage === "ar" ? "rtl" : "ltr",
      marginTop: spacing.sm,
      lineHeight: typography.caption * 1.4,
    },
    divider: {
      height: 1,
      marginVertical: spacing.md,
      marginHorizontal: spacing.md,
      backgroundColor: colors.border + "50",
      width: "100%",
    },
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>
        {currentLanguage === "ar" ? "السيارات المتاحة" : "Available Cars"}
      </Text>
      {cars.length > 0 && (
        <Text style={styles.subtitle}>
          {currentLanguage === "ar"
            ? `${cars.length} سيارة متاحة للحجز`
            : `${cars.length} cars available for booking`}
        </Text>
      )}
    </View>
  );

  const renderCarItem = ({ item, index }: { item: any; index: number }) => {
    const transformedCar = transformCarData(item);
    const isLeftColumn = index % 2 === 0;

    return (
      <View
        style={[
          styles.cardContainer,
          isLeftColumn ? styles.leftCard : styles.rightCard,
        ]}
      >
        <CarCard
          car={transformedCar}
          language={currentLanguage}
          cardWidth={cardWidth}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore && cars.length > 0) {
      return (
        <View style={styles.loadMoreContainer}>
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {currentLanguage === "ar"
              ? "تم عرض جميع السيارات المتاحة"
              : "All available cars loaded"}
          </Text>
        </View>
      );
    }

    if (!hasMore) return null;

    if (isLoadingMore) {
      return (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {currentLanguage === "ar"
              ? "جاري تحميل المزيد..."
              : "Loading more cars..."}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.loadMoreContainer}>
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={onLoadMore}
          disabled={isLoadingMore}
          activeOpacity={0.7}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.loadMoreText}>
            {currentLanguage === "ar"
              ? "تحميل المزيد من السيارات"
              : "Load More Cars"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyText}>
        {currentLanguage === "ar"
          ? "لا توجد سيارات متاحة حالياً"
          : "No cars available at the moment"}
      </Text>
      <Text style={styles.emptySubText}>
        {currentLanguage === "ar"
          ? "يرجى المحاولة مرة أخرى لاحقاً أو تحديث الصفحة"
          : "Please try again later or refresh the page"}
      </Text>
    </View>
  );

  const getItemLayout = (_: any, index: number) => {
    const estimatedItemHeight = cardWidth * 1.2 + spacing.lg; // تقدير ارتفاع الكارت
    const rowIndex = Math.floor(index / 2);
    return {
      length: estimatedItemHeight,
      offset: estimatedItemHeight * rowIndex,
      index,
    };
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={cars}
        renderItem={renderCarItem}
        keyExtractor={(item, index) => item.id || item.car_id || `car-${index}`}
        numColumns={2}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={cars.length === 0 ? renderEmpty : null}
        contentContainerStyle={[
          styles.flatListContent,
          cars.length === 0 && { flexGrow: 1, justifyContent: "center" },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasMore && !isLoadingMore && cars.length > 0) {
            onLoadMore();
          }
        }}
        onEndReachedThreshold={0.3}
        refreshing={refreshing}
        onRefresh={onRefresh}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        getItemLayout={getItemLayout}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}
