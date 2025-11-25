// screens/BookingScreen.tsx (المحدثة)
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Components
import BookingAvailabilityIndicator from "@/components/booking/BookingAvailabilityIndicator";
import BookingButtonSection from "@/components/booking/BookingButtonSection";
import BookingCalendarModal from "@/components/booking/BookingCalendarModal";
import BookingCarSection from "@/components/booking/BookingCarSection";
import BookingFormSection from "@/components/booking/BookingFormSection";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingSummarySection from "@/components/booking/BookingSummarySection";

// Hooks
import {
  useBookingAvailability,
  useCarForBooking,
  usePricePreview,
  useUserEligibility,
} from "@/hooks/booking/useBookingFlow";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";

// Utils
import CustomButton from "@/components/ui/CustomButton";
import { supabase } from "@/lib/supabase";
import useLanguageStore from "@/store/useLanguageStore";

// Types
interface BookingFormData {
  startDate: string;
  endDate: string;
  rentalType: "daily" | "weekly" | "monthly";
  duration: number;
}

interface CalendarDate {
  date: Date;
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

const BookingScreen: React.FC = () => {
  const { carId } = useLocalSearchParams<{ carId?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  // State
  const [formData, setFormData] = useState<BookingFormData>({
    startDate: "",
    endDate: "",
    rentalType: "monthly",
    duration: 1,
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // Data Hooks
  const {
    data: car,
    isLoading: isLoadingCar,
    error: carError,
  } = useCarForBooking(carId);

  const { data: eligibility, isLoading: isLoadingEligibility } =
    useUserEligibility();

  const { data: pricePreview, isLoading: isLoadingPrice } = usePricePreview(
    car?.car_id,
    formData.rentalType,
    formData.startDate,
    formData.endDate,
    !!(formData.startDate && formData.endDate)
  );

  const { data: availability, isLoading: isCheckingAvailability } =
    useBookingAvailability(
      car?.car_id,
      formData.startDate,
      formData.endDate,
      !!(formData.startDate && formData.endDate)
    );

  // ============================================
  // Translations
  // ============================================
  const t = useMemo(
    () => ({
      title: currentLanguage === "ar" ? "حجز السيارة" : "Car Booking",
      carDetails: currentLanguage === "ar" ? "تفاصيل السيارة" : "Car Details",
      bookingData: currentLanguage === "ar" ? "بيانات الحجز" : "Booking Data",
      rentalType: currentLanguage === "ar" ? "نوع الإيجار" : "Rental Type",
      duration: currentLanguage === "ar" ? "المدة" : "Duration",
      startDate: currentLanguage === "ar" ? "تاريخ البداية" : "Start Date",
      rentalDate: currentLanguage === "ar" ? "تاريخ الإيجار" : "Rental Date",
      dailyPrice: currentLanguage === "ar" ? "السعر اليومي:" : "Daily Price:",
      numberOfDays:
        currentLanguage === "ar" ? "عدد الأيام:" : "Number of Days:",
      originalPrice:
        currentLanguage === "ar" ? "السعر الأصلي:" : "Original Price:",
      totalAmount:
        currentLanguage === "ar" ? "المجموع الكلي:" : "Total Amount:",
      saved: currentLanguage === "ar" ? "وفرت:" : "You Saved:",
      confirmBooking:
        currentLanguage === "ar" ? "تأكيد الحجز" : "Confirm Booking",
      processing:
        currentLanguage === "ar"
          ? "جاري إنشاء الحجز..."
          : "Creating Booking...",
      checkingAvailability:
        currentLanguage === "ar"
          ? "جاري التحقق من التوفر..."
          : "Checking Availability...",
      bookingSuccess:
        currentLanguage === "ar"
          ? "تم استلام طلب الحجز"
          : "Booking Request Received",
      bookingPending:
        currentLanguage === "ar"
          ? "سيقوم الفرع بمراجعة طلبك وإشعارك بالقرار خلال 24 ساعة.\n\nيمكنك متابعة حالة الحجز من 'حجوزاتي'."
          : "The branch will review your request and notify you within 24 hours.\n\nYou can track your booking status in 'My Bookings'.",
      carNotFound:
        currentLanguage === "ar" ? "السيارة غير موجودة" : "Car Not Found",
      loading:
        currentLanguage === "ar"
          ? "جاري تحميل بيانات السيارة..."
          : "Loading car data...",
      backToSearch:
        currentLanguage === "ar" ? "العودة للبحث" : "Back to Search",
      riyal: currentLanguage === "ar" ? "ريال" : "SAR",
      days: currentLanguage === "ar" ? "يوم" : "days",
      seats: currentLanguage === "ar" ? "مقاعد" : "seats",
      new: currentLanguage === "ar" ? "جديدة" : "New",
      selectDate: currentLanguage === "ar" ? "اختر التاريخ" : "Select Date",
      tapToSelectDate:
        currentLanguage === "ar"
          ? "اضغط لاختيار التاريخ"
          : "Tap to select date",
      customerInfo:
        currentLanguage === "ar" ? "بيانات العميل" : "Customer Information",
      name: currentLanguage === "ar" ? "الاسم:" : "Name:",
      email: currentLanguage === "ar" ? "البريد:" : "Email:",
      phone: currentLanguage === "ar" ? "الهاتف:" : "Phone:",
      selectRentalType:
        currentLanguage === "ar" ? "اختر نوع الإيجار" : "Select rental type",
      selectWeeks:
        currentLanguage === "ar"
          ? "اختر عدد الأسابيع"
          : "Select number of weeks",
      selectMonths:
        currentLanguage === "ar"
          ? "اختر عدد الأشهر"
          : "Select number of months",
      carAvailable:
        currentLanguage === "ar"
          ? "السيارة متاحة للفترة المحددة"
          : "Car is available for selected period",
      carNotAvailable:
        currentLanguage === "ar"
          ? "السيارة غير متاحة للفترة المحددة"
          : "Car is not available for selected period",
      notEligible:
        currentLanguage === "ar" ? "غير مؤهل للحجز" : "Not Eligible to Book",
      back: currentLanguage === "ar" ? "العودة" : "Back",
    }),
    [currentLanguage]
  );

  // ============================================
  // Calculated Values
  // ============================================

  // أنواع الإيجار المتاحة
  const availableRentalTypes = useMemo(() => {
    if (!car?.rental_types) return [];

    const allTypes = [
      { value: "daily", label: currentLanguage === "ar" ? "يومي" : "Daily" },
      {
        value: "weekly",
        label: currentLanguage === "ar" ? "أسبوعي" : "Weekly",
      },
      {
        value: "monthly",
        label: currentLanguage === "ar" ? "شهري" : "Monthly",
      },
    ];

    return allTypes.filter((type) => car.rental_types.includes(type.value));
  }, [car?.rental_types, currentLanguage]);

  // الحد الأدنى للتاريخ (غداً)
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }, []);

  // ============================================
  // Effects
  // ============================================

  // ============================================
  // Effect: تعيين rental type افتراضي من السيارة
  // ============================================
  useEffect(() => {
    if (car?.rental_types && car.rental_types.length > 0) {
      // ✅ اختيار أول نوع متاح تلقائياً
      const firstAvailable = car.rental_types[0];

      setFormData((prev) => ({
        ...prev,
        rentalType: firstAvailable as "daily" | "weekly" | "monthly",
      }));
    }
  }, [car?.rental_types]);

  // حساب تاريخ النهاية تلقائياً
  useEffect(() => {
    if (formData.startDate && formData.rentalType && formData.duration) {
      const start = new Date(formData.startDate);
      let endDate: Date;

      if (formData.rentalType === "daily") {
        endDate = new Date(start);
        endDate.setDate(start.getDate() + formData.duration);
      } else if (formData.rentalType === "weekly") {
        endDate = new Date(start);
        endDate.setDate(start.getDate() + formData.duration * 7);
      } else if (formData.rentalType === "monthly") {
        endDate = new Date(start);
        endDate.setMonth(start.getMonth() + formData.duration);
      } else {
        endDate = new Date(start);
      }

      setFormData((prev) => ({
        ...prev,
        endDate: endDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.startDate, formData.rentalType, formData.duration]);

  // ============================================
  // Handlers
  // ============================================

  const handleDateSelect = useCallback((date: CalendarDate) => {
    setFormData((prev) => ({
      ...prev,
      startDate: date.dateString,
    }));
    setShowCalendar(false);
  }, []);

  const handleFormDataChange = useCallback((data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // ============================================
  // handleSubmit محسّن
  // ============================================
  const handleSubmit = useCallback(async () => {
    // ✅ تحسين التحققات
    if (!car) {
      Alert.alert(
        currentLanguage === "ar" ? "خطأ" : "Error",
        currentLanguage === "ar"
          ? "لا يمكن العثور على بيانات السيارة"
          : "Cannot find car data"
      );
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      Alert.alert(
        currentLanguage === "ar" ? "خطأ" : "Error",
        currentLanguage === "ar"
          ? "يرجى اختيار تاريخ الإيجار"
          : "Please select rental dates"
      );
      return;
    }

    if (!pricePreview) {
      Alert.alert(
        currentLanguage === "ar" ? "خطأ" : "Error",
        currentLanguage === "ar"
          ? "لا يمكن حساب السعر. يرجى المحاولة مرة أخرى"
          : "Cannot calculate price. Please try again"
      );
      return;
    }

    // التحقق من الأهلية
    if (eligibility && !eligibility.is_eligible) {
      Alert.alert(
        currentLanguage === "ar" ? "غير مؤهل" : "Not Eligible",
        currentLanguage === "ar"
          ? eligibility.reason_message_ar
          : eligibility.reason_message_en
      );
      return;
    }

    // التحقق النهائي من التوفر
    if (availability?.isAvailable === false) {
      Alert.alert(
        currentLanguage === "ar" ? "غير متاح" : "Not Available",
        availability.message ||
          (currentLanguage === "ar"
            ? "السيارة غير متاحة للفترة المحددة"
            : "Car is not available for selected period")
      );
      return;
    }

    setIsCreatingBooking(true);
    try {
      console.log("📝 Creating booking...");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert(
          currentLanguage === "ar" ? "خطأ" : "Error",
          currentLanguage === "ar"
            ? "يجب تسجيل الدخول أولاً"
            : "You must login first"
        );
        return;
      }

      const { data: booking, error } = await supabase.rpc(
        "create_booking_atomic",
        {
          p_customer_id: user.id,
          p_car_id: car.car_id,
          p_branch_id: car.branch_id,
          p_rental_type: formData.rentalType,
          p_start: formData.startDate,
          p_end: formData.endDate,
          p_daily_rate: pricePreview.price_per_unit, // ❌ غير موجود
          p_discount_amount: pricePreview.discount_amount, // ❌ غير موجود
          p_initial_status: "pending",
          p_notes: null,
        }
      );
      if (error) {
        console.error("❌ Booking error:", error);
        handleBookingError(error);
        return;
      }

      console.log("✅ Booking created:", booking);

      Alert.alert(t.bookingSuccess, t.bookingPending, [
        {
          text: "OK",
          onPress: () => router.replace("/Bills"),
        },
      ]);
    } catch (error: any) {
      console.error("❌ handleSubmit error:", error);
      Alert.alert(
        currentLanguage === "ar" ? "خطأ" : "Error",
        error.message ||
          (currentLanguage === "ar"
            ? "حدث خطأ غير متوقع"
            : "An unexpected error occurred")
      );
    } finally {
      setIsCreatingBooking(false);
    }
  }, [
    car,
    eligibility,
    pricePreview,
    availability,
    formData,
    currentLanguage,
    router,
    t.bookingSuccess,
    t.bookingPending,
  ]);

  const handleBookingError = useCallback(
    (error: any) => {
      const msg = error.message || "";

      // السيارة غير متاحة
      if (msg.includes("not available") || msg.includes("No availability")) {
        Alert.alert(
          currentLanguage === "ar" ? "غير متاح" : "Not Available",
          currentLanguage === "ar"
            ? "عذراً، تم حجز هذه السيارة للتو من عميل آخر.\n\nيرجى:\n• اختيار تواريخ أخرى\n• أو اختيار سيارة بديلة"
            : "Sorry, this car was just booked.\n\nPlease:\n• Choose different dates\n• Or select another car",
          [
            {
              text:
                currentLanguage === "ar"
                  ? "اختيار سيارة أخرى"
                  : "Choose Another Car",
              onPress: () => router.back(),
            },
            {
              text: currentLanguage === "ar" ? "إعادة المحاولة" : "Try Again",
              style: "cancel",
            },
          ]
        );
        return;
      }

      // خطأ في المصادقة
      if (msg.includes("Unauthenticated")) {
        Alert.alert(
          currentLanguage === "ar" ? "خطأ في المصادقة" : "Authentication Error",
          currentLanguage === "ar"
            ? "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى"
            : "Your session expired. Please login again"
        );
        return;
      }

      // نوع الإيجار غير مدعوم
      if (msg.includes("Rental type") && msg.includes("not allowed")) {
        Alert.alert(
          currentLanguage === "ar"
            ? "نوع الإيجار غير متاح"
            : "Rental Type Not Available",
          currentLanguage === "ar"
            ? "نوع الإيجار المحدد غير متاح لهذه السيارة"
            : "The selected rental type is not available for this car"
        );
        return;
      }

      // خطأ عام
      Alert.alert(
        currentLanguage === "ar" ? "خطأ في إنشاء الحجز" : "Booking Error",
        msg ||
          (currentLanguage === "ar"
            ? "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى"
            : "An unexpected error occurred, please try again")
      );
    },
    [currentLanguage, router]
  );

  // ============================================
  // Styles
  // ============================================
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      paddingTop: responsive.safeAreaTop + 16,
      paddingBottom: responsive.safeAreaBottom + 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: responsive.getResponsiveValue(20, 24, 28, 32, 36),
    },
    loadingText: {
      fontSize: responsive.getFontSize(18, 17, 21),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      textAlign: "center",
    },
    loadingSubtext: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
    },
    errorIcon: {
      marginBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    buttonContainer: {
      marginTop: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    cardContainer: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    // حالة التوفر
    availabilityContainer: {
      marginTop: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      padding: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      borderRadius: 12,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 10,
    },
    availabilityAvailable: {
      backgroundColor: colors.success + "15",
      borderWidth: 1,
      borderColor: colors.success + "40",
    },
    availabilityNotAvailable: {
      backgroundColor: colors.error + "15",
      borderWidth: 1,
      borderColor: colors.error + "40",
    },
    availabilityChecking: {
      backgroundColor: colors.primary + "10",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    availabilityText: {
      flex: 1,
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.Regular,
    },
    availabilityTextAvailable: {
      color: colors.success,
    },
    availabilityTextNotAvailable: {
      color: colors.error,
    },
    availabilityTextChecking: {
      color: colors.primary,
    },
  });

  // Render Loading (نفسه)
  if (isLoadingCar || isLoadingEligibility) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t.loading}</Text>
        <Text style={styles.loadingSubtext}>
          {currentLanguage === "ar" ? "يرجى الانتظار" : "Please wait"}
        </Text>
      </View>
    );
  }

  // ============================================
  // Render Error - Not Eligible (محسّن)
  // ============================================
  if (
    eligibility &&
    !eligibility.is_eligible &&
    eligibility.reason_code !== "FALLBACK"
  ) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="accessibility-outline"
          size={64}
          color={colors.warning}
          style={styles.errorIcon}
        />
        <Text style={styles.loadingText}>{t.notEligible}</Text>
        <Text style={styles.loadingSubtext}>
          {currentLanguage === "ar"
            ? eligibility.reason_message_ar
            : eligibility.reason_message_en}
        </Text>

        {/* ✅ زر مساعدة */}
        <View style={styles.buttonContainer}>
          {eligibility.reason_code === "DOCUMENTS_REQUIRED" && (
            <CustomButton
              title={
                currentLanguage === "ar" ? "رفع المستندات" : "Upload Documents"
              }
              onPress={() => router.push("/screens/DocumentsUploadScreen")}
              bgVariant="primary"
            />
          )}

          {eligibility.reason_code === "NOT_AUTHENTICATED" && (
            <CustomButton
              title={t.notEligible}
              onPress={() => router.replace("/(auth)/sign-in")}
              bgVariant="primary"
            />
          )}
          {eligibility.reason_code !== "NOT_AUTHENTICATED" &&
            eligibility.reason_code !== "DOCUMENTS_REQUIRED" && (
              <CustomButton
                title={t.backToSearch}
                onPress={() => router.replace("/(tabs)/Cars")}
                bgVariant="primary"
              />
            )}
        </View>
      </View>
    );
  }

  // ============================================
  // Render: عرض رسالة إذا لم يكن هناك rental types
  // ============================================
  if (car && (!car.rental_types || car.rental_types.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="close-circle"
          size={64}
          color={colors.error}
          style={styles.errorIcon}
        />
        <Text style={styles.loadingText}>
          {currentLanguage === "ar"
            ? "غير متاح للحجز"
            : "Not Available for Booking"}
        </Text>
        <Text style={styles.loadingSubtext}>
          {currentLanguage === "ar"
            ? "هذه السيارة غير متاحة للحجز حالياً"
            : "This car is not available for booking at the moment"}
        </Text>
        <View style={styles.buttonContainer}>
          <CustomButton
            title={t.backToSearch}
            onPress={() => router.back()}
            bgVariant="primary"
          />
        </View>
      </View>
    );
  }
  // ============================================
  // Render Error - Car Not Found
  // ============================================
  if (carError || !car) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="alert-circle"
          size={64}
          color={colors.error}
          style={styles.errorIcon}
        />
        <Text style={styles.loadingText}>{t.carNotFound}</Text>
        <Text style={styles.loadingSubtext}>
          {currentLanguage === "ar"
            ? "لا يمكن العثور على السيارة المطلوبة أو أنها غير متاحة"
            : "Cannot find the requested car or it is not available"}
        </Text>
        <View style={styles.buttonContainer}>
          <CustomButton
            title={t.backToSearch}
            onPress={() => router.back()}
            bgVariant="primary"
          />
        </View>
      </View>
    );
  }

  // ============================================
  // Render Error - Not Eligible
  // ============================================
  if (eligibility && !eligibility.is_eligible) {
    return (
      <View style={[styles.loadingContainer]}>
        <Ionicons
          name="lock-closed"
          size={64}
          color={colors.warning}
          style={styles.errorIcon}
        />
        <Text style={styles.loadingText}>{t.notEligible}</Text>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={t.back}
            onPress={() => router.back()}
            bgVariant="primary"
          />
        </View>
      </View>
    );
  }

  // Render Main Content
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <BookingHeader title={t.title} onBack={() => router.back()} />

        {/* Car Info */}
        <BookingCarSection
          car={{
            car_id: car.car_id,
            brand_name_ar: car.brand.name_ar,
            brand_name_en: car.brand.name_en,
            model_name_ar: car.model.name_ar,
            model_name_en: car.model.name_en,
            model_year: car.model.year,
            main_image_url: car.model.default_image_url || "",
            color_name_ar: car.color.name_ar,
            color_name_en: car.color.name_en,
            daily_price: car.daily_price,
            seats: car.seats,
            fuel_type: car.fuel_type,
            transmission: car.transmission,
            is_new: car.is_new,
            discount_percentage: car.discount_percentage,
            branch_name_ar: car.branch.name_ar,
            branch_name_en: car.branch.name_en,
          }}
          cardTitle={t.carDetails}
          newLabel={t.new}
          seatsLabel={t.seats}
          riyalLabel={t.riyal}
        />

        {/* Booking Form Section */}
        <BookingFormSection
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onOpenCalendar={() => setShowCalendar(true)}
          availableRentalTypes={availableRentalTypes}
          prices={{
            daily: car.daily_price,
            weekly: car.weekly_price || 0,
            monthly: car.monthly_price || 0,
          }}
          cardTitle={t.bookingData}
          texts={{
            rentalType: t.rentalType,
            duration: t.duration,
            rentalDate: t.rentalDate,
            startDate: t.startDate,
            selectRentalType: t.selectRentalType,
            selectWeeks: t.selectWeeks,
            selectMonths: t.selectMonths,
            tapToSelectDate: t.tapToSelectDate,
            totalPrice: t.totalAmount,
          }}
        />

        {/* Availability Indicator */}
        <BookingAvailabilityIndicator
          availability={
            availability
              ? {
                  ...availability,
                  // convert nulls to undefined so isAvailable fits boolean | undefined
                  isAvailable: availability.isAvailable ?? undefined,
                  message: availability.message ?? undefined,
                }
              : null
          }
          isCheckingAvailability={isCheckingAvailability}
          startDate={formData.startDate}
          endDate={formData.endDate}
          checkingText={t.checkingAvailability}
        />

        {/* Price Summary */}
        <BookingSummarySection
          pricePreview={pricePreview}
          texts={{
            dailyPrice: t.dailyPrice,
            numberOfDays: t.numberOfDays,
            originalPrice: t.originalPrice,
            totalAmount: t.totalAmount,
            saved: t.saved,
            days: t.days,
            riyal: t.riyal,
          }}
        />

        {/* Booking Button */}
        <BookingButtonSection
          loading={isCreatingBooking || isLoadingPrice}
          disabled={
            isCreatingBooking ||
            isLoadingPrice ||
            !pricePreview ||
            !formData.startDate ||
            availability?.isAvailable === false ||
            isCheckingAvailability
          }
          onSubmit={handleSubmit}
          userProfile={
            eligibility?.user_profile
              ? {
                  name: eligibility.user_profile.full_name,
                  email: eligibility.user_profile.email,
                  phone: eligibility.user_profile.phone ?? "",
                }
              : null
          }
          totalPrice={pricePreview?.final_price || 0}
          texts={{
            processing: isCreatingBooking ? t.processing : t.confirmBooking,
            confirmBooking: t.confirmBooking,
            riyal: t.riyal,
            customerInfo: t.customerInfo,
            name: t.name,
            email: t.email,
            phone: t.phone,
          }}
        />
      </ScrollView>

      {/* Calendar Modal */}
      <BookingCalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
        minDate={minDate}
        rentalType={formData.rentalType}
        duration={formData.duration}
      />
    </View>
  );
};

export default BookingScreen;
