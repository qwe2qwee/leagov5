import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Separator } from "@/components/ui/Separator";
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
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const STATUS_CONFIG = {
  pending: {
    label: { ar: "في انتظار موافقة الفرع", en: "Awaiting Branch Approval" },
    variant: "warning" as const,
  },
  confirmed: {
    label: { ar: "مؤكد - في انتظار الدفع", en: "Confirmed - Awaiting Payment" },
    variant: "info" as const,
  },
  payment_pending: {
    label: { ar: "جاري معالجة الدفع", en: "Processing Payment" },
    variant: "secondary" as const,
  },
  active: {
    label: { ar: "نشط - جاري التأجير", en: "Active - Ongoing Rental" },
    variant: "success" as const,
  },
  completed: {
    label: { ar: "مكتمل", en: "Completed" },
    variant: "secondary" as const,
  },
  cancelled: {
    label: { ar: "ملغي", en: "Cancelled" },
    variant: "destructive" as const,
  },
  expired: {
    label: { ar: "منتهي الصلاحية", en: "Expired" },
    variant: "destructive" as const,
  },
};

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

  console.log("Booking Details:", booking);
  console.log("Booking Error:", error);

  const { cancelBooking, isLoading: isCancelling } = useCancelBooking();
  const { formattedTime, isExpired, hoursLeft } = useBookingTimer(
    booking?.expires_at
  );

  // Real-time updates
  useBookingRealtime(() => {
    refetch();
  });

  const t = {
    carInfo: currentLanguage === "ar" ? "معلومات السيارة" : "Car Information",
    model: currentLanguage === "ar" ? "الموديل" : "Model",
    year: currentLanguage === "ar" ? "السنة" : "Year",
    color: currentLanguage === "ar" ? "اللون" : "Color",
    transmission: currentLanguage === "ar" ? "ناقل الحركة" : "Transmission",
    fuelType: currentLanguage === "ar" ? "نوع الوقود" : "Fuel Type",
    seats: currentLanguage === "ar" ? "عدد المقاعد" : "Seats",
    bookingInfo:
      currentLanguage === "ar" ? "معلومات الحجز" : "Booking Information",
    reference: currentLanguage === "ar" ? "رقم المرجع" : "Reference",
    startDate: currentLanguage === "ar" ? "تاريخ البداية" : "Start Date",
    endDate: currentLanguage === "ar" ? "تاريخ النهاية" : "End Date",
    duration: currentLanguage === "ar" ? "المدة" : "Duration",
    days: currentLanguage === "ar" ? "يوم" : "days",
    rentalType: currentLanguage === "ar" ? "نوع التأجير" : "Rental Type",
    daily: currentLanguage === "ar" ? "يومي" : "Daily",
    weekly: currentLanguage === "ar" ? "أسبوعي" : "Weekly",
    monthly: currentLanguage === "ar" ? "شهري" : "Monthly",
    ownership: currentLanguage === "ar" ? "تمليك" : "Ownership",
    financialInfo:
      currentLanguage === "ar" ? "المعلومات المالية" : "Financial Information",
    dailyRate: currentLanguage === "ar" ? "السعر اليومي" : "Daily Rate",
    total: currentLanguage === "ar" ? "المجموع" : "Total",
    discount: currentLanguage === "ar" ? "الخصم" : "Discount",
    finalAmount: currentLanguage === "ar" ? "المبلغ النهائي" : "Final Amount",
    sar: currentLanguage === "ar" ? "ر.س" : "SAR",
    branchInfo:
      currentLanguage === "ar" ? "معلومات الفرع" : "Branch Information",
    name: currentLanguage === "ar" ? "الاسم" : "Name",
    location: currentLanguage === "ar" ? "الموقع" : "Location",
    phone: currentLanguage === "ar" ? "الهاتف" : "Phone",
    workingHours: currentLanguage === "ar" ? "ساعات العمل" : "Working Hours",
    notes: currentLanguage === "ar" ? "ملاحظات" : "Notes",
    cancelBooking: currentLanguage === "ar" ? "إلغاء الحجز" : "Cancel Booking",
    cancelling: currentLanguage === "ar" ? "جاري الإلغاء..." : "Cancelling...",
    payNow: currentLanguage === "ar" ? "ادفع الآن" : "Pay Now",
    callBranch: currentLanguage === "ar" ? "اتصل بالفرع" : "Call Branch",
    back: currentLanguage === "ar" ? "العودة" : "Go Back",
    error:
      currentLanguage === "ar"
        ? "حدث خطأ في تحميل البيانات"
        : "Error loading data",
    timeLeft:
      currentLanguage === "ar" ? "الوقت المتبقي للدفع" : "Time Left to Pay",
    pleasePayBefore:
      currentLanguage === "ar"
        ? "يرجى إتمام الدفع قبل انتهاء الوقت"
        : "Please complete payment before time expires",
    bookingExpired:
      currentLanguage === "ar" ? "انتهت صلاحية الحجز" : "Booking has expired",
    phoneNotAvailable:
      currentLanguage === "ar"
        ? "رقم الهاتف غير متوفر"
        : "Phone number not available",
    cancelConfirm:
      currentLanguage === "ar"
        ? "هل أنت متأكد من إلغاء هذا الحجز؟"
        : "Are you sure you want to cancel this booking?",
    no: currentLanguage === "ar" ? "لا" : "No",
    yesCancel: currentLanguage === "ar" ? "نعم، إلغاء" : "Yes, Cancel",
    cancelled:
      currentLanguage === "ar"
        ? "تم إلغاء الحجز بنجاح"
        : "Booking cancelled successfully",
  };

  const createStyles = () =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
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
      statusHeader: {
        paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
        paddingTop:
          responsive.safeAreaTop +
          responsive.getResponsiveValue(12, 16, 20, 24, 28),
        paddingBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        alignItems: "center",
      },
      timerAlert: {
        backgroundColor: colors.warning + "20",
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        padding: responsive.getResponsiveValue(14, 16, 20, 22, 24),
        borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
        borderWidth: 1,
        borderColor: colors.warning,
        alignItems: "center",
      },
      timerTitle: {
        fontSize: responsive.getFontSize(13, 12, 15),
        fontFamily: fonts.Medium || fonts.Regular,
        color: colors.warning,
        marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      },
      timerValue: {
        fontSize: responsive.getFontSize(28, 26, 32),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.warning,
        marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      },
      timerSubtext: {
        fontSize: responsive.getFontSize(12, 11, 14),
        fontFamily: fonts.Regular,
        color: colors.warning,
        textAlign: "center",
      },
      expiredAlert: {
        backgroundColor: colors.error + "20",
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        padding: responsive.getResponsiveValue(14, 16, 20, 22, 24),
        borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
        borderWidth: 1,
        borderColor: colors.error,
        alignItems: "center",
      },
      expiredText: {
        fontSize: responsive.getFontSize(15, 14, 17),
        fontFamily: fonts.SemiBold || fonts.Medium,
        color: colors.error,
      },
      imageContainer: {
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
        overflow: "hidden",
        backgroundColor: colors.surface,
      },
      carImage: {
        width: "100%",
        height: responsive.getResponsiveValue(200, 220, 250, 280, 300),
      },
      scrollContent: {
        paddingBottom: responsive.getResponsiveValue(80, 90, 100, 110, 120),
      },
      section: {
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      },
      sectionTitle: {
        fontSize: responsive.getFontSize(17, 16, 20),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.text,
        marginBottom: responsive.getResponsiveValue(10, 12, 16, 18, 20),
        textAlign: isRTL ? "right" : "left",
      },
      infoRow: {
        flexDirection: isRTL ? "row-reverse" : "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      },
      infoLabel: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.Regular,
        color: colors.textSecondary,
      },
      infoValue: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.SemiBold || fonts.Medium,
        color: colors.text,
        textAlign: isRTL ? "right" : "left",
      },
      totalRow: {
        marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        paddingTop: responsive.getResponsiveValue(12, 16, 20, 22, 24),
        borderTopWidth: 2,
        borderTopColor: colors.border,
      },
      totalLabel: {
        fontSize: responsive.getFontSize(16, 15, 18),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.text,
      },
      totalValue: {
        fontSize: responsive.getFontSize(20, 18, 24),
        fontFamily: fonts.Bold,
        color: colors.primary,
      },
      notesText: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.Regular,
        color: colors.text,
        lineHeight: responsive.getFontSize(14, 13, 16) * 1.5,
        textAlign: isRTL ? "right" : "left",
      },
      buttonsContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        padding: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        paddingBottom:
          responsive.safeAreaBottom +
          responsive.getResponsiveValue(12, 16, 20, 24, 28),
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
      },
      modalContent: {
        backgroundColor: colors.surface,
        marginHorizontal: responsive.getResponsiveValue(24, 32, 40, 48, 56),
        borderRadius: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        padding: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      },
      modalTitle: {
        fontSize: responsive.getFontSize(18, 17, 21),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.text,
        marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        textAlign: "center",
      },
      modalMessage: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.Regular,
        color: colors.textSecondary,
        marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
        textAlign: "center",
        lineHeight: responsive.getFontSize(14, 13, 16) * 1.5,
      },
      modalButtons: {
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      },
      modalButton: {
        flex: 1,
      },
    });

  const styles = createStyles();

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
      params: {
        bookingId: booking?.id,
      },
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

  const statusConfig = STATUS_CONFIG[booking.status];
  const carName = `${booking.car?.model?.brand?.name_ar} ${booking.car?.model?.name_ar}`;

  const getRentalTypeLabel = (type: string) => {
    switch (type) {
      case "daily":
        return t.daily;
      case "weekly":
        return t.weekly;
      case "monthly":
        return t.monthly;
      default:
        return t.ownership;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <Badge variant={statusConfig.variant} size="lg">
            {statusConfig.label[currentLanguage]}
          </Badge>
        </View>

        {/* Timer Alert */}
        {booking.status === "confirmed" && !isExpired && (
          <View style={styles.timerAlert}>
            <Text style={styles.timerTitle}>{t.timeLeft}</Text>
            <Text style={styles.timerValue}>{formattedTime}</Text>
            <Text style={styles.timerSubtext}>{t.pleasePayBefore}</Text>
          </View>
        )}

        {isExpired && (
          <View style={styles.expiredAlert}>
            <Text style={styles.expiredText}>{t.bookingExpired}</Text>
          </View>
        )}

        {/* Car Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                booking.car?.model?.default_image_url ||
                "https://via.placeholder.com/400",
            }}
            style={styles.carImage}
            resizeMode="cover"
          />
        </View>

        {/* Car Information */}
        <View style={styles.section}>
          <Card type="default">
            <Card.Content>
              <Text style={styles.sectionTitle}>{t.carInfo}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.model}</Text>
                <Text style={styles.infoValue}>{carName}</Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.year}</Text>
                <Text style={styles.infoValue}>{booking.car?.model?.year}</Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.color}</Text>
                <Text style={styles.infoValue}>
                  {booking.car?.color?.name_ar}
                </Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.transmission}</Text>
                <Text style={styles.infoValue}>
                  {booking.car?.transmission}
                </Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.fuelType}</Text>
                <Text style={styles.infoValue}>{booking.car?.fuel_type}</Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.seats}</Text>
                <Text style={styles.infoValue}>
                  {booking.car?.seats} {t.seats}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Booking Information */}
        <View style={styles.section}>
          <Card type="default">
            <Card.Content>
              <Text style={styles.sectionTitle}>{t.bookingInfo}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.reference}</Text>
                <Text style={styles.infoValue}>{booking.id.slice(0, 8)}</Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.startDate}</Text>
                <Text style={styles.infoValue}>{booking.start_date}</Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.endDate}</Text>
                <Text style={styles.infoValue}>{booking.end_date}</Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.duration}</Text>
                <Text style={styles.infoValue}>
                  {booking.total_days} {t.days}
                </Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.rentalType}</Text>
                <Text style={styles.infoValue}>
                  {getRentalTypeLabel(booking.rental_type)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <Card type="default">
            <Card.Content>
              <Text style={styles.sectionTitle}>{t.financialInfo}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.dailyRate}</Text>
                <Text style={styles.infoValue}>
                  {booking.daily_rate} {t.sar}
                </Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.total}</Text>
                <Text style={styles.infoValue}>
                  {booking.total_amount} {t.sar}
                </Text>
              </View>

              {booking.discount_amount > 0 && (
                <>
                  <Separator />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t.discount}</Text>
                    <Text style={[styles.infoValue, { color: colors.success }]}>
                      -{booking.discount_amount} {t.sar}
                    </Text>
                  </View>
                </>
              )}

              <View style={[styles.infoRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t.finalAmount}</Text>
                <Text style={styles.totalValue}>
                  {booking.final_amount} {t.sar}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Branch Information */}
        <View style={styles.section}>
          <Card type="default">
            <Card.Content>
              <Text style={styles.sectionTitle}>{t.branchInfo}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.name}</Text>
                <Text style={styles.infoValue}>{booking.branch?.name_ar}</Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.location}</Text>
                <Text style={styles.infoValue}>
                  {booking.branch?.location_ar}
                </Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.phone}</Text>
                <Text style={styles.infoValue}>{booking.branch?.phone}</Text>
              </View>
              <Separator />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t.workingHours}</Text>
                <Text style={styles.infoValue}>
                  {booking.branch?.working_hours}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Notes */}
        {booking.notes && (
          <View style={styles.section}>
            <Card type="default">
              <Card.Content>
                <Text style={styles.sectionTitle}>{t.notes}</Text>
                <Text style={styles.notesText}>{booking.notes}</Text>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        {["confirmed", "payment_pending"].includes(booking.status) &&
          !isExpired && (
            <CustomButton
              title={t.payNow}
              bgVariant="success"
              onPress={handlePayNow}
            />
          )}
        {["active", "confirmed"].includes(booking.status) && (
          <CustomButton
            title={t.callBranch}
            bgVariant="primary"
            onPress={handleCallBranch}
          />
        )}
        {booking.status === "pending" && (
          <CustomButton
            title={isCancelling ? t.cancelling : t.cancelBooking}
            bgVariant="outline"
            textVariant="primary"
            onPress={() => setShowCancelModal(true)}
            disabled={isCancelling}
          />
        )}
      </View>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.cancelBooking}</Text>
            <Text style={styles.modalMessage}>{t.cancelConfirm}</Text>

            <View style={styles.modalButtons}>
              <View style={styles.modalButton}>
                <CustomButton
                  title={t.no}
                  bgVariant="outline"
                  textVariant="primary"
                  onPress={() => setShowCancelModal(false)}
                />
              </View>
              <View style={styles.modalButton}>
                <CustomButton
                  title={t.yesCancel}
                  bgVariant="danger"
                  onPress={handleCancelBooking}
                  loading={isCancelling}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
