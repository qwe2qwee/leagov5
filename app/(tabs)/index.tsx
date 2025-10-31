import { useTabBarHeight } from "@/context/TabBarHeightContext";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AnnouncementsContainer from "@/components/Home/AnnouncementsContainer";
import CarCard from "@/components/Home/CarCard";
import LoadingEmpty from "@/components/Home/LoadingEmpty";
import { SafeAreaScrollView } from "@/components/SafeAreaView";
import {
  Announcement,
  useAnnouncements,
} from "@/hooks/supabaseHooks/useAnnouncements";
import { useCars } from "@/hooks/supabaseHooks/useCars";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useLocation } from "@/hooks/useLocation";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { transformCarData } from "@/utils/cars/transformCarData";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

// Create animated FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function HomeScreen() {
  // All hooks at the top level - no conditional hooks
  const { colors } = useTheme();
  const { spacing, typography, width } = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const { height: tabBarHeight } = useTabBarHeight();

  const {
    data: announcements,
    isLoading: announcementsLoading,
    refetch: refetchAnnouncements,
  } = useAnnouncements();

  const {
    cars,
    nearestCars,
    loading: carsLoading,
    loadingMore,
    hasMoreCars,
    getNearestCars,
    loadMoreCars,
    refreshCars,
  } = useCars();

  const { userLocation, getCurrentLocation } = useLocation();

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const announcementScale = useRef(new Animated.Value(1)).current;
  const announcementOpacity = useRef(new Animated.Value(1)).current;

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate dimensions
  const cardPadding = spacing.lg;
  const cardGap = spacing.md;
  const cardWidth = (width - cardPadding * 2 - cardGap) / 2;

  // All callbacks defined consistently
  const handleAnnouncementPress = useCallback((announcement: Announcement) => {
    console.log("Announcement pressed:", announcement.title_en);
  }, []);

  const handleViewAllPress = useCallback(() => {
    console.log("View all announcements pressed");
  }, []);

  const handleCarPress = useCallback((car: any) => {
    console.log("Car pressed:", car.id);
  }, []);

  const handleScroll = useCallback(
    (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      scrollY.setValue(currentScrollY);

      const maxScroll = 100;
      const progress =
        currentScrollY <= 0 ? 0 : Math.min(currentScrollY / maxScroll, 1);

      const newScale = 1 - progress * 0.15;
      const newOpacity = 1 - progress * 0.5;

      // Scale ما ينزل أقل من 0.85
      announcementScale.setValue(Math.max(newScale, 0.85));

      // Opacity بين 0.7 و 1 فقط
      announcementOpacity.setValue(Math.min(Math.max(newOpacity, 0.7), 1));
    },
    [scrollY, announcementScale, announcementOpacity]
  );

  const onRefreshHandler = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchAnnouncements(),
        refreshCars(),
        getCurrentLocation({
          forceRefresh: true,
          fallbackToDefault: true,
          defaultCity: "jeddah",
          timeout: 5000,
        }),
      ]);
    } catch (error) {
      console.error("خطأ في التحديث:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchAnnouncements, refreshCars, getCurrentLocation]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMoreCars || loadingMore || isRefreshing) return;

    try {
      await loadMoreCars();
    } catch (error) {
      console.error("خطأ في تحميل المزيد:", error);
    }
  }, [hasMoreCars, loadingMore, isRefreshing, loadMoreCars]);

  // All memos defined consistently
  const sortedAnnouncements = useMemo(() => {
    if (!announcements || announcements.length === 0) return [];

    return announcements.sort((a: Announcement, b: Announcement) => {
      const priorityOrder: any = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff =
        (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [announcements]);

  const allCarsData = useMemo(() => {
    if (nearestCars.length === 0) return cars;

    const nearestCarIds = new Set(nearestCars.map((car) => car.car_id));
    const filteredRegularCars = cars.filter(
      (car) => !nearestCarIds.has(car.id)
    );

    return [...nearestCars, ...filteredRegularCars];
  }, [cars, nearestCars]);

  const flatListData = useMemo(() => {
    const data = [];

    if (sortedAnnouncements.length > 0) {
      data.push({ type: "announcements", data: sortedAnnouncements });
      data.push({ type: "divider" });
    }

    data.push({ type: "cars_header", count: allCarsData.length });

    // Group cars in pairs for grid layout
    for (let i = 0; i < allCarsData.length; i += 2) {
      const leftCar = allCarsData[i];
      const rightCar = allCarsData[i + 1] || null;

      data.push({
        type: "car_row",
        leftCar,
        rightCar,
        rowIndex: Math.floor(i / 2),
      });
    }

    return data;
  }, [sortedAnnouncements, allCarsData]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
        },
        subtitle: {
          fontSize: typography.caption,
          fontFamily: fonts.Regular,
          color: colors.textSecondary,
          textAlign: isRTL ? "right" : "left",
          marginTop: spacing.xs,
        },
        divider: {
          height: 1,
          marginVertical: spacing.md,
          marginHorizontal: spacing.md,
          backgroundColor: colors.border + "50",
        },
        carRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: cardPadding,
          marginBottom: spacing.lg,
        },
        carContainer: {
          width: cardWidth,
        },
        singleCarContainer: {
          width: cardWidth,
          marginRight: cardWidth + cardGap, // Push single car to left
        },
        loadMoreContainer: {
          paddingVertical: spacing.xl,
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
        },
        loadMoreText: {
          fontSize: typography.body,
          fontFamily: fonts.Medium || fonts.Regular,
          color: colors.primary,
          textAlign: "center",
        },
        loadingIndicator: {
          paddingVertical: spacing.lg,
          alignItems: "center",
        },
        loadingText: {
          fontSize: typography.caption,
          fontFamily: fonts.Regular,
          color: colors.textSecondary,
          marginTop: spacing.sm,
          textAlign: "center",
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
          marginTop: spacing.md,
        },
      }),
    [colors, cardPadding, spacing, typography, fonts, isRTL, cardWidth]
  );

  // Render functions defined consistently
  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      switch (item.type) {
        case "announcements":
          return (
            <Animated.View
              style={{
                transform: [{ scale: announcementScale }],
                opacity: announcementOpacity,
              }}
            >
              <AnnouncementsContainer
                announcements={item.data}
                announcementScale={announcementScale}
                announcementOpacity={announcementOpacity}
                onAnnouncementPress={handleAnnouncementPress}
                onShowAllPress={handleViewAllPress}
              />
            </Animated.View>
          );

        case "divider":
          return <View style={styles.divider} />;

        case "cars_header":
          return (
            <View style={styles.headerContainer}>
              <Text style={styles.title}>
                {currentLanguage === "ar"
                  ? "السيارات المتاحة"
                  : "Available Cars"}
              </Text>
              {item.count > 0 && (
                <Text style={styles.subtitle}>
                  {currentLanguage === "ar"
                    ? `${item.count} سيارة متاحة للحجز`
                    : `${item.count} cars available for booking`}
                </Text>
              )}
            </View>
          );

        case "car_row":
          return (
            <View style={styles.carRow}>
              <View style={styles.carContainer}>
                <CarCard
                  car={transformCarData(item.leftCar)}
                  language={currentLanguage}
                  cardWidth={cardWidth}
                />
              </View>

              {item.rightCar ? (
                <View style={styles.carContainer}>
                  <CarCard
                    car={transformCarData(item.rightCar)}
                    language={currentLanguage}
                    cardWidth={cardWidth}
                  />
                </View>
              ) : (
                <View style={{ width: cardWidth }} />
              )}
            </View>
          );

        default:
          return null;
      }
    },
    [
      announcementScale,
      announcementOpacity,
      handleAnnouncementPress,
      handleViewAllPress,
      styles,
      currentLanguage,
      cardPadding,
      cardGap,
      cardWidth,
      handleCarPress,
    ]
  );

  const renderFooter = useCallback(() => {
    if (allCarsData.length === 0) return null;

    if (!hasMoreCars && allCarsData.length > 0) {
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

    if (!hasMoreCars) return null;

    if (loadingMore) {
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
          onPress={handleLoadMore}
          disabled={loadingMore}
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
  }, [
    allCarsData.length,
    hasMoreCars,
    loadingMore,
    styles,
    colors,
    currentLanguage,
    handleLoadMore,
  ]);

  const renderEmpty = useCallback(() => {
    if (allCarsData.length > 0) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={64} color={colors.textMuted} />
        <Text style={styles.emptyText}>
          {currentLanguage === "ar"
            ? "لا توجد سيارات متاحة حالياً"
            : "No cars available at the moment"}
        </Text>
      </View>
    );
  }, [allCarsData.length, styles, colors, currentLanguage]);

  // ✅ التعديل الرئيسي: طلب الموقع بشكل صامت مع fallback
  useEffect(() => {
    getCurrentLocation({
      fallbackToDefault: true, // استخدام موقع افتراضي عند الفشل
      defaultCity: "jeddah", // جدة كموقع افتراضي
      enableHighAccuracy: false, // دقة متوسطة (أسرع وأقل استهلاك للبطارية)
      timeout: 5000, // انتظار 5 ثواني فقط
      maxAge: 60 * 60 * 1000, // استخدام موقع محفوظ لمدة ساعة
    }).catch((error) => {
      // تجاهل الأخطاء - الموقع الافتراضي سيُستخدم تلقائياً
      console.log("Using default location:", error.message);
    });
  }, [getCurrentLocation]);

  useEffect(() => {
    if (userLocation) {
      getNearestCars(userLocation.lat, userLocation.lon, 5);
    }
  }, [userLocation, getNearestCars]);

  // Early returns after all hooks
  if ((announcementsLoading || carsLoading) && !isRefreshing) {
    return (
      <SafeAreaScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <LoadingEmpty
          loading
          text={currentLanguage === "ar" ? "جاري التحميل..." : "Loading..."}
        />
      </SafeAreaScrollView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AnimatedFlatList
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={(item: any, index) => `${item.type}-${index}`}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingBottom: tabBarHeight,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (
            hasMoreCars &&
            !loadingMore &&
            !isRefreshing &&
            allCarsData.length > 0
          ) {
            handleLoadMore();
          }
        }}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefreshHandler}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title={
              currentLanguage === "ar" ? "جاري التحديث..." : "Refreshing..."
            }
            titleColor={colors.textSecondary}
          />
        }
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        updateCellsBatchingPeriod={50}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: handleScroll,
          }
        )}
      />
    </View>
  );
}
