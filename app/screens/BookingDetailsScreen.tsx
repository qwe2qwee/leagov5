import ActionButtons from "@/components/BookingDetails/ActionButtons";
import BookingInfoCard from "@/components/BookingDetails/BookingInfoCard";
import BranchInfoCard from "@/components/BookingDetails/BranchInfoCard";
import CancelModal from "@/components/BookingDetails/CancelModal";
import CarDetailsCard from "@/components/BookingDetails/CarDetailsCard";
import FinancialInfoCard from "@/components/BookingDetails/FinancialInfoCard";
import Header from "@/components/BookingDetails/Header";
import Notes from "@/components/BookingDetails/Notes";
import TimerAlert from "@/components/BookingDetails/TimerAlert";
import { BOOKING_DETAILS_STATUS_CONFIG } from "@/components/Bookings/types";
import CustomButton from "@/components/ui/CustomButton";
import {
    useBookingDetails,
    useBookingRealtime,
    useBookingTimer,
    useCancelBooking,
} from "@/hooks/booking/useUserBookings";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function BookingDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { showSuccess, showError, showWarning } = useToast();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationNotes, setCancellationNotes] = useState("");

  const bookingId = params.bookingId as string;

  const {
    data: booking,
    isLoading,
    error,
    refetch,
  } = useBookingDetails(bookingId);

  const { cancelBooking, isLoading: isCancelling } = useCancelBooking();
  const { formattedTime, isExpired, hoursLeft } = useBookingTimer(
    booking?.expires_at
  );

  useBookingRealtime(() => {
    refetch();
  });

  const t = {
    // Messages
    error:
      currentLanguage === "ar"
        ? "حدث خطأ في تحميل البيانات"
        : "Error loading data",
    back: currentLanguage === "ar" ? "العودة" : "Go Back",
    phoneNotAvailable:
      currentLanguage === "ar"
        ? "رقم الهاتف غير متوفر"
        : "Phone number not available",
    cancelled:
      currentLanguage === "ar"
        ? "تم إلغاء الحجز بنجاح"
        : "Booking cancelled successfully",
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom:
        responsive.safeAreaBottom +
        responsive.getResponsiveValue(30, 50, 60, 65, 65),
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    errorText: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      textAlign: "center",
    },
    scrollContent: {
      paddingBottom: responsive.getResponsiveValue(80, 90, 100, 110, 120),
    },
  });

  const handleCallBranch = () => {
    const branchPhone = booking?.branch?.phone;
    if (branchPhone) {
      Linking.openURL(`tel:${branchPhone}`);
    } else {
      showWarning(t.phoneNotAvailable);
    }
  };

  const handleCancelBooking = async () => {
    setShowCancelModal(false);
    await cancelBooking(bookingId, cancellationNotes || undefined, {
      onSuccess: () => {
        showSuccess(t.cancelled);
        setCancellationNotes("");
        router.back();
      },
      onError: (error) => {
        showError(error.message);
      },
    });
  };

  const handlePayNow = () => {
    router.push({
      pathname: "/screens/PaymentScreen",
      params: { bookingId: booking?.id },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{t.error}</Text>
        <CustomButton
          title={t.back}
          bgVariant="primary"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const statusConfig = BOOKING_DETAILS_STATUS_CONFIG[booking.status];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Header */}
        <Header statusConfig={statusConfig} onBack={() => router.back()} />

        {/* Timer Alert - يظهر لـ confirmed و payment_pending */}
        {(booking.status === "confirmed" ||
          booking.status === "payment_pending") && (
          <TimerAlert
            formattedTime={formattedTime || ""}
            isExpired={isExpired}
          />
        )}

        {/* Car Details Card */}
        <CarDetailsCard booking={booking} />

        {/* Booking Info Card */}
        <BookingInfoCard booking={booking} />

        {/* Financial Info Card */}
        <FinancialInfoCard
          rentalType={booking.rental_type}
          dailyRate={booking.daily_rate}
          totalDays={booking.total_days}
          totalAmount={booking.total_amount}
          discountAmount={booking.discount_amount}
          finalAmount={booking.final_amount}
          carDiscountPercentage={booking.car?.discount_percentage}
        />

        {/* Branch Info Card */}
        <BranchInfoCard branch={booking.branch} />

        {/* Notes */}
        <Notes notes={booking.notes} />
      </ScrollView>

      {/* Action Buttons */}
      <ActionButtons
        status={booking.status}
        isExpired={isExpired}
        isCancelling={isCancelling}
        onPayNow={handlePayNow}
        onCallBranch={handleCallBranch}
        onCancel={() => setShowCancelModal(true)}
      />

      {/* Cancel Confirmation Modal */}
      <CancelModal
        visible={showCancelModal}
        isLoading={isCancelling}
        onConfirm={handleCancelBooking}
        onCancel={() => {
          setShowCancelModal(false);
          setCancellationNotes("");
        }}
      />
    </View>
  );
}
