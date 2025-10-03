import ActionButtons from "@/components/BookingDetails/ActionButtons";
import CancelModal from "@/components/BookingDetails/CancelModal";
import CarImage from "@/components/BookingDetails/CarImage";
import FinancialSection from "@/components/BookingDetails/FinancialSection";
import Header from "@/components/BookingDetails/Header";
import InfoRow from "@/components/BookingDetails/InfoRow";
import Notes from "@/components/BookingDetails/Notes";
import Section from "@/components/BookingDetails/Section";
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
    // Car Info
    carInfo: currentLanguage === "ar" ? "معلومات السيارة" : "Car Information",
    model: currentLanguage === "ar" ? "الموديل" : "Model",
    year: currentLanguage === "ar" ? "السنة" : "Year",
    color: currentLanguage === "ar" ? "اللون" : "Color",
    transmission: currentLanguage === "ar" ? "ناقل الحركة" : "Transmission",
    fuelType: currentLanguage === "ar" ? "نوع الوقود" : "Fuel Type",
    seats: currentLanguage === "ar" ? "عدد المقاعد" : "Seats",

    // Booking Info
    bookingInfo:
      currentLanguage === "ar" ? "معلومات الحجز" : "Booking Information",
    reference: currentLanguage === "ar" ? "رقم المرجع" : "Reference",
    startDate: currentLanguage === "ar" ? "تاريخ البداية" : "Start Date",
    endDate: currentLanguage === "ar" ? "تاريخ النهاية" : "End Date",
    duration: currentLanguage === "ar" ? "المدة" : "Duration",
    days: currentLanguage === "ar" ? "يوم" : "days",
    rentalType: currentLanguage === "ar" ? "نوع التأجير" : "Rental Type",

    // Rental Types
    daily: currentLanguage === "ar" ? "يومي" : "Daily",
    weekly: currentLanguage === "ar" ? "أسبوعي" : "Weekly",
    monthly: currentLanguage === "ar" ? "شهري" : "Monthly",
    ownership: currentLanguage === "ar" ? "تمليك" : "Ownership",

    // Branch Info
    branchInfo:
      currentLanguage === "ar" ? "معلومات الفرع" : "Branch Information",
    name: currentLanguage === "ar" ? "الاسم" : "Name",
    location: currentLanguage === "ar" ? "الموقع" : "Location",
    phone: currentLanguage === "ar" ? "الهاتف" : "Phone",
    workingHours: currentLanguage === "ar" ? "ساعات العمل" : "Working Hours",

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
    await cancelBooking(bookingId, {
      onSuccess: () => {
        showSuccess(t.cancelled);
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
  const carName = `${
    isRTL ? booking.car?.model?.name_ar : booking.car?.model?.brand?.name_en
  } ${
    isRTL ? booking.car?.model?.brand?.name_ar : booking.car?.model?.name_en
  }`;

  const getRentalTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      daily: t.daily,
      weekly: t.weekly,
      monthly: t.monthly,
    };
    return types[type] || t.ownership;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Header */}
        <Header statusConfig={statusConfig} onBack={() => router.back()} />

        {/* Timer Alert */}
        {booking.status === "confirmed" && (
          <TimerAlert
            formattedTime={formattedTime || ""}
            isExpired={isExpired}
          />
        )}

        {/* Car Image */}
        <CarImage imageUrl={booking.car?.model?.default_image_url} />

        {/* Car Information */}
        <Section title={t.carInfo}>
          <InfoRow label={t.model} value={carName} />
          <InfoRow label={t.year} value={booking.car?.model?.year} />
          <InfoRow
            label={t.color}
            value={
              isRTL ? booking.car?.color?.name_ar : booking.car?.color?.name_en
            }
          />
          <InfoRow label={t.transmission} value={booking.car?.transmission} />
          <InfoRow label={t.fuelType} value={booking.car?.fuel_type} />
          <InfoRow
            label={t.seats}
            value={`${booking.car?.seats} ${t.seats}`}
            showSeparator={false}
          />
        </Section>

        {/* Booking Information */}
        <Section title={t.bookingInfo}>
          <InfoRow label={t.reference} value={booking.id.slice(0, 8)} />
          <InfoRow label={t.startDate} value={booking.start_date} />
          <InfoRow label={t.endDate} value={booking.end_date} />
          <InfoRow
            label={t.duration}
            value={`${booking.total_days} ${t.days}`}
          />
          <InfoRow
            label={t.rentalType}
            value={getRentalTypeLabel(booking.rental_type)}
            showSeparator={false}
          />
        </Section>

        {/* Financial Information */}
        <FinancialSection
          dailyRate={booking.daily_rate}
          totalAmount={booking.total_amount}
          discountAmount={booking.discount_amount}
          finalAmount={booking.final_amount}
        />

        {/* Branch Information */}
        <Section title={t.branchInfo}>
          <InfoRow
            label={t.name}
            value={isRTL ? booking.branch?.name_ar : booking.branch?.name_en}
          />
          <InfoRow
            label={t.location}
            value={
              isRTL ? booking.branch?.location_ar : booking.branch?.location_en
            }
          />
          <InfoRow label={t.phone} value={booking.branch?.phone} />
          <InfoRow
            label={t.workingHours}
            value={booking.branch?.working_hours}
            showSeparator={false}
          />
        </Section>

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
        onCancel={() => setShowCancelModal(false)}
      />
    </View>
  );
}
