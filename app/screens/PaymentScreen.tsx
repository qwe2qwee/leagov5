// PaymentScreen.tsx - Complete Implementation
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Separator } from "@/components/ui/Separator";
import { useBookingDetails } from "@/hooks/booking/useUserBookings";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ==========================================
// CONFIGURATION
// ==========================================
const SUPABASE_FUNCTIONS_URL =
  "https://tqkxijjmpqsvdnmcmzhj.supabase.co/functions/v1";
const MOYASAR_PUBLISHABLE_KEY =
  "pk_test_iCcpYKAVDAYtms1N33EX2KZ2C5ijdxdYorRtWhS5"; // ⚠️ استبدل بمفتاحك
const POLLING_INTERVAL = 3000; // 3 ثواني
const MAX_POLLING_ATTEMPTS = 40; // 40 × 3 = 120 ثانية

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function PaymentScreen() {
  // ==========================================
  // HOOKS & PARAMS
  // ==========================================
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { showSuccess, showError, showWarning } = useToast();

  const bookingId = params.bookingId as string;
  const { data: booking, isLoading: isLoadingBooking } =
    useBookingDetails(bookingId);

  // ==========================================
  // STATE
  // ==========================================
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingMessage, setPollingMessage] = useState("");

  const paymentIdempotencyRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);

  // Form Fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==========================================
  // TRANSLATIONS
  // ==========================================
  const t = {
    title: currentLanguage === "ar" ? "إتمام الدفع" : "Complete Payment",
    bookingSummary: currentLanguage === "ar" ? "ملخص الحجز" : "Booking Summary",
    total: currentLanguage === "ar" ? "المجموع" : "Total",
    discount: currentLanguage === "ar" ? "الخصم" : "Discount",
    finalAmount: currentLanguage === "ar" ? "المبلغ الإجمالي" : "Final Amount",
    days: currentLanguage === "ar" ? "يوم" : "days",
    sar: currentLanguage === "ar" ? "ر.س" : "SAR",
    acceptedCards:
      currentLanguage === "ar" ? "البطاقات المقبولة:" : "Accepted Cards:",
    cardDetails: currentLanguage === "ar" ? "بيانات البطاقة" : "Card Details",
    cardNumber: currentLanguage === "ar" ? "رقم البطاقة" : "Card Number",
    cardName: currentLanguage === "ar" ? "الاسم على البطاقة" : "Name on Card",
    expiryDate: currentLanguage === "ar" ? "تاريخ الانتهاء" : "Expiry Date",
    securityNote:
      currentLanguage === "ar"
        ? "جميع البيانات مشفرة وآمنة"
        : "All data is encrypted",
    pay: currentLanguage === "ar" ? "ادفع" : "Pay",
    securityInfo:
      currentLanguage === "ar"
        ? "بيانات بطاقتك محمية بالكامل"
        : "Your card data is protected",
    noServerPass:
      currentLanguage === "ar"
        ? "بياناتك لا تمر عبر خوادمنا"
        : "Your data doesn't pass through our servers",
    invalidData:
      currentLanguage === "ar"
        ? "يرجى التحقق من البيانات"
        : "Please check data",
    cardNumberError:
      currentLanguage === "ar"
        ? "رقم البطاقة يجب أن يكون 16-19 رقم"
        : "Card must be 16-19 digits",
    cardNameError:
      currentLanguage === "ar"
        ? "يرجى إدخال الاسم الكامل (كلمتين على الأقل)"
        : "Enter full name (min 2 words)",
    invalidMonth:
      currentLanguage === "ar" ? "شهر غير صحيح (1-12)" : "Invalid month (1-12)",
    expiredYear: currentLanguage === "ar" ? "سنة منتهية" : "Expired year",
    cvvError:
      currentLanguage === "ar"
        ? "CVV يجب أن يكون 3-4 أرقام"
        : "CVV must be 3-4 digits",
    paymentError:
      currentLanguage === "ar" ? "حدث خطأ أثناء الدفع" : "Payment error",
    bookingConfirmed:
      currentLanguage === "ar" ? "تم تأكيد حجزك!" : "Booking confirmed!",
    cannotPay: currentLanguage === "ar" ? "لا يمكن إتمام الدفع" : "Cannot pay",
    back: currentLanguage === "ar" ? "العودة" : "Back",
    opening3DS:
      currentLanguage === "ar"
        ? "جاري فتح صفحة التحقق..."
        : "Opening verification...",
    complete3DS:
      currentLanguage === "ar"
        ? "يرجى إكمال التحقق في المتصفح"
        : "Complete verification in browser",
    checkingPayment:
      currentLanguage === "ar"
        ? "جاري التحقق من الدفع..."
        : "Checking payment...",
    creatingToken:
      currentLanguage === "ar" ? "جاري تأمين البيانات..." : "Securing data...",
    tokenError:
      currentLanguage === "ar"
        ? "خطأ في تأمين البيانات"
        : "Token creation error",
  };

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Card Number
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (
      !cleanedCardNumber ||
      cleanedCardNumber.length < 16 ||
      cleanedCardNumber.length > 19
    ) {
      newErrors.cardNumber = t.cardNumberError;
    }

    // Card Name
    const trimmedName = cardName.trim();
    if (!trimmedName || trimmedName.split(/\s+/).length < 2) {
      newErrors.cardName = t.cardNameError;
    }

    // Expiry Month
    const month = parseInt(expiryMonth);
    if (!expiryMonth || month < 1 || month > 12) {
      newErrors.expiryMonth = t.invalidMonth;
    }

    // Expiry Year
    const fullYear = parseInt("20" + expiryYear);
    const currentYear = new Date().getFullYear();
    if (!expiryYear || fullYear < currentYear) {
      newErrors.expiryYear = t.expiredYear;
    }

    // CVV
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = t.cvvError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetPaymentState = () => {
    setIsProcessing(false);
    setIsPolling(false);
    setIsCreatingToken(false);
    pollingAttemptsRef.current = 0;
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // ==========================================
  // MOYASAR TOKEN CREATION (Frontend)
  // ==========================================
  const createTokenFromMoyasar = async () => {
    setIsCreatingToken(true);
    try {
      console.log("🔐 Creating token from Moyasar...");

      const tokenData = {
        publishable_api_key: MOYASAR_PUBLISHABLE_KEY,
        save_only: true,
        name: cardName.trim(),
        number: cardNumber.replace(/\s/g, ""),
        cvc: cvv,
        month: parseInt(expiryMonth),
        year: parseInt("20" + expiryYear),
      };

      const response = await fetch("https://api.moyasar.com/v1/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tokenData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Token creation failed:", result);
        throw new Error(result.message || t.tokenError);
      }

      console.log("✅ Token created:", result.id);
      return result.id;
    } catch (error: any) {
      console.error("Token creation error:", error);
      throw new Error(error.message || t.tokenError);
    } finally {
      setIsCreatingToken(false);
    }
  };

  // ==========================================
  // PAYMENT CREATION (Backend)
  // ==========================================
  const createPaymentViaEdgeFunction = async (token: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("UNAUTHORIZED");

      if (!paymentIdempotencyRef.current) {
        paymentIdempotencyRef.current = generateUUID();
      }

      console.log("💳 Sending token to backend...");

      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bookingId,
          token: token,
          idempotencyKey: paymentIdempotencyRef.current,
        }),
      });

      const result = await response.json();
      return { response: { status: response.status }, result };
    } catch (error) {
      console.error("Edge Function Error:", error);
      throw error;
    }
  };

  // ==========================================
  // PAYMENT STATUS CHECK
  // ==========================================
  const checkPaymentStatusViaEdgeFunction = async (paymentId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("UNAUTHORIZED");

      const response = await fetch(
        `${SUPABASE_FUNCTIONS_URL}/check-payment-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ paymentId, bookingId }),
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Check Payment Error:", error);
      throw error;
    }
  };

  // ==========================================
  // POLLING FOR 3DS
  // ==========================================
  const startPolling = (paymentId: string) => {
    console.log("🔄 Starting payment polling...");
    setIsPolling(true);
    pollingAttemptsRef.current = 0;

    pollingIntervalRef.current = setInterval(async () => {
      pollingAttemptsRef.current += 1;
      console.log(
        `🔍 Polling attempt ${pollingAttemptsRef.current}/${MAX_POLLING_ATTEMPTS}`
      );

      setPollingMessage(
        currentLanguage === "ar"
          ? `جاري التحقق... (${pollingAttemptsRef.current}/${MAX_POLLING_ATTEMPTS})`
          : `Checking... (${pollingAttemptsRef.current}/${MAX_POLLING_ATTEMPTS})`
      );

      try {
        const result = await checkPaymentStatusViaEdgeFunction(paymentId);

        if (result.success && result.status === "paid") {
          console.log("✅ Payment completed!");
          resetPaymentState();
          await handleSuccessfulPayment();
          return;
        } else if (!result.success || result.status === "failed") {
          console.log("❌ Payment failed");
          resetPaymentState();
          showError(result.message || t.paymentError);
          return;
        }

        if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
          console.log("⏱️ Polling timeout");
          resetPaymentState();
          showWarning(
            currentLanguage === "ar"
              ? "انتهى وقت الانتظار. يرجى التحقق من حالة الحجز لاحقاً"
              : "Timeout. Please check booking status later"
          );
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, POLLING_INTERVAL);
  };

  // ==========================================
  // MAIN PAYMENT HANDLER
  // ==========================================
  const handlePayment = async () => {
    if (!validateForm()) {
      showError(t.invalidData);
      return;
    }

    if (!booking) {
      showError(t.cannotPay);
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create Token from Moyasar
      const token = await createTokenFromMoyasar();

      // Step 2: Send Token to Backend
      const { response, result } = await createPaymentViaEdgeFunction(token);

      if (response.status === 200 && result.success) {
        if (result.status === "paid") {
          // Payment succeeded immediately
          console.log("✅ Payment completed immediately");
          await handleSuccessfulPayment();
        } else if (result.status === "initiated") {
          // 3DS required
          console.log("🔐 3DS required, opening browser...");
          setPollingMessage(t.opening3DS);

          const canOpen = await Linking.canOpenURL(result.transactionUrl);
          if (canOpen) {
            await Linking.openURL(result.transactionUrl);
            showWarning(t.complete3DS);
            startPolling(result.paymentId);
          } else {
            resetPaymentState();
            showError("Cannot open browser");
          }
        }
      } else {
        resetPaymentState();
        showError(result.error || result.message || t.paymentError);
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      resetPaymentState();
      showError(error.message || t.paymentError);
    } finally {
      if (!isPolling) {
        setIsProcessing(false);
      }
    }
  };

  // ==========================================
  // SUCCESS HANDLER
  // ==========================================
  const handleSuccessfulPayment = async () => {
    try {
      showSuccess(t.bookingConfirmed);
      router.replace({
        pathname: `/screens/BookingDetailsScreen`,
        params: { bookingId: bookingId },
      });
    } catch (error) {
      console.error("Success handler error:", error);
    }
  };

  // ==========================================
  // STYLES
  // ==========================================
  const createStyles = () =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background },
      centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      },
      header: {
        backgroundColor: colors.primary,
        paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
        paddingTop:
          responsive.safeAreaTop +
          responsive.getResponsiveValue(12, 16, 20, 24, 28),
        paddingBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
        alignItems: "center",
      },
      headerTitle: {
        fontSize: responsive.getFontSize(20, 18, 24),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.textInverse,
      },
      scrollContent: {
        paddingBottom: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      },
      section: {
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      },
      sectionTitle: {
        fontSize: responsive.getFontSize(17, 16, 20),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.text,
        marginBottom: responsive.getResponsiveValue(12, 16, 20, 22, 24),
        textAlign: isRTL ? "right" : "left",
      },
      carInfo: {
        flexDirection: isRTL ? "row-reverse" : "row",
        marginBottom: responsive.getResponsiveValue(12, 16, 20, 22, 24),
      },
      carImage: {
        width: responsive.getResponsiveValue(70, 80, 90, 100, 110),
        height: responsive.getResponsiveValue(70, 80, 90, 100, 110),
        borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      },
      carDetails: {
        flex: 1,
        marginLeft: isRTL
          ? 0
          : responsive.getResponsiveValue(10, 12, 16, 18, 20),
        marginRight: isRTL
          ? responsive.getResponsiveValue(10, 12, 16, 18, 20)
          : 0,
        justifyContent: "center",
      },
      carName: {
        fontSize: responsive.getFontSize(15, 14, 17),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.text,
        marginBottom: responsive.getResponsiveValue(3, 4, 5, 6, 7),
        textAlign: isRTL ? "right" : "left",
      },
      carDate: {
        fontSize: responsive.getFontSize(13, 12, 15),
        fontFamily: fonts.Regular,
        color: colors.textSecondary,
        marginBottom: responsive.getResponsiveValue(2, 3, 4, 5, 6),
        textAlign: isRTL ? "right" : "left",
      },
      carDays: {
        fontSize: responsive.getFontSize(13, 12, 15),
        fontFamily: fonts.Regular,
        color: colors.textSecondary,
        textAlign: isRTL ? "right" : "left",
      },
      priceRow: {
        flexDirection: isRTL ? "row-reverse" : "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      },
      priceLabel: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.Regular,
        color: colors.textSecondary,
      },
      priceValue: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.SemiBold || fonts.Medium,
        color: colors.text,
      },
      totalRow: {
        flexDirection: isRTL ? "row-reverse" : "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: responsive.getResponsiveValue(12, 16, 20, 22, 24),
        marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
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
      acceptedCardsTitle: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.Medium || fonts.Regular,
        color: colors.textSecondary,
        marginBottom: responsive.getResponsiveValue(10, 12, 14, 16, 18),
        textAlign: isRTL ? "right" : "left",
      },
      cardLogos: {
        flexDirection: isRTL ? "row-reverse" : "row",
        justifyContent: "flex-start",
        gap: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      },
      cardLogo: {
        borderWidth: 1,
        borderColor: colors.primary,
        paddingHorizontal: responsive.getResponsiveValue(10, 12, 14, 16, 18),
        paddingVertical: responsive.getResponsiveValue(5, 6, 8, 10, 12),
        borderRadius: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      },
      cardLogoText: {
        fontSize: responsive.getFontSize(11, 10, 13),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.primary,
      },
      inputContainer: {
        marginBottom: responsive.getResponsiveValue(14, 16, 20, 22, 24),
      },
      inputLabel: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.SemiBold || fonts.Medium,
        marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
        textAlign: isRTL ? "right" : "left",
        color: colors.text,
      },
      input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        padding: responsive.getResponsiveValue(10, 12, 14, 16, 18),
        fontSize: responsive.getFontSize(15, 14, 17),
        fontFamily: fonts.Regular,
        backgroundColor: colors.backgroundSecondary,
        color: colors.text,
        height: responsive.getInputHeight(),
      },
      inputError: { borderColor: colors.error, borderWidth: 1.5 },
      errorText: {
        fontSize: responsive.getFontSize(12, 11, 14),
        fontFamily: fonts.Regular,
        color: colors.error,
        marginTop: responsive.getResponsiveValue(4, 5, 6, 7, 8),
        textAlign: isRTL ? "right" : "left",
      },
      row: {
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      },
      expiryRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      expiryInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        padding: responsive.getResponsiveValue(10, 12, 14, 16, 18),
        fontSize: responsive.getFontSize(15, 14, 17),
        fontFamily: fonts.Regular,
        backgroundColor: colors.backgroundSecondary,
        color: colors.text,
        width: responsive.getResponsiveValue(55, 60, 65, 70, 75),
        textAlign: "center",
      },
      slash: {
        fontSize: responsive.getFontSize(18, 17, 20),
        fontFamily: fonts.Bold,
        marginHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
        color: colors.textSecondary,
      },
      securityNote: {
        fontSize: responsive.getFontSize(12, 11, 14),
        fontFamily: fonts.Medium || fonts.Regular,
        color: colors.success,
        textAlign: "center",
        marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      },
      securityInfo: {
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        padding: responsive.getResponsiveValue(14, 16, 20, 22, 24),
        backgroundColor: colors.success + "15",
        borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        borderWidth: 1,
        borderColor: colors.success,
      },
      securityInfoText: {
        fontSize: responsive.getFontSize(12, 11, 14),
        fontFamily: fonts.Regular,
        color: colors.success,
        textAlign: "center",
        lineHeight: responsive.getFontSize(12, 11, 14) * 1.5,
      },
      pollingContainer: {
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        padding: responsive.getResponsiveValue(14, 16, 20, 22, 24),
        backgroundColor: colors.primary + "15",
        borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: "center",
      },
      pollingText: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.Medium,
        color: colors.primary,
        marginTop: 10,
      },
    });

  const styles = createStyles();

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (isLoadingBooking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (!booking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{t.cannotPay}</Text>
        <CustomButton
          title={t.back}
          bgVariant="primary"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const carName = `${booking.car?.model?.brand?.name_ar || ""} ${
    booking.car?.model?.name_ar || ""
  }`.trim();

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.title}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==========================================
            BOOKING SUMMARY
            ========================================== */}
        <View style={styles.section}>
          <Card type="default">
            <Card.Content>
              <Text style={styles.sectionTitle}>{t.bookingSummary}</Text>

              <View style={styles.carInfo}>
                <Image
                  source={{ uri: booking.car?.model?.default_image_url }}
                  style={styles.carImage}
                  resizeMode="cover"
                />
                <View style={styles.carDetails}>
                  <Text style={styles.carName}>{carName}</Text>
                  <Text style={styles.carDate}>
                    {booking.start_date} - {booking.end_date}
                  </Text>
                  <Text style={styles.carDays}>
                    {booking.total_days} {t.days}
                  </Text>
                </View>
              </View>

              <Separator />

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t.total}</Text>
                <Text style={styles.priceValue}>
                  {booking.total_amount} {t.sar}
                </Text>
              </View>

              {booking.discount_amount > 0 && (
                <>
                  <Separator />
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{t.discount}</Text>
                    <Text
                      style={[styles.priceValue, { color: colors.success }]}
                    >
                      -{booking.discount_amount} {t.sar}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t.finalAmount}</Text>
                <Text style={styles.totalValue}>
                  {booking.final_amount} {t.sar}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* ==========================================
            ACCEPTED CARDS
            ========================================== */}
        <View style={styles.section}>
          <Card type="default">
            <Card.Content>
              <Text style={styles.acceptedCardsTitle}>{t.acceptedCards}</Text>
              <View style={styles.cardLogos}>
                <View style={styles.cardLogo}>
                  <Text style={styles.cardLogoText}>مدى</Text>
                </View>
                <View style={styles.cardLogo}>
                  <Text style={styles.cardLogoText}>VISA</Text>
                </View>
                <View style={styles.cardLogo}>
                  <Text style={styles.cardLogoText}>Mastercard</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* ==========================================
            CARD DETAILS FORM
            ========================================== */}
        <View style={styles.section}>
          <Card type="default">
            <Card.Content>
              <Text style={styles.sectionTitle}>{t.cardDetails}</Text>

              {/* Card Number */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t.cardNumber}</Text>
                <TextInput
                  style={[styles.input, errors.cardNumber && styles.inputError]}
                  value={cardNumber}
                  onChangeText={(text) => {
                    setCardNumber(formatCardNumber(text.replace(/[^\d]/g, "")));
                    if (errors.cardNumber)
                      setErrors({ ...errors, cardNumber: "" });
                  }}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="number-pad"
                  maxLength={19}
                  textAlign="left"
                  placeholderTextColor={colors.textMuted}
                  editable={!isProcessing && !isPolling && !isCreatingToken}
                />
                {errors.cardNumber && (
                  <Text style={styles.errorText}>{errors.cardNumber}</Text>
                )}
              </View>

              {/* Card Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t.cardName}</Text>
                <TextInput
                  style={[styles.input, errors.cardName && styles.inputError]}
                  value={cardName}
                  onChangeText={(text) => {
                    setCardName(text);
                    if (errors.cardName) setErrors({ ...errors, cardName: "" });
                  }}
                  placeholder="AHMED MOHAMMED"
                  autoCapitalize="characters"
                  textAlign="left"
                  placeholderTextColor={colors.textMuted}
                  editable={!isProcessing && !isPolling && !isCreatingToken}
                />
                {errors.cardName && (
                  <Text style={styles.errorText}>{errors.cardName}</Text>
                )}
              </View>

              {/* Expiry Date & CVV */}
              <View style={styles.row}>
                {/* Expiry Date */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{t.expiryDate}</Text>
                  <View style={styles.expiryRow}>
                    <TextInput
                      style={[
                        styles.expiryInput,
                        errors.expiryMonth && styles.inputError,
                      ]}
                      value={expiryMonth}
                      onChangeText={(text) => {
                        setExpiryMonth(
                          text.replace(/[^\d]/g, "").substring(0, 2)
                        );
                        if (errors.expiryMonth)
                          setErrors({ ...errors, expiryMonth: "" });
                      }}
                      placeholder="MM"
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholderTextColor={colors.textMuted}
                      editable={!isProcessing && !isPolling && !isCreatingToken}
                    />
                    <Text style={styles.slash}>/</Text>
                    <TextInput
                      style={[
                        styles.expiryInput,
                        errors.expiryYear && styles.inputError,
                      ]}
                      value={expiryYear}
                      onChangeText={(text) => {
                        setExpiryYear(
                          text.replace(/[^\d]/g, "").substring(0, 2)
                        );
                        if (errors.expiryYear)
                          setErrors({ ...errors, expiryYear: "" });
                      }}
                      placeholder="YY"
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholderTextColor={colors.textMuted}
                      editable={!isProcessing && !isPolling && !isCreatingToken}
                    />
                  </View>
                  {(errors.expiryMonth || errors.expiryYear) && (
                    <Text style={styles.errorText}>
                      {errors.expiryMonth || errors.expiryYear}
                    </Text>
                  )}
                </View>

                {/* CVV */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={[styles.input, errors.cvv && styles.inputError]}
                    value={cvv}
                    onChangeText={(text) => {
                      setCvv(text.replace(/[^\d]/g, "").substring(0, 4));
                      if (errors.cvv) setErrors({ ...errors, cvv: "" });
                    }}
                    placeholder="123"
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    textAlign="center"
                    placeholderTextColor={colors.textMuted}
                    editable={!isProcessing && !isPolling && !isCreatingToken}
                  />
                  {errors.cvv && (
                    <Text style={styles.errorText}>{errors.cvv}</Text>
                  )}
                </View>
              </View>

              <Text style={styles.securityNote}>{t.securityNote}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* ==========================================
            PAY BUTTON
            ========================================== */}
        <View style={styles.section}>
          <CustomButton
            title={
              isCreatingToken
                ? t.creatingToken
                : `${t.pay} ${booking.final_amount} ${t.sar}`
            }
            bgVariant="success"
            onPress={handlePayment}
            loading={isProcessing || isPolling || isCreatingToken}
            disabled={isProcessing || isPolling || isCreatingToken}
          />
        </View>

        {/* ==========================================
            POLLING INDICATOR
            ========================================== */}
        {isPolling && (
          <View style={styles.pollingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.pollingText}>{pollingMessage}</Text>
          </View>
        )}

        {/* ==========================================
            SECURITY INFO
            ========================================== */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityInfoText}>{t.securityInfo}</Text>
          <Text style={[styles.securityInfoText, { marginTop: 5 }]}>
            {t.noServerPass}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
