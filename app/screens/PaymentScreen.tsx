import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Separator } from "@/components/ui/Separator";
import {
  useBookingDetails,
  useConfirmPayment,
} from "@/hooks/booking/useUserBookings";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import axios from "axios";
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
  View,
} from "react-native";
import Base64 from "react-native-base64";
import { WebView } from "react-native-webview";

const MOYASAR_API_URL = "https://api.moyasar.com/v1/payments";
const MOYASAR_PUBLISHABLE_KEY =
  "pk_test_iCcpYKAVDAYtms1N33EX2KZ2C5ijdxdYorRtWhS5";

const REQUEST_TIMEOUT = 45000;
const MAX_RETRIES = 3;

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const createAuthHeader = () => {
  const credentials = `${MOYASAR_PUBLISHABLE_KEY}:`;
  const base64 = Base64.encode(credentials);
  return `Basic ${base64}`;
};

export default function PaymentScreen() {
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
  const { confirmPayment, isLoading: isConfirming } = useConfirmPayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [transactionUrl, setTransactionUrl] = useState("");
  const [currentPaymentId, setCurrentPaymentId] = useState("");
  const paymentIdempotencyRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        : "All data is encrypted and secure",
    pay: currentLanguage === "ar" ? "ادفع" : "Pay",
    securityInfo:
      currentLanguage === "ar"
        ? "بيانات بطاقتك محمية بالكامل. لن نقوم بحفظ أي بيانات للبطاقة"
        : "Your card data is fully protected. We will not save any card information",
    invalidData:
      currentLanguage === "ar"
        ? "يرجى التحقق من البيانات المدخلة"
        : "Please check entered data",
    cardNumberError:
      currentLanguage === "ar"
        ? "رقم البطاقة يجب أن يكون 16-19 رقم"
        : "Card number must be 16-19 digits",
    cardNameError:
      currentLanguage === "ar"
        ? "يرجى إدخال الاسم الأول والأخير (اسمين على الأقل)"
        : "Please enter first and last name (at least 2 names)",
    invalidMonth: currentLanguage === "ar" ? "شهر غير صحيح" : "Invalid month",
    expiredYear: currentLanguage === "ar" ? "سنة منتهية" : "Expired year",
    cvvError:
      currentLanguage === "ar"
        ? "CVV يجب أن يكون 3-4 أرقام"
        : "CVV must be 3-4 digits",
    paymentError:
      currentLanguage === "ar"
        ? "حدث خطأ أثناء معالجة الدفع"
        : "Error processing payment",
    bookingConfirmed:
      currentLanguage === "ar"
        ? "تم تأكيد حجزك. يمكنك الآن استلام السيارة من الفرع"
        : "Your booking is confirmed. You can now pick up the car from the branch",
    cannotPay:
      currentLanguage === "ar"
        ? "لا يمكن إتمام الدفع. تحقق من حالة الحجز"
        : "Cannot complete payment. Check booking status",
    back: currentLanguage === "ar" ? "العودة" : "Go Back",
    verifying3DS:
      currentLanguage === "ar"
        ? "جاري التحقق من البطاقة..."
        : "Verifying your card...",
    complete3DS:
      currentLanguage === "ar"
        ? "يرجى إكمال التحقق من خلال البنك"
        : "Please complete bank verification",
    retrying:
      currentLanguage === "ar" ? "جاري إعادة المحاولة..." : "Retrying...",
    timeout:
      currentLanguage === "ar"
        ? "انتهت مهلة الاتصال. يرجى التحقق من الاتصال بالإنترنت"
        : "Connection timeout. Please check your internet connection",
    networkError:
      currentLanguage === "ar"
        ? "خطأ في الاتصال بالإنترنت"
        : "Network connection error",
  };

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
    const nameParts = trimmedName.split(/\s+/);
    if (!trimmedName || nameParts.length < 2 || trimmedName.length < 3) {
      newErrors.cardName = t.cardNameError;
    }

    const month = parseInt(expiryMonth);
    if (!expiryMonth || month < 1 || month > 12) {
      newErrors.expiryMonth = t.invalidMonth;
    }

    const currentYear = new Date().getFullYear();
    const fullYear = parseInt("20" + expiryYear);
    if (!expiryYear || fullYear < currentYear) {
      newErrors.expiryYear = t.expiredYear;
    }

    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = t.cvvError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetPaymentState = () => {
    setIsProcessing(false);
    retryCountRef.current = 0;
    paymentIdempotencyRef.current = null;
  };

  const createMoyasarPayment = async () => {
    try {
      if (!booking) {
        throw new Error("NO_BOOKING");
      }
      const cleanedCardNumber = cardNumber.replace(/\s+/g, "");
      const amountInHalalas = Math.round(booking.final_amount * 100);

      if (!paymentIdempotencyRef.current) {
        paymentIdempotencyRef.current = generateUUID();
      }

      const paymentData = {
        given_id: paymentIdempotencyRef.current,
        amount: amountInHalalas,
        currency: "SAR",
        description: `${
          currentLanguage === "ar" ? "حجز سيارة" : "Car booking"
        } - ${booking.car?.model?.brand?.name_ar || ""} ${
          booking.car?.model?.name_ar || ""
        }`.trim(),
        callback_url: "https://yourdomain.com/payment/callback", // ✅ غير هذا
        source: {
          type: "creditcard",
          name: cardName.trim(),
          number: cleanedCardNumber,
          cvc: cvv,
          month: parseInt(expiryMonth),
          year: parseInt("20" + expiryYear),
        },
        metadata: {
          booking_id: String(bookingId),
          customer_id: String(booking.customer_id || ""),
          car_id: String(booking.car_id || ""),
        },
      };

      // console.log("=== SENDING TO MOYASAR ===");
      // console.log("Payment Data:", {
      //   ...paymentData,
      //   source: {
      //     ...paymentData.source,
      //     number: "****" + cleanedCardNumber.slice(-4),
      //     cvc: "***",
      //   },
      // });

      const response = await axios({
        method: "POST",
        url: MOYASAR_API_URL,
        data: paymentData,
        headers: {
          "Content-Type": "application/json",
          Authorization: createAuthHeader(),
        },
        timeout: 60000,
        validateStatus: (status) => status < 600,
      });

      // console.log("=== RESPONSE ===");
      // console.log("Status:", response.status);
      // console.log("Data:", JSON.stringify(response.data, null, 2));

      return {
        response: { status: response.status },
        result: response.data,
      };
    } catch (error) {
      console.error("=== ERROR DETAILS ===");

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error(
            "Error Data:",
            JSON.stringify(error.response.data, null, 2)
          );

          // اطبع الأخطاء بالتفصيل
          if (error.response.data.errors) {
            console.error("Validation Errors:", error.response.data.errors);
          }

          return {
            response: { status: error.response.status },
            result: error.response.data,
          };
        }

        if (error.code === "ECONNABORTED") {
          throw new Error("TIMEOUT");
        }

        throw new Error("NETWORK_ERROR");
      }

      throw error;
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await axios.get(`${MOYASAR_API_URL}/${paymentId}`, {
        headers: {
          Authorization: createAuthHeader(),
        },
        timeout: REQUEST_TIMEOUT,
      });

      const payment = response.data;

      if (payment.status === "paid") {
        await handleSuccessfulPayment(paymentId);
      } else if (payment.status === "failed") {
        resetPaymentState();
        showError(payment.source?.message || t.paymentError);
      } else {
        resetPaymentState();
        showWarning(
          currentLanguage === "ar"
            ? "الدفع لا يزال قيد المعالجة"
            : "Payment is still processing"
        );
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      resetPaymentState();
      showError(t.paymentError);
    }
  };

  const handlePaymentResponse = async (response, result) => {
    if (response.status === 201) {
      setCurrentPaymentId(result.id);

      if (result.status === "paid") {
        await handleSuccessfulPayment(result.id);
      } else if (result.status === "initiated") {
        if (result.source?.transaction_url) {
          setTransactionUrl(result.source.transaction_url);
          setShow3DSModal(true);
        } else {
          resetPaymentState();
          showError("Missing 3DS verification URL");
        }
      } else if (result.status === "failed") {
        resetPaymentState();
        showError(result.source?.message || t.paymentError);
      }
    } else if (response.status === 400) {
      const errorMsg =
        result.message || JSON.stringify(result.errors || result);
      console.log(result);

      console.error("❌ Validation error:", errorMsg);

      if (errorMsg.includes("already created")) {
        showWarning(
          currentLanguage === "ar"
            ? "تم إنشاء الدفع مسبقاً"
            : "Payment already created"
        );
        if (currentPaymentId) {
          await checkPaymentStatus(currentPaymentId);
        }
        return;
      }

      resetPaymentState();
      showError(errorMsg);
    } else if (response.status >= 500) {
      throw new Error("SERVER_ERROR");
    } else {
      resetPaymentState();
      showError(result.message || t.paymentError);
    }
  };

  const retryPayment = async () => {
    retryCountRef.current += 1;

    if (retryCountRef.current > MAX_RETRIES) {
      resetPaymentState();
      showError(
        currentLanguage === "ar"
          ? "فشلت جميع محاولات الدفع"
          : "All payment attempts failed"
      );
      return;
    }

    showWarning(`${t.retrying} (${retryCountRef.current}/${MAX_RETRIES})`);

    await new Promise((resolve) =>
      setTimeout(resolve, 2000 * retryCountRef.current)
    );

    try {
      const { response, result } = await createMoyasarPayment();
      await handlePaymentResponse(response, result);
    } catch (error) {
      if (error.message === "SERVER_ERROR") {
        await retryPayment();
      } else {
        throw error;
      }
    }
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

    setIsProcessing(true);
    retryCountRef.current = 0;

    try {
      const { response, result } = await createMoyasarPayment();
      await handlePaymentResponse(response, result);
    } catch (error) {
      console.error("💥 Payment Error:", error);

      if (error.message === "SERVER_ERROR") {
        try {
          await retryPayment();
        } catch (retryError) {
          resetPaymentState();
          showError(t.paymentError);
        }
        return;
      }

      resetPaymentState();

      let errorMessage = t.paymentError;

      if (error.message === "TIMEOUT") {
        errorMessage = t.timeout;
      } else if (error.message === "NETWORK_ERROR") {
        errorMessage = t.networkError;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    }
  };

  const handle3DSCallback = (url: string) => {
    if (url.includes("myapp://payment/callback")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const status = urlParams.get("status");
      const paymentId = urlParams.get("id") || currentPaymentId;

      setShow3DSModal(false);
      setTransactionUrl("");

      if (status === "paid") {
        handleSuccessfulPayment(paymentId);
      } else if (status === "failed") {
        resetPaymentState();
        showError(
          currentLanguage === "ar"
            ? "فشل التحقق من البطاقة"
            : "Card verification failed"
        );
      } else {
        checkPaymentStatus(paymentId);
      }
    }
  };

  const handleSuccessfulPayment = async (paymentId: string) => {
    try {
      await confirmPayment(
        { bookingId, paymentReference: paymentId },
        {
          onSuccess: () => {
            resetPaymentState();
            showSuccess(t.bookingConfirmed);
            router.replace({
              pathname: `/screens/BookingDetailsScreen`,
              params: { bookingId: bookingId },
            });
          },
          onError: (error) => {
            resetPaymentState();
            showWarning(
              currentLanguage === "ar"
                ? "تم الدفع بنجاح ولكن حدث خطأ في تحديث البيانات"
                : "Payment successful but error updating data"
            );
          },
        }
      );
    } catch (error) {
      resetPaymentState();
      showError(t.paymentError);
    }
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
      inputError: {
        borderColor: colors.error,
        borderWidth: 1.5,
      },
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
      modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
      },
      modalHeader: {
        backgroundColor: colors.primary,
        paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
        paddingTop:
          responsive.safeAreaTop +
          responsive.getResponsiveValue(12, 16, 20, 24, 28),
        paddingBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      modalTitle: {
        fontSize: responsive.getFontSize(18, 17, 20),
        fontFamily: fonts.Bold || fonts.SemiBold,
        color: colors.textInverse,
        flex: 1,
        textAlign: "center",
      },
      webviewContainer: {
        flex: 1,
      },
      loadingContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background + "CC",
      },
    });

  const styles = createStyles();

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
                      const formatted = formatCardNumber(
                        text.replace(/[^\d]/g, "")
                      );
                      setCardNumber(formatted);
                      if (errors.cardNumber) {
                        setErrors({ ...errors, cardNumber: "" });
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="number-pad"
                    maxLength={19}
                    textAlign="left"
                    placeholderTextColor={colors.textMuted}
                    editable={!isProcessing}
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
                      if (errors.cardName) {
                        setErrors({ ...errors, cardName: "" });
                      }
                    }}
                    placeholder="AHMED MOHAMMED"
                    autoCapitalize="characters"
                    textAlign="left"
                    placeholderTextColor={colors.textMuted}
                    editable={!isProcessing}
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
                          const cleaned = text.replace(/[^\d]/g, "");
                          setExpiryMonth(cleaned.substring(0, 2));
                          if (errors.expiryMonth) {
                            setErrors({ ...errors, expiryMonth: "" });
                          }
                        }}
                        placeholder="MM"
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholderTextColor={colors.textMuted}
                        editable={!isProcessing}
                      />
                      <Text style={styles.slash}>/</Text>
                      <TextInput
                        style={[
                          styles.expiryInput,
                          errors.expiryYear && styles.inputError,
                        ]}
                        value={expiryYear}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^\d]/g, "");
                          setExpiryYear(cleaned.substring(0, 2));
                          if (errors.expiryYear) {
                            setErrors({ ...errors, expiryYear: "" });
                          }
                        }}
                        placeholder="YY"
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholderTextColor={colors.textMuted}
                        editable={!isProcessing}
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
                        const cleaned = text.replace(/[^\d]/g, "");
                        setCvv(cleaned.substring(0, 4));
                        if (errors.cvv) {
                          setErrors({ ...errors, cvv: "" });
                        }
                      }}
                      placeholder="123"
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                      textAlign="center"
                      placeholderTextColor={colors.textMuted}
                      editable={!isProcessing}
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

          <View style={styles.section}>
            <CustomButton
              title={`${t.pay} ${booking.final_amount} ${t.sar}`}
              bgVariant="success"
              onPress={handlePayment}
              loading={isProcessing || isConfirming}
              disabled={isProcessing || isConfirming}
            />
          </View>

          <View style={styles.securityInfo}>
            <Text style={styles.securityInfoText}>{t.securityInfo}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={show3DSModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          setShow3DSModal(false);
          resetPaymentState();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.complete3DS}</Text>
          </View>

          <View style={styles.webviewContainer}>
            <WebView
              source={{ uri: transactionUrl }}
              originWhitelist={["*"]} // ✅ أضف هذا
              onNavigationStateChange={(navState) => {
                handle3DSCallback(navState.url);
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("WebView error:", nativeEvent);
                setShow3DSModal(false);
                resetPaymentState();
                showError(t.networkError);
              }}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ marginTop: 16, color: colors.text }}>
                    {t.verifying3DS}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
