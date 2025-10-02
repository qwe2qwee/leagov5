import { Badge } from "@/components/ui/Badge2";
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import {
  BookingStatus,
  useBookingRealtime,
  useCancelBooking,
  useUserBookings,
} from "@/hooks/booking/useUserBookings";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_CONFIG = {
  pending: {
    label: { ar: "قيد المراجعة", en: "Pending" },
    variant: "warning" as const,
    icon: "time-outline" as const,
  },
  confirmed: {
    label: { ar: "مؤكد - ادفع", en: "Pay Now" },
    variant: "info" as const,
    icon: "card-outline" as const,
  },
  payment_pending: {
    label: { ar: "جاري الدفع", en: "Processing" },
    variant: "secondary" as const,
    icon: "sync-outline" as const,
  },
  active: {
    label: { ar: "نشط", en: "Active" },
    variant: "success" as const,
    icon: "checkmark-circle-outline" as const,
  },
  completed: {
    label: { ar: "مكتمل", en: "Completed" },
    variant: "neutral" as const,
    icon: "checkmark-done-outline" as const,
  },
  cancelled: {
    label: { ar: "ملغي", en: "Cancelled" },
    variant: "luxury" as const,
    icon: "close-circle-outline" as const,
  },
  expired: {
    label: { ar: "منتهي", en: "Expired" },
    variant: "luxury" as const,
    icon: "alert-circle-outline" as const,
  },
};

export default function MyBookingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<"all" | BookingStatus>("all");

  // IMPROVED: Fetch ALL bookings once, filter client-side
  const { data: allBookings, isLoading, refetch } = useUserBookings({});

  const { cancelBooking, isLoading: isCancelling } = useCancelBooking();

  // IMPROVED: Client-side filtering (no DB call on tab change)
  const filteredBookings = useMemo(() => {
    if (!allBookings) return [];
    if (activeTab === "all") return allBookings;
    return allBookings.filter((booking) => booking.status === activeTab);
  }, [allBookings, activeTab]);

  // IMPROVED: Calculate stats from cached data
  const stats = useMemo(() => {
    if (!allBookings) {
      return { total: 0, pending: 0, confirmed: 0, active: 0, completed: 0 };
    }

    return {
      total: allBookings.length,
      pending: allBookings.filter((b) => b.status === "pending").length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      active: allBookings.filter((b) => b.status === "active").length,
      completed: allBookings.filter((b) => b.status === "completed").length,
    };
  }, [allBookings]);

  // Real-time updates
  useBookingRealtime(() => {
    refetch();
  });

  const t = {
    title: currentLanguage === "ar" ? "حجوزاتي" : "My Bookings",
    all: currentLanguage === "ar" ? "الكل" : "All",
    pending: currentLanguage === "ar" ? "قيد المراجعة" : "Pending",
    confirmed: currentLanguage === "ar" ? "مؤكد" : "Confirmed",
    active: currentLanguage === "ar" ? "نشطة" : "Active",
    completed: currentLanguage === "ar" ? "مكتملة" : "Completed",
    from: currentLanguage === "ar" ? "من" : "From",
    to: currentLanguage === "ar" ? "إلى" : "To",
    sar: currentLanguage === "ar" ? "ر.س" : "SAR",
    cancel: currentLanguage === "ar" ? "إلغاء" : "Cancel",
    payNow: currentLanguage === "ar" ? "ادفع" : "Pay",
    noBookings: currentLanguage === "ar" ? "لا توجد حجوزات" : "No bookings",
    cancelSuccess: currentLanguage === "ar" ? "تم الإلغاء" : "Cancelled",
  };

  const handleCancelBooking = (bookingId: string) => {
    // إضافة تأكيد قبل الإلغاء
    Alert.alert(
      currentLanguage === "ar" ? "تأكيد الإلغاء" : "Confirm Cancellation",
      currentLanguage === "ar"
        ? "هل أنت متأكد من إلغاء هذا الحجز؟"
        : "Are you sure you want to cancel this booking?",
      [
        {
          text: currentLanguage === "ar" ? "لا" : "No",
          style: "cancel",
        },
        {
          text: currentLanguage === "ar" ? "نعم، إلغاء" : "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            cancelBooking(bookingId, {
              onSuccess: () => {
                showSuccess(t.cancelSuccess);
                refetch();
              },
              onError: (error) => {
                // معالجة رسائل الخطأ المحددة
                let errorMessage = error.message;

                if (error.message.includes("cannot be cancelled")) {
                  errorMessage =
                    currentLanguage === "ar"
                      ? "لا يمكن إلغاء هذا الحجز"
                      : "This booking cannot be cancelled";
                } else if (error.message.includes("not your booking")) {
                  errorMessage =
                    currentLanguage === "ar"
                      ? "هذا الحجز ليس لك"
                      : "This booking is not yours";
                } else if (error.message.includes("Booking not found")) {
                  errorMessage =
                    currentLanguage === "ar"
                      ? "الحجز غير موجود"
                      : "Booking not found";
                }

                showError(errorMessage);
              },
            });
          },
        },
      ]
    );
  };
  // Memoized styles with IMPROVED responsive design
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        centered: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },

        // IMPROVED: Reduced header padding, better safe area handling
        header: {
          paddingHorizontal: responsive.spacing.md,
          paddingTop: responsive.safeAreaTop + responsive.spacing.sm,
          paddingBottom: responsive.spacing.sm,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        title: {
          fontSize: responsive.typography.h2,
          fontFamily: fonts.Bold || fonts.SemiBold,
          color: colors.text,
          textAlign: isRTL ? "right" : "left",
        },

        // IMPROVED: Compact tabs with better spacing
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
          // IMPROVED: Minimum touch target
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

        // IMPROVED: Reduced list padding for better content density
        listContent: {
          padding: responsive.spacing.md,
          paddingBottom: responsive.spacing.xl + responsive.safeAreaBottom,
        },

        // IMPROVED: Compact card with horizontal layout
        bookingCard: {
          marginBottom: responsive.spacing.md,
        },
        cardContent: {
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          gap: responsive.spacing.md,
        },

        // IMPROVED: Smaller image (60-80pt instead of 90-130pt)
        carImageContainer: {
          width: responsive.getResponsiveValue(60, 64, 68, 72, 80),
          height: responsive.getResponsiveValue(60, 64, 68, 72, 80),
          borderRadius: responsive.getBorderRadius("medium"),
          overflow: "hidden",
          backgroundColor: colors.backgroundSecondary,
          // IMPROVED: Subtle border for definition
          borderWidth: 1,
          borderColor: colors.border,
        },
        carImage: {
          width: "100%",
          height: "100%",
        },

        // IMPROVED: Better information hierarchy
        cardInfo: {
          flex: 1,
          gap: responsive.spacing.xs,
        },
        topRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: responsive.spacing.sm,
        },
        carName: {
          fontSize: responsive.typography.body,
          fontFamily: fonts.Bold || fonts.SemiBold,
          color: colors.text,
          flex: 1,
          textAlign: isRTL ? "right" : "left",
          // IMPROVED: Better line height for readability
          lineHeight: responsive.typography.body * 1.3,
        },

        // IMPROVED: Compact date row with icons
        dateRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          gap: responsive.spacing.xs,
        },
        dateText: {
          fontSize: responsive.typography.small,
          fontFamily: fonts.Regular,
          color: colors.textSecondary,
          flex: 1,
          textAlign: isRTL ? "right" : "left",
        },

        // IMPROVED: Price and actions row
        bottomRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: responsive.spacing.sm,
          gap: responsive.spacing.sm,
        },
        priceContainer: {
          flex: 1,
        },
        price: {
          fontSize: responsive.typography.h4,
          fontFamily: fonts.Bold || fonts.SemiBold,
          color: colors.primary,
        },

        // IMPROVED: Action buttons container
        actions: {
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: responsive.spacing.sm,
          flexShrink: 0,
        },

        // Empty state
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
    [colors, responsive, fonts, isRTL]
  );

  const renderBookingCard = ({ item }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const carName = `${item.car?.model?.brand?.name_ar} ${item.car?.model?.name_ar}`;
    const imageUrl = item.car?.model?.default_image_url;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: `/screens/BookingDetailsScreen`,
            params: { bookingId: item.id },
          })
        }
        activeOpacity={0.7}
      >
        <Card style={styles.bookingCard}>
          <Card.Content>
            <View style={styles.cardContent}>
              {/* Compact Image */}
              <View style={styles.carImageContainer}>
                <Image
                  source={{
                    uri: imageUrl || "https://via.placeholder.com/150",
                  }}
                  style={styles.carImage}
                  resizeMode="cover"
                />
              </View>

              {/* Card Info */}
              <View style={styles.cardInfo}>
                {/* Top Row: Name + Badge */}
                <View style={styles.topRow}>
                  <Text style={styles.carName} numberOfLines={2}>
                    {carName}
                  </Text>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label[currentLanguage]}
                  </Badge>
                </View>

                {/* Compact Date Row */}
                <View style={styles.dateRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={responsive.getIconSize("small")}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.dateText} numberOfLines={1}>
                    {t.from} {item.start_date} • {t.to} {item.end_date}
                  </Text>
                </View>

                {/* Bottom Row: Price + Actions */}
                <View style={styles.bottomRow}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price} numberOfLines={1}>
                      {item.final_amount} {t.sar}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    {item.status === "pending" && (
                      <CustomButton
                        bgVariant="outline"
                        onPress={() => handleCancelBooking(item.id)}
                        loading={isCancelling}
                      >
                        {t.cancel}
                      </CustomButton>
                    )}

                    {item.status === "confirmed" && (
                      <CustomButton
                        bgVariant="primary"
                        onPress={() =>
                          router.push({
                            pathname: "/screens/PaymentScreen",
                            params: {
                              bookingId: item?.id,
                            },
                          })
                        }
                      >
                        {t.payNow}
                      </CustomButton>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const tabs = [
    { id: "all", label: t.all, count: stats.total },
    { id: "pending", label: t.pending, count: stats.pending },
    { id: "confirmed", label: t.confirmed, count: stats.confirmed },
    { id: "active", label: t.active, count: stats.active },
    { id: "completed", label: t.completed, count: stats.completed },
  ];

  if (isLoading && !allBookings) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
      </View>

      {/* Compact Tabs - NO DB CALL ON TAB CHANGE */}
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
              onPress={() => setActiveTab(item.id as any)}
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

      {/* Optimized List with Client-Side Filtering */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        // IMPROVED: Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={responsive.getIconSize("large") * 1.5}
                color={colors.textSecondary}
              />
            </View>
            <Text style={styles.emptyText}>{t.noBookings}</Text>
          </View>
        }
      />
    </View>
  );
}
