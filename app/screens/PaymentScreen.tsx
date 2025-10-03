// PaymentScreen.tsx - With In-App WebView for 3DS
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Separator } from "@/components/ui/Separator";
import {
  useBookingDetails,
  useBookingTimer,
  usePayment,
} from "@/hooks/booking/useUserBookings";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

// ==========================================
// CONFIGURATION
// ==========================================
const MOYASAR_PUBLISHABLE_KEY =
  "pk_test_iCcpYKAVDAYtms1N33EX2KZ2C5ijdxdYorRtWhS5";
const POLLING_INTERVAL = 3000; // 3 ثواني
const MAX_POLLING_ATTEMPTS = 40; // 120 ثانية

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
  const {
    createPayment,
    checkPaymentStatus,
    isLoading: isPaymentLoading,
  } = usePayment();
  const { timeLeft, formattedTime, isExpired } = useBookingTimer(
    booking?.expires_at
  );

  // ==========================================
  // STATE
  // ==========================================
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // WebView State
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState("");
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);

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
    creatingToken:
      currentLanguage === "ar" ? "جاري تأمين البيانات..." : "Securing data...",
    tokenError:
      currentLanguage === "ar"
        ? "خطأ في تأمين البيانات"
        : "Token creation error",
    pendingApproval:
      currentLanguage === "ar"
        ? "الحجز في انتظار موافقة الفرع. لا يمكن الدفع حالياً"
        : "Booking pending branch approval",
    invalidStatus:
      currentLanguage === "ar"
        ? "لا يمكن الدفع للحجز بحالة:"
        : "Cannot pay for booking in status:",
    bookingExpired:
      currentLanguage === "ar" ? "انتهت صلاحية الحجز" : "Booking expired",
    timeLeftToPay:
      currentLanguage === "ar" ? "الوقت المتبقي للدفع:" : "Time left to pay:",
    paymentTimeout:
      currentLanguage === "ar" ? "وقت إتمام الدفع:" : "Payment timeout:",
    hurryUp:
      currentLanguage === "ar" ? "يرجى الإسراع في الدفع!" : "Please hurry!",
    awaitingApproval:
      currentLanguage === "ar"
        ? "الحجز في انتظار موافقة الفرع. سيتم إشعارك عند الموافقة"
        : "Booking pending approval",
    approvedPayNow:
      currentLanguage === "ar"
        ? "تمت موافقة الفرع. يرجى إتمام الدفع"
        : "Approved. Please complete payment",
    processingPayment:
      currentLanguage === "ar"
        ? "جاري معالجة الدفع..."
        : "Payment processing...",
    verifyingPayment:
      currentLanguage === "ar" ? "إتمام التحقق من الدفع" : "Verifying Payment",
    completeVerification:
      currentLanguage === "ar"
        ? "يرجى إتمام التحقق أدناه"
        : "Please complete verification below",
    closeWebView: currentLanguage === "ar" ? "إغلاق" : "Close",
    checkingPayment:
      currentLanguage === "ar"
        ? "جاري التحقق من الدفع..."
        : "Checking payment...",
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

    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (
      !cleanedCardNumber ||
      cleanedCardNumber.length < 16 ||
      cleanedCardNumber.length > 19
    ) {
      newErrors.cardNumber = t.cardNumberError;
    }

    const trimmedName = cardName.trim();
    if (!trimmedName || trimmedName.split(/\s+/).length < 2) {
      newErrors.cardName = t.cardNameError;
    }

    const month = parseInt(expiryMonth);
    if (!expiryMonth || month < 1 || month > 12) {
      newErrors.expiryMonth = t.invalidMonth;
    }

    const fullYear = parseInt("20" + expiryYear);
    const currentYear = new Date().getFullYear();
    if (!expiryYear || fullYear < currentYear) {
      newErrors.expiryYear = t.expiredYear;
    }

    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = t.cvvError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // MOYASAR TOKEN CREATION
  // ==========================================
  const createTokenFromMoyasar = async () => {
    setIsCreatingToken(true);
    try {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokenData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t.tokenError);
      }

      return result.id;
    } catch (error: any) {
      throw new Error(error.message || t.tokenError);
    } finally {
      setIsCreatingToken(false);
    }
  };

  // ==========================================
  // POLLING FOR PAYMENT STATUS
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

      try {
        const result = await checkPaymentStatus(paymentId, bookingId);

        if (result?.success && result.status === "paid") {
          console.log("✅ Payment completed!");
          stopPolling();
          setShowWebView(false);
          handleSuccessfulPayment();
          return;
        } else if (!result?.success || result?.status === "failed") {
          console.log("❌ Payment failed");
          stopPolling();
          setShowWebView(false);
          showError(result?.message || t.paymentError);
          return;
        }

        if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
          console.log("⏱️ Polling timeout");
          stopPolling();
          setShowWebView(false);
          showWarning(
            currentLanguage === "ar"
              ? "انتهى وقت الانتظار. يرجى التحقق من حالة الحجز"
              : "Timeout. Check booking status"
          );
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, POLLING_INTERVAL);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    pollingAttemptsRef.current = 0;
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

    if (booking.status === "pending") {
      showError(t.pendingApproval);
      return;
    }

    if (!["confirmed", "payment_pending"].includes(booking.status)) {
      showError(`${t.invalidStatus} ${booking.status}`);
      return;
    }

    if (isExpired) {
      showError(t.bookingExpired);
      router.back();
      return;
    }

    try {
      const token = await createTokenFromMoyasar();

      const result = await createPayment(bookingId, token, {
        onSuccess: async (result) => {
          if (result.status === "paid") {
            handleSuccessfulPayment();
          }
        },
        on3DSRequired: (url) => {
          // بدلاً من فتح متصفح خارجي، نفتح WebView
          console.log("🔐 3DS required, opening WebView...");
          setWebViewUrl(url);
          setShowWebView(true);
        },
        onError: (error) => {
          showError(error.message || t.paymentError);
        },
      });

      // إذا كان فيه paymentId، نبدأ polling
      if (result?.paymentId) {
        setCurrentPaymentId(result.paymentId);
        startPolling(result.paymentId);
      }
    } catch (error: any) {
      showError(error.message || t.paymentError);
    }
  };

  // ==========================================
  // SUCCESS HANDLER
  // ==========================================
  const handleSuccessfulPayment = () => {
    showSuccess(t.bookingConfirmed);
    router.replace({
      pathname: `/screens/BookingDetailsScreen`,
      params: { bookingId: bookingId },
    });
  };

  // ==========================================
  // WEBVIEW HANDLERS
  // ==========================================
  const handleWebViewClose = () => {
    setShowWebView(false);
    stopPolling();
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log("WebView URL:", url);

    // ✅ إضافة example.com
    if (
      url.includes("callback") ||
      url.includes("success") ||
      url.includes("return_url") ||
      url.includes("example.com") || // ← جديد
      url === "https://example.com/" || // ← جديد
      url === "https://example.com" // ← جديد
    ) {
      console.log("🎉 Detected callback URL, checking payment...");

      if (currentPaymentId) {
        // إيقاف Polling مؤقتاً لتجنب التكرار
        stopPolling();

        checkPaymentStatus(currentPaymentId, bookingId).then((result) => {
          if (result?.success && result.status === "paid") {
            setShowWebView(false);
            handleSuccessfulPayment();
          } else if (!result?.success || result?.status === "failed") {
            console.log("❌ Payment failed:", result);

            // ❌ الدفع فشل فعلاً
            setShowWebView(false);
            showError(result?.message || t.paymentError);
          } else {
            // ⏳ لسه في initiated، ارجع للـ Polling
            startPolling(currentPaymentId);
          }
        });
      }
    }
  };

  // ==========================================
  // STATUS MESSAGE
  // ==========================================
  const renderStatusMessage = () => {
    if (!booking) return null;

    let bgColor = colors.background;
    let textColor = colors.text;
    let message = "";

    switch (booking.status) {
      case "pending":
        bgColor = colors.warning + "20";
        textColor = colors.warning;
        message = t.awaitingApproval;
        break;
      case "confirmed":
        bgColor = colors.success + "20";
        textColor = colors.success;
        message = t.approvedPayNow;
        break;
      case "payment_pending":
        bgColor = colors.primary + "20";
        textColor = colors.primary;
        message = t.processingPayment;
        break;
      default:
        return null;
    }

    return (
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: bgColor, borderColor: textColor },
        ]}
      >
        <Text style={[styles.statusText, { color: textColor }]}>{message}</Text>
      </View>
    );
  };

  // ==========================================
  // TIMER DISPLAY
  // ==========================================
  const renderTimer = () => {
    if (!booking || !timeLeft) return null;

    const isUrgent = timeLeft < 3600;

    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>
          {booking.status === "confirmed" ? t.timeLeftToPay : t.paymentTimeout}
        </Text>
        <Text style={[styles.timerValue, isUrgent && { color: colors.error }]}>
          {formattedTime}
        </Text>
        {isUrgent && <Text style={styles.timerWarning}>{t.hurryUp}</Text>}
      </View>
    );
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
      statusBanner: {
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        padding: responsive.getResponsiveValue(12, 14, 16, 18, 20),
        borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        borderWidth: 1,
      },
      statusText: {
        fontSize: responsive.getFontSize(13, 12, 15),
        fontFamily: fonts.Medium || fonts.Regular,
        textAlign: "center",
        lineHeight: responsive.getFontSize(13, 12, 15) * 1.5,
      },
      timerContainer: {
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        padding: responsive.getResponsiveValue(14, 16, 20, 22, 24),
        backgroundColor: colors.primary + "10",
        borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: "center",
      },
      timerLabel: {
        fontSize: responsive.getFontSize(13, 12, 15),
        fontFamily: fonts.Medium || fonts.Regular,
        color: colors.textSecondary,
        marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      },
      timerValue: {
        fontSize: responsive.getFontSize(24, 22, 28),
        fontFamily: fonts.Bold,
        color: colors.primary,
      },
      timerWarning: {
        fontSize: responsive.getFontSize(12, 11, 14),
        fontFamily: fonts.Medium,
        color: colors.error,
        marginTop: responsive.getResponsiveValue(6, 8, 10, 12, 14),
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
      // WebView Modal Styles
      webViewModal: {
        flex: 1,
        backgroundColor: colors.background,
      },
      webViewHeader: {
        flexDirection: isRTL ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.primary,
        paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
        paddingTop:
          responsive.safeAreaTop +
          responsive.getResponsiveValue(12, 16, 20, 24, 28),
        paddingBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      },
      webViewTitle: {
        fontSize: responsive.getFontSize(18, 17, 20),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.textInverse,
        flex: 1,
        textAlign: "center",
      },
      closeButton: {
        padding: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      },
      closeButtonText: {
        fontSize: responsive.getFontSize(16, 15, 18),
        fontFamily: fonts.SemiBold,
        color: colors.textInverse,
      },
      webView: {
        flex: 1,
      },
      loadingContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      },
      loadingText: {
        fontSize: responsive.getFontSize(14, 13, 16),
        fontFamily: fonts.Medium,
        color: colors.text,
        marginTop: responsive.getResponsiveValue(12, 14, 16, 18, 20),
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

  if (booking.status === "pending") {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text
          style={[styles.errorText, { textAlign: "center", marginBottom: 20 }]}
        >
          {t.pendingApproval}
        </Text>
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

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.title}</Text>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStatusMessage()}
          {renderTimer()}

          {/* BOOKING SUMMARY */}
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

          {/* ACCEPTED CARDS */}
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

          {/* CARD DETAILS FORM */}
          <View style={styles.section}>
            <Card type="default">
              <Card.Content>
                <Text style={styles.sectionTitle}>{t.cardDetails}</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t.cardNumber}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.cardNumber && styles.inputError,
                    ]}
                    value={cardNumber}
                    onChangeText={(text) => {
                      setCardNumber(
                        formatCardNumber(text.replace(/[^\d]/g, ""))
                      );
                      if (errors.cardNumber)
                        setErrors({ ...errors, cardNumber: "" });
                    }}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="number-pad"
                    maxLength={19}
                    textAlign="left"
                    placeholderTextColor={colors.textMuted}
                    editable={!isPaymentLoading && !isCreatingToken}
                  />
                  {errors.cardNumber && (
                    <Text style={styles.errorText}>{errors.cardNumber}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t.cardName}</Text>
                  <TextInput
                    style={[styles.input, errors.cardName && styles.inputError]}
                    value={cardName}
                    onChangeText={(text) => {
                      setCardName(text);
                      if (errors.cardName)
                        setErrors({ ...errors, cardName: "" });
                    }}
                    placeholder="AHMED MOHAMMED"
                    autoCapitalize="characters"
                    textAlign="left"
                    placeholderTextColor={colors.textMuted}
                    editable={!isPaymentLoading && !isCreatingToken}
                  />
                  {errors.cardName && (
                    <Text style={styles.errorText}>{errors.cardName}</Text>
                  )}
                </View>

                <View style={styles.row}>
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
                        editable={!isPaymentLoading && !isCreatingToken}
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
                        editable={!isPaymentLoading && !isCreatingToken}
                      />
                    </View>
                    {(errors.expiryMonth || errors.expiryYear) && (
                      <Text style={styles.errorText}>
                        {errors.expiryMonth || errors.expiryYear}
                      </Text>
                    )}
                  </View>

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
                      editable={!isPaymentLoading && !isCreatingToken}
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

          {/* PAY BUTTON */}
          <View style={styles.section}>
            <CustomButton
              title={
                isCreatingToken
                  ? t.creatingToken
                  : `${t.pay} ${booking.final_amount} ${t.sar}`
              }
              bgVariant="success"
              onPress={handlePayment}
              loading={isPaymentLoading || isCreatingToken}
              disabled={isPaymentLoading || isCreatingToken || isExpired}
            />
          </View>

          {/* SECURITY INFO */}
          <View style={styles.securityInfo}>
            <Text style={styles.securityInfoText}>{t.securityInfo}</Text>
            <Text style={[styles.securityInfoText, { marginTop: 5 }]}>
              {t.noServerPass}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* ==========================================
          WEBVIEW MODAL FOR 3DS
          ========================================== */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={handleWebViewClose}
      >
        <View style={styles.webViewModal}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              onPress={handleWebViewClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>{t.closeWebView}</Text>
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>{t.verifyingPayment}</Text>
            <View style={{ width: 60 }} />
          </View>

          {webViewUrl ? (
            <WebView
              source={{ uri: webViewUrl }}
              style={styles.webView}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>{t.checkingPayment}</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{t.checkingPayment}</Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
