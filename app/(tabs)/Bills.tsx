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

    // دمج cancelled و expired في تبويب واحد
    if (activeTab === "cancelled") {
      return allBookings.filter(
        (booking) =>
          booking.status === "cancelled" || booking.status === "expired"
      );
    }

    return allBookings.filter((booking) => booking.status === activeTab);
  }, [allBookings, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!allBookings) {
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        paymentPending: 0,
        active: 0,
        completed: 0,
        cancelledAndExpired: 0,
      };
    }

    return {
      total: allBookings.length,
      pending: allBookings.filter((b) => b.status === "pending").length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      paymentPending: allBookings.filter((b) => b.status === "payment_pending")
        .length,
      active: allBookings.filter((b) => b.status === "active").length,
      completed: allBookings.filter((b) => b.status === "completed").length,
      cancelledAndExpired: allBookings.filter(
        (b) => b.status === "cancelled" || b.status === "expired"
      ).length,
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
      pending:
        currentLanguage === "ar" ? "في انتظار الموافقة" : "Awaiting Approval",
      confirmed: currentLanguage === "ar" ? "جاهز للدفع" : "Ready to Pay",
      paymentPending:
        currentLanguage === "ar" ? "جاري الدفع" : "Processing Payment",
      active: currentLanguage === "ar" ? "نشطة" : "Active",
      completed: currentLanguage === "ar" ? "مكتملة" : "Completed",
      cancelled:
        currentLanguage === "ar" ? "ملغية ومنتهية" : "Cancelled & Expired",
      from: currentLanguage === "ar" ? "من" : "From",
      to: currentLanguage === "ar" ? "إلى" : "To",
      sar: currentLanguage === "ar" ? "ر.س" : "SAR",
      cancel: currentLanguage === "ar" ? "إلغاء" : "Cancel",
      payNow: currentLanguage === "ar" ? "ادفع الآن" : "Pay Now",
      viewDetails: currentLanguage === "ar" ? "عرض التفاصيل" : "View Details",
      noBookings: currentLanguage === "ar" ? "لا توجد حجوزات" : "No bookings",
      cancelSuccess:
        currentLanguage === "ar"
          ? "تم إلغاء الحجز بنجاح"
          : "Booking cancelled successfully",
      confirmCancellation:
        currentLanguage === "ar" ? "تأكيد الإلغاء" : "Confirm Cancellation",
      confirmMessage:
        currentLanguage === "ar"
          ? "هل أنت متأكد من إلغاء هذا الحجز؟"
          : "Are you sure you want to cancel this booking?",
      no: currentLanguage === "ar" ? "لا" : "No",
      yesCancel: currentLanguage === "ar" ? "نعم، إلغاء" : "Yes, Cancel",
      // رسائل الحالات التوضيحية
      statusMessages: {
        pending:
          currentLanguage === "ar"
            ? "حجزك قيد المراجعة من قبل الفرع"
            : "Your booking is being reviewed by the branch",
        confirmed:
          currentLanguage === "ar"
            ? "تمت الموافقة على حجزك. يرجى إتمام الدفع"
            : "Your booking is approved. Please complete payment",
        payment_pending:
          currentLanguage === "ar"
            ? "جاري معالجة عملية الدفع"
            : "Payment is being processed",
        active:
          currentLanguage === "ar"
            ? "حجزك نشط حالياً"
            : "Your booking is currently active",
        completed:
          currentLanguage === "ar"
            ? "تم إكمال الحجز بنجاح"
            : "Booking completed successfully",
        cancelled:
          currentLanguage === "ar"
            ? "تم إلغاء هذا الحجز"
            : "This booking was cancelled",
        expired:
          currentLanguage === "ar"
            ? "انتهت صلاحية هذا الحجز"
            : "This booking has expired",
      },
      // رسائل الأخطاء
      errors: {
        cannotCancel:
          currentLanguage === "ar"
            ? "لا يمكن إلغاء هذا الحجز في حالته الحالية"
            : "Cannot cancel booking in its current state",
        notYourBooking:
          currentLanguage === "ar"
            ? "هذا الحجز ليس ملكك"
            : "This booking doesn't belong to you",
        notFound:
          currentLanguage === "ar" ? "الحجز غير موجود" : "Booking not found",
        generic:
          currentLanguage === "ar"
            ? "حدث خطأ أثناء إلغاء الحجز"
            : "An error occurred while cancelling",
      },
    }),
    [currentLanguage]
  );

  // دالة التحقق من إمكانية الإلغاء
  const canCancel = (status: BookingStatus): boolean => {
    return ["pending", "confirmed", "payment_pending"].includes(status);
  };

  // دالة التحقق من إمكانية الدفع
  const canPay = (status: BookingStatus): boolean => {
    return status === "confirmed" || status === "payment_pending";
  };

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
          cancelBooking(bookingId, undefined, {
            onSuccess: () => {
              showSuccess(t.cancelSuccess);
              refetch();
            },
            onError: (error) => {
              let errorMessage = t.errors.generic;

              if (
                error.message.includes("cannot be cancelled") ||
                error.message.includes("Cannot cancel booking")
              ) {
                errorMessage = t.errors.cannotCancel;
              } else if (
                error.message.includes("not your booking") ||
                error.message.includes("Not your booking")
              ) {
                errorMessage = t.errors.notYourBooking;
              } else if (
                error.message.includes("not found") ||
                error.message.includes("Booking not found")
              ) {
                errorMessage = t.errors.notFound;
              }

              showError(errorMessage);
            },
          });
        },
      },
    ]);
  };

  const handlePayment = (bookingId: string) => {
    router.push({
      pathname: "/screens/PaymentScreen",
      params: { bookingId },
    });
  };

  const handleViewDetails = (bookingId: string) => {
    router.push({
      pathname: "/screens/BookingDetailsScreen",
      params: { bookingId },
    });
  };

  const tabs: TabItem[] = useMemo(
    () => [
      { id: "all", label: t.all, count: stats.total },
      { id: "pending", label: t.pending, count: stats.pending },
      { id: "confirmed", label: t.confirmed, count: stats.confirmed },
      {
        id: "payment_pending",
        label: t.paymentPending,
        count: stats.paymentPending,
      },
      { id: "active", label: t.active, count: stats.active },
      { id: "completed", label: t.completed, count: stats.completed },
      { id: "cancelled", label: t.cancelled, count: stats.cancelledAndExpired },
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
      onPress={() => handleViewDetails(item.id)}
      onCancel={
        canCancel(item.status) ? () => handleCancelBooking(item.id) : undefined
      }
      onPay={canPay(item.status) ? () => handlePayment(item.id) : undefined}
      showTimer={canPay(item.status)} // عرض العداد للحجوزات الجاهزة للدفع
      isCancelling={isCancelling}
      translations={{
        from: t.from,
        to: t.to,
        sar: t.sar,
        cancel: t.cancel,
        payNow: t.payNow,
        viewDetails: t.viewDetails,
        statusMessage: t.statusMessages[item.status] || "",
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
