// -------------------------------------------------------------
// components/Home/CarsGrid.tsx
import CarCard from "@/components/Home/CarCard";
import { useTabBarHeight } from "@/context/TabBarHeightContext";
import { Language } from "@/types";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  cars: any[];
  transformCarData: (c: any) => any;
  onCarPress: (c: any) => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  currentLanguage: Language;
  isRTL: boolean;
  width: number;
  paab: any;
  spacing: any;
  fonts: any;
  fontSizes: any;
  colors: any;
};

export default function CarsGrid({
  cars,
  transformCarData,
  onCarPress,
  isLoadingMore,
  hasMore,
  onLoadMore,
  currentLanguage,
  isRTL,
  width,
  paab,
  spacing,
  fonts,
  fontSizes,
  colors,
}: Props) {
  const renderCarItem = (item: any, index: number) => {
    const transformed = transformCarData(item);
    const isLeft = index % 2 === 0;
    const cardWidth = (width - spacing.md * 3) / 2;

    const insets = useSafeAreaInsets();
    const { height: tabBarHeight } = useTabBarHeight();

    return (
      <View
        key={item.id || item.car_id || `car-${index}`}
        style={{
          width: cardWidth,
          marginRight: isLeft ? spacing.sm : 0,
          marginLeft: isLeft ? 0 : spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <CarCard
          car={transformed}
          onSelect={onCarPress}
          language={currentLanguage}
          cardWidth={cardWidth}
        />
      </View>
    );
  };

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingBottom: paab,
      }}
    >
      <Text
        style={{
          fontSize: fontSizes.lg,
          fontFamily: fonts.SemiBold,
          color: colors.text,
          textAlign: isRTL ? "right" : "left",
          marginBottom: spacing.lg,
        }}
      >
        {isRTL ? "السيارات المتاحة" : "Available Cars"}
      </Text>

      {cars.length > 0 ? (
        <>
          <View style={styles.carsGrid}>
            {cars.map((c, i) => renderCarItem(c, i))}
          </View>

          {hasMore && (
            <View style={styles.loadMoreContainer}>
              {isLoadingMore && (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text
                    style={[styles.footerText, { color: colors.textSecondary }]}
                  >
                    {isRTL ? "جاري تحميل المزيد..." : "Loading more..."}
                  </Text>
                </View>
              )}

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  color: colors.primary,
                }}
                onPress={onLoadMore}
              >
                {isRTL ? "تحميل المزيد" : "Load More"}
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            {isRTL ? "لا توجد سيارات متاحة" : "No cars available"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  carsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  loadMoreContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
  },
});
