import { useTabBarHeight } from "@/context/TabBarHeightContext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AnnouncementsContainer from "@/components/Home/AnnouncementsContainer";
import CarsGrid from "@/components/Home/CarsGrid";
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

export default function HomeScreen() {
  const { colors } = useTheme();
  const { getSpacing, getFontSize, width } = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const insets = useSafeAreaInsets();
  const { height: tabBarHeight } = useTabBarHeight();

  // Hooks
  const {
    data: announcements,
    isLoading: announcementsLoading,
    refetch: refetchAnnouncements,
  } = useAnnouncements();

  const {
    cars,
    nearestCars,
    loading: carsLoading,
    getNearestCars,
    fetchCars,
  } = useCars();
  const { userLocation, getCurrentLocation } = useLocation();

  // Animation values for announcements
  const scrollY = useRef(new Animated.Value(0)).current;
  const announcementScale = useRef(new Animated.Value(1)).current;
  const announcementOpacity = useRef(new Animated.Value(1)).current;

  // Loading states and pagination
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const spacing = {
    sm: getSpacing(8),
    md: getSpacing(16),
    lg: getSpacing(24),
  };

  const fontSizes = {
    md: getFontSize(16),
    lg: getFontSize(18),
  };

  const paab = tabBarHeight + insets.bottom - spacing.lg * 3;

  // Sort announcements by priority then date
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

  // Merge nearest + regular cars and dedupe
  const allCarsData = useMemo(() => {
    const combined = nearestCars.length > 0 ? [...nearestCars, ...cars] : cars;
    const uniqueCars = combined.filter(
      (car: any, index, self) =>
        index ===
        self.findIndex(
          (c: any) =>
            (c.car_id || c.car_car_id) === (car.car_id || car.car_car_id)
        )
    );
    return uniqueCars;
  }, [cars, nearestCars]);

  const displayedCars = allCarsData.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMoreCars = allCarsData.length > displayedCars.length;

  // Scroll handler (delegated here, but values passed to AnnouncementsContainer)
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        if (sortedAnnouncements.length > 0) {
          const maxScroll = 100;
          const progress = Math.min(currentScrollY / maxScroll, 1);
          const newScale = 1 - progress * 0.15;
          const newOpacity = 1 - progress * 0.3;
          announcementScale.setValue(Math.max(newScale, 0.85));
          announcementOpacity.setValue(Math.max(newOpacity, 0.7));
        }
      },
    }
  );

  const loadMoreCars = async () => {
    if (isLoadingMore || !hasMoreCars) return;
    setIsLoadingMore(true);
    try {
      setCurrentPage((p) => p + 1);
    } catch (error) {
      console.error("خطأ في تحميل المزيد:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    try {
      await Promise.all([
        refetchAnnouncements(),
        fetchCars(5),
        getCurrentLocation({ forceRefresh: true }),
      ]);
    } catch (error) {
      console.error("خطأ في التحديث:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAnnouncementPress = (announcement: Announcement) => {
    console.log("Announcement pressed:", announcement.title_en);
  };

  const handleViewAllPress = () => {
    console.log("View all announcements pressed");
  };

  const handleCarPress = (car: any) => {
    console.log("Selected car:", car);
  };

  useEffect(() => {
    const initializeData = async () => {
      await getCurrentLocation();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (userLocation) {
      getNearestCars(userLocation.lat, userLocation.lon, 5);
    }
  }, [userLocation]);

  // Show a focused loading screen while initial fetch is happening
  if ((announcementsLoading || carsLoading) && !isRefreshing) {
    return (
      <SafeAreaScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <LoadingEmpty loading text={isRTL ? "جاري التحميل..." : "Loading..."} />
      </SafeAreaScrollView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title={isRTL ? "جاري التحديث..." : "Refreshing..."}
            titleColor={colors.textSecondary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Announcements */}
        {sortedAnnouncements.length > 0 && (
          <AnnouncementsContainer
            announcements={sortedAnnouncements}
            announcementScale={announcementScale}
            announcementOpacity={announcementOpacity}
            onAnnouncementPress={handleAnnouncementPress}
            onShowAllPress={handleViewAllPress}
          />
        )}

        {/* Divider */}
        <View
          style={{
            height: 1,
            marginVertical: 16,
            marginHorizontal: 16,
            backgroundColor: colors.border,
          }}
        />

        {/* Cars grid */}
        <CarsGrid
          cars={displayedCars}
          transformCarData={transformCarData}
          onCarPress={handleCarPress}
          isLoadingMore={isLoadingMore}
          hasMore={hasMoreCars}
          onLoadMore={loadMoreCars}
          currentLanguage={currentLanguage}
          isRTL={isRTL}
          width={width}
          spacing={spacing}
          paab={paab}
          fonts={fonts}
          fontSizes={fontSizes}
          colors={colors}
        />
      </Animated.ScrollView>
    </View>
  );
}
