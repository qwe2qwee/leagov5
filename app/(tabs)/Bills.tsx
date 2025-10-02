// screens/MyBookingsScreen.tsx
import { BookingCard } from "@/components/Bookings/BookingCard";
import { EmptyState } from "@/components/Bookings/Header";
import { Tabs } from "@/components/Bookings/Tabs";
import type {
  Booking,
  BookingStatus,
  TabItem,
} from "@/components/Bookings/types";
import {
  useBookingRealtime,
  useCancelBooking,
  useUserBookings,
} from "@/hooks/booking/useUserBookings";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

export default function MyBookingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { currentLanguage } = useLanguageStore();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<"all" | BookingStatus>("all");

  // Fetch all bookings once
  const { data: allBookings, isLoading, refetch } = useUserBookings({});
  const { cancelBooking, isLoading: isCancelling } = useCancelBooking();

  // Client-side filtering
  const filteredBookings = useMemo(() => {
    if (!allBookings) return [];
    if (activeTab === "all") return allBookings;
    return allBookings.filter((booking) => booking.status === activeTab);
  }, [allBookings, activeTab]);

  // Calculate stats
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

  // Translations
  const t = useMemo(
    () => ({
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
      confirmCancellation:
        currentLanguage === "ar" ? "تأكيد الإلغاء" : "Confirm Cancellation",
      confirmMessage:
        currentLanguage === "ar"
          ? "هل أنت متأكد من إلغاء هذا الحجز؟"
          : "Are you sure you want to cancel this booking?",
      no: currentLanguage === "ar" ? "لا" : "No",
      yesCancel: currentLanguage === "ar" ? "نعم، إلغاء" : "Yes, Cancel",
    }),
    [currentLanguage]
  );

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(t.confirmCancellation, t.confirmMessage, [
      {
        text: t.no,
        style: "cancel",
      },
      {
        text: t.yesCancel,
        style: "destructive",
        onPress: () => {
          cancelBooking(bookingId, {
            onSuccess: () => {
              showSuccess(t.cancelSuccess);
              refetch();
            },
            onError: (error) => {
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
    ]);
  };

  const tabs: TabItem[] = useMemo(
    () => [
      { id: "all", label: t.all, count: stats.total },
      { id: "pending", label: t.pending, count: stats.pending },
      { id: "confirmed", label: t.confirmed, count: stats.confirmed },
      { id: "active", label: t.active, count: stats.active },
      { id: "completed", label: t.completed, count: stats.completed },
    ],
    [t, stats]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: responsive.safeAreaTop,
        },
        centered: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        listContent: {
          padding: responsive.spacing.md,
          paddingBottom: responsive.spacing.xl + responsive.safeAreaBottom,
        },
      }),
    [colors, responsive]
  );

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <BookingCard
      booking={item}
      onPress={() =>
        router.push({
          pathname: `/screens/BookingDetailsScreen`,
          params: { bookingId: item.id },
        })
      }
      onCancel={
        item.status === "pending"
          ? () => handleCancelBooking(item.id)
          : undefined
      }
      onPay={
        item.status === "confirmed"
          ? () =>
              router.push({
                pathname: "/screens/PaymentScreen",
                params: { bookingId: item.id },
              })
          : undefined
      }
      isCancelling={isCancelling}
      translations={{
        from: t.from,
        to: t.to,
        sar: t.sar,
        cancel: t.cancel,
        payNow: t.payNow,
      }}
    />
  );

  if (isLoading && !allBookings) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Tabs tabs={tabs} activeTab={activeTab} onChangeTab={setActiveTab} />

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
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        windowSize={5}
        ListEmptyComponent={<EmptyState message={t.noBookings} />}
      />
    </View>
  );
}
