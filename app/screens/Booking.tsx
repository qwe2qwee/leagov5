import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BookingButton from "@/components/booking/BookingButton";
import BookingCalendarModal from "@/components/booking/BookingCalendarModal";
import BookingCarInfo from "@/components/booking/BookingCarInfo";
import BookingForm from "@/components/booking/BookingForm";
import BookingSummary from "@/components/booking/BookingSummary";
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import useLanguageStore from "@/store/useLanguageStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";

interface BookingFormData {
  startDate: string;
  endDate: string;
  rentalType: "daily" | "weekly" | "monthly";
  duration: number;
}

interface CarData {
  car_id: string;
  brand_name_ar: string;
  brand_name_en: string;
  model_name_ar: string;
  model_name_en: string;
  model_year: number;
  main_image_url: string;
  color_name_ar: string;
  color_name_en: string;
  daily_price: number;
  weekly_price?: number;
  monthly_price?: number;
  seats: number;
  fuel_type: string;
  transmission: string;
  branch_id: string;
  branch_name_ar: string;
  branch_name_en: string;
  is_new: boolean;
  discount_percentage: number;
  status: string;
  additional_images?: string[];
  is_available: boolean;
  description_ar?: string;
  features_ar?: string[];
  rental_types: string[];
}

interface BestOffer {
  offer_source: string;
  offer_id: string | null;
  offer_name_ar: string | null;
  offer_name_en: string | null;
  discount_type: string;
  discount_value: number;
  original_price: number;
  discounted_price: number;
  savings_amount: number;
}

interface UserProfile {
  full_name: string;
  phone?: string;
  email: string;
}

interface UserDocuments {
  approved: boolean;
  pending: boolean;
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
  const { carId: id } = useLocalSearchParams<{ carId?: string }>();
  const { push, replace, back } = useSafeNavigate();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  // State management
  const [car, setCar] = useState<CarData | null>(null);
  const [bestOffer, setBestOffer] = useState<BestOffer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCar, setFetchingCar] = useState<boolean>(true);
  const [isUserVerified, setIsUserVerified] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userDocuments, setUserDocuments] = useState<UserDocuments | null>(
    null
  );

  // حالة جديدة - التحقق من التوفر
  const [checkingAvailability, setCheckingAvailability] =
    useState<boolean>(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    isAvailable: boolean | null;
    message: string | null;
  }>({ isAvailable: null, message: null });

  // Calendar state
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<BookingFormData>({
    startDate: "",
    endDate: "",
    rentalType: "daily",
    duration: 1,
  });

  // Localized texts - محسّنة
  const t = useMemo(
    () => ({
      title: currentLanguage === "ar" ? "حجز السيارة" : "Car Booking",
      subtitle:
        currentLanguage === "ar"
          ? "أكمل البيانات التالية لتأكيد حجزك"
          : "Complete the following data to confirm your booking",
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
      loginRequired:
        currentLanguage === "ar" ? "تسجيل الدخول مطلوب" : "Login Required",
      verificationRequired:
        currentLanguage === "ar"
          ? "التحقق من الهوية مطلوب"
          : "Identity Verification Required",
      // رسائل محسّنة
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
      // رسائل جديدة للتوفر
      available: currentLanguage === "ar" ? "متاحة" : "Available",
      notAvailable: currentLanguage === "ar" ? "غير متاحة" : "Not Available",
      carAvailable:
        currentLanguage === "ar"
          ? "السيارة متاحة للفترة المحددة"
          : "Car is available for selected period",
      carNotAvailable:
        currentLanguage === "ar"
          ? "السيارة غير متاحة للفترة المحددة"
          : "Car is not available for selected period",
      tryDifferentDates:
        currentLanguage === "ar"
          ? "يرجى اختيار تواريخ أخرى"
          : "Please select different dates",
    }),
    [currentLanguage]
  );

  // Rental type options
  const rentalTypeOptions = useMemo(
    () => [
      { value: "daily", label: currentLanguage === "ar" ? "يومي" : "Daily" },
      {
        value: "weekly",
        label: currentLanguage === "ar" ? "أسبوعي" : "Weekly",
      },
      {
        value: "monthly",
        label: currentLanguage === "ar" ? "شهري" : "Monthly",
      },
    ],
    [currentLanguage]
  );

  // Calculate end date based on rental type and duration
  useEffect(() => {
    if (formData.startDate && formData.rentalType && formData.duration) {
      const start = new Date(formData.startDate);
      let endDate: Date;

      if (formData.rentalType === "daily") {
        endDate = new Date(start);
        endDate.setDate(start.getDate() + 1);
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

  // التحقق من التوفر عند تغيير التواريخ - جديد
  useEffect(() => {
    const checkAvailability = async () => {
      if (!car || !formData.startDate || !formData.endDate) {
        setAvailabilityStatus({ isAvailable: null, message: null });
        return;
      }

      // تحقق من صحة التواريخ أولاً
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        setAvailabilityStatus({
          isAvailable: false,
          message:
            currentLanguage === "ar"
              ? "لا يمكن الحجز في الماضي"
              : "Cannot book in the past",
        });
        return;
      }

      if (start >= end) {
        setAvailabilityStatus({
          isAvailable: false,
          message:
            currentLanguage === "ar"
              ? "تاريخ النهاية يجب أن يكون بعد تاريخ البداية"
              : "End date must be after start date",
        });
        return;
      }

      setCheckingAvailability(true);
      try {
        const { data: isAvailable, error } = await supabase.rpc(
          "check_car_availability",
          {
            _car_id: car.car_id,
            _start_date: formData.startDate,
            _end_date: formData.endDate,
          }
        );

        if (error) {
          console.warn("Availability check error:", error);
          setAvailabilityStatus({
            isAvailable: null,
            message: null,
          });
          return;
        }

        if (isAvailable === true) {
          setAvailabilityStatus({
            isAvailable: true,
            message: t.carAvailable,
          });
        } else {
          setAvailabilityStatus({
            isAvailable: false,
            message: t.carNotAvailable,
          });
        }
      } catch (error) {
        console.error("Error checking availability:", error);
        setAvailabilityStatus({ isAvailable: null, message: null });
      } finally {
        setCheckingAvailability(false);
      }
    };

    // تأخير بسيط لتجنب كثرة الطلبات
    const timer = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    car,
    formData.startDate,
    formData.endDate,
    currentLanguage,
    t.carAvailable,
    t.carNotAvailable,
  ]);

  // Fetch car data from Supabase
  useEffect(() => {
    const fetchCarData = async () => {
      if (!id) {
        back();
        return;
      }

      setFetchingCar(true);
      try {
        const { data: carData, error: carError } = await supabase
          .from("cars")
          .select(
            `
            id,
            daily_price,
            weekly_price,
            monthly_price,
            discount_percentage,
            is_new,
            seats,
            fuel_type,
            transmission,
            branch_id,
            status,
            additional_images,
            description_ar,
            features_ar,
            rental_types,
            car_models!inner (
              name_ar,
              name_en,
              year,
              default_image_url,
              car_brands!inner (
                name_ar,
                name_en
              )
            ),
            car_colors!inner (
              name_ar,
              name_en
            ),
            branches!inner (
              name_ar,
              name_en
            )
          `
          )
          .eq("id", id)
          .eq("status", "available")
          .maybeSingle();

        if (carError) throw carError;

        if (!carData) {
          Alert.alert(
            t.carNotFound,
            currentLanguage === "ar"
              ? "لا يمكن العثور على السيارة المطلوبة أو أنها غير متاحة"
              : "Cannot find the requested car or it is not available"
          );
          back();
          return;
        }

        const dd = carData as any;

        const transformedCar: CarData = {
          car_id: dd.id,
          brand_name_ar: dd.car_models.car_brands.name_ar,
          brand_name_en: dd.car_models.car_brands.name_en,
          model_name_ar: dd.car_models.name_ar,
          model_name_en: dd.car_models.name_en,
          model_year: dd.car_models.year,
          main_image_url: dd.car_models.default_image_url || "",
          color_name_ar: dd.car_colors.name_ar,
          color_name_en: dd.car_colors.name_en,
          daily_price: dd.daily_price,
          weekly_price: dd.weekly_price,
          monthly_price: dd.monthly_price,
          seats: dd.seats,
          fuel_type: dd.fuel_type,
          transmission: dd.transmission,
          branch_id: dd.branch_id,
          branch_name_ar: dd.branches.name_ar,
          branch_name_en: dd.branches.name_en,
          is_new: dd.is_new,
          discount_percentage: dd.discount_percentage || 0,
          status: dd.status,
          additional_images: dd.additional_images || [],
          is_available: dd.status === "available",
          description_ar: dd.description_ar,
          features_ar: dd.features_ar || [],
          rental_types: dd.rental_types || ["daily"],
        };

        setCar(transformedCar);
      } catch (error: any) {
        console.error("Error fetching car data:", error);
        Alert.alert(
          currentLanguage === "ar" ? "خطأ في جلب البيانات" : "Data Fetch Error",
          error.message ||
            (currentLanguage === "ar"
              ? "حدث خطأ في جلب بيانات السيارة"
              : "Error fetching car data")
        );
        back();
      } finally {
        setFetchingCar(false);
      }
    };

    fetchCarData();
  }, [id, back, currentLanguage, t.carNotFound]);

  // Check user verification status and fetch profile
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setIsUserVerified(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone, email")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profile) {
          setUserProfile(profile as UserProfile);
        }

        const { data: documents, error: docsError } = await supabase
          .from("documents")
          .select("status")
          .eq("user_id", user.id);

        if (docsError) {
          console.error("Error fetching documents:", docsError);
        } else if (documents) {
          const hasApproved = documents.some(
            (doc: any) => doc.status === "approved"
          );
          const hasPending = documents.some(
            (doc: any) => doc.status === "pending"
          );
          setUserDocuments({ approved: hasApproved, pending: hasPending });
        } else {
          setUserDocuments({ approved: false, pending: false });
        }

        const { data: verified, error } = await supabase.rpc(
          "is_user_verified",
          { _user_id: user.id }
        );

        if (error) throw error;
        setIsUserVerified(verified || false);
      } catch (error) {
        console.error("Error checking user verification:", error);
        setIsUserVerified(false);
      }
    };

    checkUserStatus();
  }, []);

  const actualDays = useMemo(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }
    return 1;
  }, [formData.startDate, formData.endDate]);

  const availableRentalTypes = useMemo(() => {
    if (!car?.rental_types) return [];
    return rentalTypeOptions.filter((option) =>
      car.rental_types.includes(option.value)
    );
  }, [car?.rental_types, rentalTypeOptions]);

  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }, []);

  const calculatePricing = useCallback(async () => {
    if (car && formData.rentalType && formData.duration > 0) {
      try {
        let baseAmount = 0;

        if (formData.rentalType === "daily") {
          baseAmount = (car.daily_price || 0) * formData.duration;
        } else if (formData.rentalType === "weekly") {
          baseAmount = (car.weekly_price || 0) * formData.duration;
        } else if (formData.rentalType === "monthly") {
          baseAmount = (car.monthly_price || 0) * formData.duration;
        }

        const discountAmount = car.discount_percentage
          ? (baseAmount * car.discount_percentage) / 100
          : 0;

        setBestOffer({
          offer_source: "direct_discount",
          offer_id: null,
          offer_name_ar: null,
          offer_name_en: null,
          discount_type: "percentage",
          discount_value: car.discount_percentage,
          original_price: baseAmount,
          discounted_price: baseAmount - discountAmount,
          savings_amount: discountAmount,
        });
      } catch (error) {
        console.error("Error calculating pricing:", error);
        setBestOffer(null);
      }
    }
  }, [car, formData.rentalType, formData.duration]);

  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  const handleDateSelect = useCallback((date: CalendarDate) => {
    setFormData((prev) => ({
      ...prev,
      startDate: date.dateString,
    }));
    setShowCalendar(false);
  }, []);

  const handleOpenCalendar = useCallback(() => {
    setShowCalendar(true);
  }, []);

  const handleCloseCalendar = useCallback(() => {
    setShowCalendar(false);
  }, []);

  const handleFormDataChange = useCallback((data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // Handle form submission - محسّن مع تحقق من التوفر
  const handleSubmit = useCallback(async () => {
    if (!car || !bestOffer) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert(
          t.loginRequired,
          currentLanguage === "ar"
            ? "يجب تسجيل الدخول أولاً لإتمام الحجز"
            : "You must login first to complete the booking"
        );
        return;
      }

      if (!userDocuments?.approved) {
        Alert.alert(
          t.verificationRequired,
          userDocuments?.pending
            ? currentLanguage === "ar"
              ? "وثائقك قيد المراجعة، سيتم التواصل معك عند اكتمال التحقق"
              : "Your documents are under review, we will contact you when verification is complete"
            : currentLanguage === "ar"
            ? "لإتمام الحجز، يجب رفع المستندات المطلوبة والموافقة عليها أولاً"
            : "To complete the booking, you must upload and approve the required documents first"
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
          p_daily_rate: car.daily_price || 0,
          p_discount_amount: bestOffer.savings_amount || 0,
          p_initial_status: "pending",
          p_notes: null,
        }
      );

      if (error) {
        console.error("Booking error:", error);

        // معالجة أخطاء محددة
        const errorMsg = error.message || "";

        // خطأ: السيارة غير متاحة (نفدت الكمية أو حُجزت)
        if (
          errorMsg.includes("Car is not available") ||
          errorMsg.includes("Car not available") ||
          errorMsg.includes("available_quantity")
        ) {
          Alert.alert(
            currentLanguage === "ar"
              ? "السيارة غير متاحة"
              : "Car Not Available",
            currentLanguage === "ar"
              ? "عذراً، تم حجز هذه السيارة للتو من عميل آخر.\n\nيرجى:\n• اختيار تواريخ أخرى\n• أو اختيار سيارة بديلة"
              : "Sorry, this car was just booked by another customer.\n\nPlease:\n• Choose different dates\n• Or select an alternative car",
            [
              {
                text:
                  currentLanguage === "ar"
                    ? "اختيار سيارة أخرى"
                    : "Choose Another Car",
                onPress: () => back(),
              },
              {
                text: currentLanguage === "ar" ? "إعادة المحاولة" : "Try Again",
                style: "cancel",
              },
            ]
          );
          return;
        }

        // خطأ: لا توجد سيارات كافية
        if (
          errorMsg.includes("No availability") ||
          errorMsg.includes("Not enough cars")
        ) {
          Alert.alert(
            currentLanguage === "ar"
              ? "لا توجد سيارات متاحة"
              : "No Cars Available",
            currentLanguage === "ar"
              ? "عذراً، جميع سيارات هذا الموديل محجوزة للفترة المحددة.\n\nيرجى اختيار:\n• تواريخ أخرى\n• أو موديل آخر"
              : "Sorry, all cars of this model are booked for the selected period.\n\nPlease choose:\n• Different dates\n• Or another model",
            [
              {
                text:
                  currentLanguage === "ar"
                    ? "اختيار موديل آخر"
                    : "Choose Another Model",
                onPress: () => back(),
              },
              {
                text:
                  currentLanguage === "ar" ? "تواريخ أخرى" : "Different Dates",
                style: "cancel",
              },
            ]
          );
          return;
        }

        // خطأ: مشكلة في المصادقة
        if (errorMsg.includes("Unauthenticated")) {
          Alert.alert(
            currentLanguage === "ar"
              ? "خطأ في المصادقة"
              : "Authentication Error",
            currentLanguage === "ar"
              ? "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى"
              : "Your session has expired. Please login again"
          );
          return;
        }

        // خطأ: نوع الإيجار غير مدعوم
        if (
          errorMsg.includes("Rental type") &&
          errorMsg.includes("not allowed")
        ) {
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

        // خطأ: عدم تطابق الفرع
        if (
          errorMsg.includes("Car branch mismatch") ||
          errorMsg.includes("branch")
        ) {
          Alert.alert(
            currentLanguage === "ar" ? "خطأ في البيانات" : "Data Error",
            currentLanguage === "ar"
              ? "حدث خطأ في بيانات السيارة. يرجى المحاولة مرة أخرى"
              : "An error occurred with car data. Please try again"
          );
          return;
        }

        // خطأ عام
        throw error;
      }

      Alert.alert(t.bookingSuccess, t.bookingPending);
      replace("/Bills");
    } catch (error: any) {
      console.error("Booking error:", error);
      Alert.alert(
        currentLanguage === "ar"
          ? "خطأ في إنشاء الحجز"
          : "Booking Creation Error",
        error.message ||
          (currentLanguage === "ar"
            ? "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى"
            : "An unexpected error occurred, please try again")
      );
    } finally {
      setLoading(false);
    }
  }, [
    car,
    bestOffer,
    userDocuments,
    formData,
    currentLanguage,
    back,
    replace,
    t.loginRequired,
    t.verificationRequired,
    t.bookingSuccess,
    t.bookingPending,
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: responsive.safeAreaTop + 16,
    },
    scrollContainer: {
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
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
      marginBottom: responsive.safeAreaBottom + 20,
    },
    // Styles جديدة لحالة التوفر
    availabilityContainer: {
      marginTop: responsive.getResponsiveValue(12, 14, 16, 18, 20),
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

  if (fetchingCar) {
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

  if (!car) {
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
            onPress={() => back()}
            bgVariant="primary"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t.title} onBack={() => back()} />

        <BookingCarInfo
          car={car}
          cardTitle={t.carDetails}
          newLabel={t.new}
          seatsLabel={t.seats}
          riyalLabel={t.riyal}
        />

        <Card style={styles.cardContainer}>
          <Card.Header>
            <Card.Title size="md">{t.bookingData}</Card.Title>
          </Card.Header>
          <Card.Content>
            <BookingForm
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onOpenCalendar={handleOpenCalendar}
              availableRentalTypes={availableRentalTypes}
              prices={{
                daily: car?.daily_price ?? 0,
                weekly: car?.weekly_price ?? 0,
                monthly: car?.monthly_price ?? 0,
              }}
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

            {/* عرض حالة التوفر - جديد */}
            {formData.startDate && formData.endDate && (
              <View
                style={[
                  styles.availabilityContainer,
                  checkingAvailability
                    ? styles.availabilityChecking
                    : availabilityStatus.isAvailable === true
                    ? styles.availabilityAvailable
                    : availabilityStatus.isAvailable === false
                    ? styles.availabilityNotAvailable
                    : styles.availabilityChecking,
                ]}
              >
                {checkingAvailability ? (
                  <>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text
                      style={[
                        styles.availabilityText,
                        styles.availabilityTextChecking,
                      ]}
                    >
                      {t.checkingAvailability}
                    </Text>
                  </>
                ) : availabilityStatus.isAvailable === true ? (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.success}
                    />
                    <Text
                      style={[
                        styles.availabilityText,
                        styles.availabilityTextAvailable,
                      ]}
                    >
                      {availabilityStatus.message}
                    </Text>
                  </>
                ) : availabilityStatus.isAvailable === false ? (
                  <>
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={colors.error}
                    />
                    <Text
                      style={[
                        styles.availabilityText,
                        styles.availabilityTextNotAvailable,
                      ]}
                    >
                      {availabilityStatus.message}
                    </Text>
                  </>
                ) : null}
              </View>
            )}

            {bestOffer && (
              <BookingSummary
                dailyPrice={car.daily_price}
                actualDays={actualDays}
                bestOffer={bestOffer}
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
            )}

            <BookingButton
              loading={loading}
              disabled={
                loading ||
                !bestOffer ||
                !formData.startDate ||
                availabilityStatus.isAvailable === false ||
                checkingAvailability
              }
              onSubmit={handleSubmit}
              userProfile={userProfile}
              totalPrice={bestOffer?.discounted_price || 0}
              texts={{
                processing: loading ? t.processing : t.confirmBooking,
                confirmBooking: t.confirmBooking,
                riyal: t.riyal,
                customerInfo: t.customerInfo,
                name: t.name,
                email: t.email,
                phone: t.phone,
              }}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      <BookingCalendarModal
        visible={showCalendar}
        onClose={handleCloseCalendar}
        onDateSelect={handleDateSelect}
        minDate={minDate}
        rentalType={formData.rentalType}
        duration={formData.duration}
      />
    </View>
  );
};

export default BookingScreen;
