import CustomCalendar from "@/components/Book/CustomCalendar";
import { Badge } from "@/components/ui/Badge2";
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Select } from "@/components/ui/Select";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BookingFormData {
  startDate: string;
  endDate: string;
  rentalType: "daily" | "weekly" | "monthly";
  duration: number;
}

interface Branch {
  id: string;
  name_ar: string;
  name_en: string;
  location: {
    lat: number;
    lng: number;
    address_ar: string;
    address_en: string;
  };
  phone?: string;
  email?: string;
  working_hours?: {
    open: string; // e.g., "09:00"
    close: string; // e.g., "21:00"
  };
  is_active: boolean;
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
  const router = useRouter();
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

  // Calendar state - initially hidden
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<BookingFormData>({
    startDate: "",
    endDate: "",
    rentalType: "daily",
    duration: 1,
  });

  // Localized texts
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
      loginRequired:
        currentLanguage === "ar" ? "تسجيل الدخول مطلوب" : "Login Required",
      verificationRequired:
        currentLanguage === "ar"
          ? "التحقق من الهوية مطلوب"
          : "Identity Verification Required",
      bookingSuccess:
        currentLanguage === "ar"
          ? "تم إنشاء الحجز بنجاح!"
          : "Booking Created Successfully!",
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

  // Duration options based on rental type
  const getDurationOptions = useCallback(() => {
    if (formData.rentalType === "weekly") {
      return [
        {
          value: "1",
          label: currentLanguage === "ar" ? "أسبوع واحد" : "1 Week",
        },
        { value: "2", label: currentLanguage === "ar" ? "أسبوعين" : "2 Weeks" },
        {
          value: "3",
          label: currentLanguage === "ar" ? "3 أسابيع" : "3 Weeks",
        },
      ];
    } else if (formData.rentalType === "monthly") {
      return [
        {
          value: "1",
          label: currentLanguage === "ar" ? "شهر واحد" : "1 Month",
        },
        { value: "2", label: currentLanguage === "ar" ? "شهرين" : "2 Months" },
      ];
    }
    return [];
  }, [formData.rentalType, currentLanguage]);

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

  // Fetch car data from Supabase
  useEffect(() => {
    const fetchCarData = async () => {
      if (!id) {
        router.back();
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
          router.back();
          return;
        }

        // Transform the data structure
        const transformedCar: CarData = {
          car_id: carData.id,
          brand_name_ar: carData.car_models.car_brands.name_ar,
          brand_name_en: carData.car_models.car_brands.name_en,
          model_name_ar: carData.car_models.name_ar,
          model_name_en: carData.car_models.name_en,
          model_year: carData.car_models.year,
          main_image_url: carData.car_models.default_image_url || "",
          color_name_ar: carData.car_colors.name_ar,
          color_name_en: carData.car_colors.name_en,
          daily_price: carData.daily_price,
          weekly_price: carData.weekly_price,
          monthly_price: carData.monthly_price,
          seats: carData.seats,
          fuel_type: carData.fuel_type,
          transmission: carData.transmission,
          branch_id: carData.branch_id,
          branch_name_ar: carData.branches.name_ar,
          branch_name_en: carData.branches.name_en,
          is_new: carData.is_new,
          discount_percentage: carData.discount_percentage || 0,
          status: carData.status,
          additional_images: carData.additional_images || [],
          is_available: carData.status === "available",
          description_ar: carData.description_ar,
          features_ar: carData.features_ar || [],
          rental_types: carData.rental_types || ["daily"],
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
        router.back();
      } finally {
        setFetchingCar(false);
      }
    };

    fetchCarData();
  }, [id, router, currentLanguage, t.carNotFound]);

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

        // Get user profile
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

        // Check documents status
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

  // Calculate actual days between dates
  const actualDays = useMemo(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }
    return 1;
  }, [formData.startDate, formData.endDate]);

  // Filter available rental types based on car data
  const availableRentalTypes = useMemo(() => {
    if (!car?.rental_types) return [];
    return rentalTypeOptions.filter((option) =>
      car.rental_types.includes(option.value)
    );
  }, [car?.rental_types, rentalTypeOptions]);

  // Get tomorrow's date as minimum
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }, []);

  // Calculate pricing with best offer
  const calculatePricing = useCallback(async () => {
    if (car && formData.rentalType && actualDays > 0) {
      try {
        // Get best offer for this car and rental period
        const { data: offerData, error: offerError } = await supabase.rpc(
          "get_best_car_offer",
          {
            _car_id: car.car_id,
            _rental_days: actualDays,
            _rental_type: formData.rentalType,
          }
        );

        if (offerError) {
          console.error("Error getting best offer:", offerError);
          // Fallback to simple calculation
          const baseAmount = car.daily_price * actualDays;
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
        } else if (offerData && offerData.length > 0) {
          setBestOffer(offerData[0] as BestOffer);
        } else {
          // No offers, use regular price
          const baseAmount = car.daily_price * actualDays;
          setBestOffer({
            offer_source: "regular",
            offer_id: null,
            offer_name_ar: null,
            offer_name_en: null,
            discount_type: "none",
            discount_value: 0,
            original_price: baseAmount,
            discounted_price: baseAmount,
            savings_amount: 0,
          });
        }
      } catch (error) {
        console.error("Error calculating pricing:", error);
        setBestOffer(null);
      }
    }
  }, [car, formData.rentalType, actualDays]);

  // Calculate pricing when dependencies change
  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  // Handle date selection from calendar
  const handleDateSelect = useCallback((date: CalendarDate) => {
    setFormData((prev) => ({
      ...prev,
      startDate: date.dateString,
    }));
    // Close calendar after selection
    setShowCalendar(false);
  }, []);

  // Handle opening the calendar
  const handleOpenCalendar = useCallback(() => {
    setShowCalendar(true);
  }, []);

  // Handle closing the calendar
  const handleCloseCalendar = useCallback(() => {
    setShowCalendar(false);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!car || !bestOffer) return;

    setLoading(true);
    try {
      // Check if user is authenticated
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

      // Check user documents status before proceeding
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

      // Create booking using the atomic function
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
          p_initial_status: "payment_pending",
          p_notes: null,
        }
      );

      if (error) {
        // Handle specific error cases
        if (error.message.includes("Car not available")) {
          Alert.alert(
            currentLanguage === "ar"
              ? "السيارة غير متاحة"
              : "Car Not Available",
            currentLanguage === "ar"
              ? "عذراً، هذه السيارة غير متاحة للفترة المحددة"
              : "Sorry, this car is not available for the selected period"
          );
        } else if (error.message.includes("No availability")) {
          Alert.alert(
            currentLanguage === "ar"
              ? "لا توجد مقاعد متاحة"
              : "No Seats Available",
            currentLanguage === "ar"
              ? "عذراً، لا توجد مقاعد متاحة لهذه السيارة في الفترة المحددة"
              : "Sorry, no seats are available for this car in the selected period"
          );
        } else if (error.message.includes("Unauthenticated")) {
          Alert.alert(
            currentLanguage === "ar"
              ? "خطأ في المصادقة"
              : "Authentication Error",
            currentLanguage === "ar"
              ? "يرجى تسجيل الدخول مرة أخرى"
              : "Please login again"
          );
        } else {
          throw error;
        }
        return;
      }

      Alert.alert(
        t.bookingSuccess,
        currentLanguage === "ar"
          ? "سيتم التواصل معك قريباً لتأكيد الحجز"
          : "We will contact you soon to confirm the booking"
      );

      router.back();
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
    router,
    t.loginRequired,
    t.verificationRequired,
    t.bookingSuccess,
  ]);

  // Format selected date for display
  const formatDisplayDate = useCallback(
    (dateString: string) => {
      if (!dateString) return "";

      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      return date.toLocaleDateString(
        currentLanguage === "ar" ? "ar-SA" : "en-US",
        options
      );
    },
    [currentLanguage]
  );

  // Create styles using StyleSheet
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: responsive.safeAreaTop + 16,
    },
    scrollContainer: {
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      gap: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    backButton: {
      width: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      height: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: responsive.getFontSize(24, 22, 28),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      textAlign: isRTL ? "right" : "left",
    },
    subtitle: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
    },
    cardContainer: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    carImage: {
      width: "100%",
      height: responsive.getResponsiveValue(180, 200, 220, 240, 260),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    carTitle: {
      fontSize: responsive.getFontSize(18, 17, 21),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      textAlign: isRTL ? "right" : "left",
    },
    carSubtitle: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginBottom: responsive.getResponsiveValue(8, 12, 16, 18, 20),
      textAlign: isRTL ? "right" : "left",
    },
    badgeContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      flexWrap: "wrap",
      gap: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      marginBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    carInfoGrid: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    carInfoItem: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    carInfoText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Regular,
      color: colors.text,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    priceRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    priceLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
    },
    priceValue: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.SemiBold || fonts.Regular,
      color: colors.text,
    },
    totalRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    totalLabel: {
      fontSize: responsive.getFontSize(16, 15, 19),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
    },
    totalValue: {
      fontSize: responsive.getFontSize(16, 15, 19),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.primary,
    },
    savingsText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.success,
      textAlign: isRTL ? "right" : "left",
      marginTop: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    formSection: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    formLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      textAlign: isRTL ? "right" : "left",
    },
    dateButton: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: formData.startDate ? colors.primary : colors.border,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      padding: responsive.getResponsiveValue(14, 16, 18, 20, 22),
      minHeight: responsive.getInputHeight(),
    },
    dateButtonText: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Regular,
      color: formData.startDate ? colors.text : colors.textSecondary,
      flex: 1,
      textAlign: isRTL ? "right" : "left",
    },
    dateButtonPlaceholder: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Regular,
      color: colors.textMuted,
      flex: 1,
      textAlign: isRTL ? "right" : "left",
    },
    dateButtonIcon: {
      marginLeft: isRTL ? 0 : responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginRight: isRTL ? responsive.getResponsiveValue(8, 10, 12, 14, 16) : 0,
    },
    userInfo: {
      backgroundColor: colors.backgroundSecondary,
      padding: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    userInfoTitle: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Medium || fonts.SemiBold || fonts.Regular,
      color: colors.textSecondary,
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      textAlign: isRTL ? "right" : "left",
    },
    userInfoRow: {
      marginBottom: responsive.getResponsiveValue(2, 3, 4, 5, 6),
    },
    userInfoText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
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
  });

  // Loading state
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

  // Car not found state
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
            onPress={() => router.back()}
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
              color={colors.text}
            />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>
        </View>

        {/* Car Details Card */}
        <Card style={styles.cardContainer}>
          <Card.Header>
            <Card.Title size="md">{t.carDetails}</Card.Title>
          </Card.Header>
          <Card.Content>
            <Image
              source={{ uri: car.main_image_url }}
              style={styles.carImage}
              resizeMode="cover"
            />

            <Text style={styles.carTitle}>
              {currentLanguage === "ar"
                ? `${car.brand_name_ar} ${car.model_name_ar} ${car.model_year}`
                : `${car.brand_name_en} ${car.model_name_en} ${car.model_year}`}
            </Text>
            <Text style={styles.carSubtitle}>
              {currentLanguage === "ar" ? car.color_name_ar : car.color_name_en}
            </Text>

            <View style={styles.badgeContainer}>
              {car.is_new && (
                <Badge variant="secondary" size="sm">
                  {t.new}
                </Badge>
              )}
              {car.discount_percentage > 0 && (
                <Badge variant="destructive" size="sm">
                  {currentLanguage === "ar"
                    ? `خصم ${car.discount_percentage}%`
                    : `${car.discount_percentage}% Off`}
                </Badge>
              )}
            </View>

            <View style={styles.carInfoGrid}>
              <View style={styles.carInfoItem}>
                <Ionicons
                  name="location"
                  size={responsive.getIconSize("small")}
                  color={colors.textSecondary}
                />
                <Text style={styles.carInfoText}>
                  {currentLanguage === "ar"
                    ? car.branch_name_ar
                    : car.branch_name_en}
                </Text>
              </View>
              <View style={styles.carInfoItem}>
                <Ionicons
                  name="people"
                  size={responsive.getIconSize("small")}
                  color={colors.textSecondary}
                />
                <Text style={styles.carInfoText}>
                  {car.seats} {t.seats}
                </Text>
              </View>
            </View>

            <View style={styles.separator} />

            {/* Pricing */}
            {bestOffer && (
              <>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{t.dailyPrice}</Text>
                  <Text style={styles.priceValue}>
                    {car.daily_price} {t.riyal}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{t.numberOfDays}</Text>
                  <Text style={styles.priceValue}>
                    {actualDays} {t.days}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{t.originalPrice}</Text>
                  <Text style={styles.priceValue}>
                    {bestOffer.original_price.toFixed(2)} {t.riyal}
                  </Text>
                </View>

                {bestOffer.savings_amount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: colors.error }]}>
                      {bestOffer.offer_source === "car_offer" &&
                      bestOffer.offer_name_ar
                        ? `${currentLanguage === "ar" ? "عرض:" : "Offer:"} ${
                            currentLanguage === "ar"
                              ? bestOffer.offer_name_ar
                              : bestOffer.offer_name_en
                          }`
                        : `${
                            currentLanguage === "ar" ? "الخصم" : "Discount"
                          } (${bestOffer.discount_value}${
                            bestOffer.discount_type === "percentage"
                              ? "%"
                              : ` ${t.riyal}`
                          })`}
                      :
                    </Text>
                    <Text style={[styles.priceValue, { color: colors.error }]}>
                      -{bestOffer.savings_amount.toFixed(2)} {t.riyal}
                    </Text>
                  </View>
                )}

                <View style={styles.separator} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t.totalAmount}</Text>
                  <Text style={styles.totalValue}>
                    {bestOffer.discounted_price.toFixed(2)} {t.riyal}
                  </Text>
                </View>

                {bestOffer.savings_amount > 0 && (
                  <Text style={styles.savingsText}>
                    {t.saved} {bestOffer.savings_amount.toFixed(2)} {t.riyal}
                  </Text>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Booking Form Card */}
        <Card style={{ marginBottom: responsive.safeAreaBottom + 20 }}>
          <Card.Header>
            <Card.Title size="md">{t.bookingData}</Card.Title>
          </Card.Header>
          <Card.Content>
            {/* Rental Type */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>{t.rentalType}</Text>
              <Select
                value={formData.rentalType}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    rentalType: value as "daily" | "weekly" | "monthly",
                    duration: value === "daily" ? 1 : 1,
                  }));
                }}
              >
                <Select.Trigger placeholder={t.selectRentalType} />
                <Select.Content>
                  {availableRentalTypes.map((type) => (
                    <Select.Item key={type.value} value={type.value}>
                      {type.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </View>

            {/* Duration Selection */}
            {formData.rentalType !== "daily" && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>{t.duration}</Text>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      duration: parseInt(value),
                    }));
                  }}
                >
                  <Select.Trigger
                    placeholder={
                      formData.rentalType === "weekly"
                        ? t.selectWeeks
                        : t.selectMonths
                    }
                  />
                  <Select.Content>
                    {getDurationOptions().map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </View>
            )}

            {/* Start Date - Enhanced Date Button */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>
                {formData.rentalType === "daily" ? t.rentalDate : t.startDate}
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={handleOpenCalendar}
                activeOpacity={0.7}
              >
                {formData.startDate ? (
                  <Text style={styles.dateButtonText}>
                    {formatDisplayDate(formData.startDate)}
                  </Text>
                ) : (
                  <Text style={styles.dateButtonPlaceholder}>
                    {t.tapToSelectDate}
                  </Text>
                )}
                <View style={styles.dateButtonIcon}>
                  <Ionicons
                    name="calendar"
                    size={responsive.getIconSize("small")}
                    color={
                      formData.startDate ? colors.primary : colors.textSecondary
                    }
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* User Info Display */}
            {userProfile && (
              <View style={styles.userInfo}>
                <Text style={styles.userInfoTitle}>{t.customerInfo}</Text>
                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoText}>
                    <Text
                      style={{ fontFamily: fonts.Medium || fonts.SemiBold }}
                    >
                      {t.name}
                    </Text>{" "}
                    {userProfile.full_name}
                  </Text>
                </View>
                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoText}>
                    <Text
                      style={{ fontFamily: fonts.Medium || fonts.SemiBold }}
                    >
                      {t.email}
                    </Text>{" "}
                    {userProfile.email}
                  </Text>
                </View>
                {userProfile.phone && (
                  <View style={styles.userInfoRow}>
                    <Text style={styles.userInfoText}>
                      <Text
                        style={{ fontFamily: fonts.Medium || fonts.SemiBold }}
                      >
                        {t.phone}
                      </Text>{" "}
                      {userProfile.phone}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Submit Button */}
            <CustomButton
              title={
                loading
                  ? t.processing
                  : `${t.confirmBooking} - ${
                      bestOffer ? bestOffer.discounted_price.toFixed(2) : "0"
                    } ${t.riyal}`
              }
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !bestOffer || !formData.startDate}
              bgVariant="primary"
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Calendar Modal - Only shows when showCalendar is true */}
      {showCalendar && (
        <CustomCalendar
          visible={showCalendar}
          onClose={handleCloseCalendar}
          onDateSelect={handleDateSelect}
          minDate={minDate}
          rentalType={formData.rentalType}
          duration={formData.duration}
          showRentalOptions={false}
        />
      )}
    </View>
  );
};

export default BookingScreen;
