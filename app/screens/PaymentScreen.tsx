import AcceptedCards from "@/components/Payment/AcceptedCards";
import BookingSummary from "@/components/Payment/BookingSummary";
import CardForm from "@/components/Payment/CardForm";
import Header from "@/components/Payment/Header";
import SecurityInfo from "@/components/Payment/SecurityInfo";
import StatusBanner from "@/components/Payment/StatusBanner";
import Timer from "@/components/Payment/Timer";
import WebViewModal from "@/components/Payment/WebViewModal";
import CustomButton from "@/components/ui/CustomButton";
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MOYASAR_PUBLISHABLE_KEY =
  "pk_test_iCcpYKAVDAYtms1N33EX2KZ2C5ijdxdYorRtWhS5";
const POLLING_INTERVAL = 3000;
const MAX_POLLING_ATTEMPTS = 40;

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage } = useLanguageStore();
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

  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState("");
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const pollingAttemptsRef = useRef(0);

  const t = {
    title: currentLanguage === "ar" ? "إتمام الدفع" : "Complete Payment",
    pay: currentLanguage === "ar" ? "ادفع" : "Pay",
    sar: currentLanguage === "ar" ? "ر.س" : "SAR",
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
          console.log("🔐 3DS required, opening WebView...");
          setWebViewUrl(url);
          setShowWebView(true);
        },
        onError: (error) => {
          showError(error.message || t.paymentError);
        },
      });

      if (result?.paymentId) {
        setCurrentPaymentId(result.paymentId);
        startPolling(result.paymentId);
      }
    } catch (error: any) {
      showError(error.message || t.paymentError);
    }
  };

  const handleSuccessfulPayment = () => {
    showSuccess(t.bookingConfirmed);
    router.replace({
      pathname: `/screens/BookingDetailsScreen`,
      params: { bookingId: bookingId },
    });
  };

  const handleWebViewClose = () => {
    setShowWebView(false);
    stopPolling();
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log("WebView URL:", url);

    if (
      url.includes("callback") ||
      url.includes("success") ||
      url.includes("return_url") ||
      url.includes("example.com") ||
      url === "https://example.com/" ||
      url === "https://example.com"
    ) {
      console.log("🎉 Detected callback URL, checking payment...");

      if (currentPaymentId) {
        stopPolling();

        checkPaymentStatus(currentPaymentId, bookingId).then((result) => {
          if (result?.success && result.status === "paid") {
            setShowWebView(false);
            handleSuccessfulPayment();
          } else if (!result?.success || result?.status === "failed") {
            console.log("❌ Payment failed:", result);
            setShowWebView(false);
            showError(result?.message || t.paymentError);
          } else {
            startPolling(currentPaymentId);
          }
        });
      }
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
      paddingBottom: responsive.getResponsiveValue(24, 28, 32, 36, 40),
    },
    buttonContainer: {
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
  });

  if (isLoadingBooking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
        <Header title={t.title} />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <StatusBanner status={booking.status} />
          <Timer
            status={booking.status}
            timeLeft={timeLeft || 0}
            formattedTime={formattedTime || ""}
          />

          <BookingSummary
            carName={carName}
            imageUrl={booking.car?.model?.default_image_url}
            startDate={booking.start_date}
            endDate={booking.end_date}
            totalDays={booking.total_days}
            totalAmount={booking.total_amount}
            discountAmount={booking.discount_amount}
            finalAmount={booking.final_amount}
          />

          <AcceptedCards />

          <CardForm
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
            cardName={cardName}
            setCardName={setCardName}
            expiryMonth={expiryMonth}
            setExpiryMonth={setExpiryMonth}
            expiryYear={expiryYear}
            setExpiryYear={setExpiryYear}
            cvv={cvv}
            setCvv={setCvv}
            errors={errors}
            setErrors={setErrors}
            isDisabled={isPaymentLoading || isCreatingToken}
          />

          <View style={styles.buttonContainer}>
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

          <SecurityInfo />
        </ScrollView>
      </KeyboardAvoidingView>

      <WebViewModal
        visible={showWebView}
        url={webViewUrl}
        onClose={handleWebViewClose}
        onNavigationStateChange={handleWebViewNavigationStateChange}
      />
    </>
  );
}
