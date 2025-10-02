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
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createPayment,
  CreditCardRequestSource,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
} from "react-native-moyasar-sdk";

// Moyasar key from environment variables
const MOYASAR_PUBLISHABLE_KEY = "pk_test_Y58doGbqLt0ZIRB47yNWAPKz";

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

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  // Validation errors
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
    error: currentLanguage === "ar" ? "خطأ" : "Error",
    invalidData:
      currentLanguage === "ar"
        ? "يرجى التحقق من البيانات المدخلة"
        : "Please check entered data",
    cardNumberError:
      currentLanguage === "ar"
        ? "رقم البطاقة يجب أن يكون 16 رقم"
        : "Card number must be 16 digits",
    cardNameError:
      currentLanguage === "ar"
        ? "يرجى إدخال الاسم كما هو على البطاقة"
        : "Please enter name as on card",
    invalidMonth: currentLanguage === "ar" ? "شهر غير صحيح" : "Invalid month",
    expiredYear: currentLanguage === "ar" ? "سنة منتهية" : "Expired year",
    cvvError:
      currentLanguage === "ar"
        ? "CVV يجب أن يكون 3 أرقام"
        : "CVV must be 3 digits",
    paymentError:
      currentLanguage === "ar"
        ? "حدث خطأ أثناء معالجة الدفع"
        : "Error processing payment",
    paymentSuccess:
      currentLanguage === "ar" ? "تم الدفع بنجاح!" : "Payment Successful!",
    bookingConfirmed:
      currentLanguage === "ar"
        ? "تم تأكيد حجزك. يمكنك الآن استلام السيارة من الفرع"
        : "Your booking is confirmed. You can now pick up the car from the branch",
    cannotPay:
      currentLanguage === "ar"
        ? "لا يمكن إتمام الدفع. تحقق من حالة الحجز"
        : "Cannot complete payment. Check booking status",
    back: currentLanguage === "ar" ? "العودة" : "Go Back",
  };

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (!cleanedCardNumber || cleanedCardNumber.length !== 16) {
      newErrors.cardNumber = t.cardNumberError;
    }

    if (!cardName || cardName.trim().length < 3) {
      newErrors.cardName = t.cardNameError;
    }

    const month = parseInt(expiryMonth);
    if (!expiryMonth || month < 1 || month > 12) {
      newErrors.expiryMonth = t.invalidMonth;
    }

    const currentYear = new Date().getFullYear() % 100;
    const year = parseInt(expiryYear);
    if (!expiryYear || year < currentYear) {
      newErrors.expiryYear = t.expiredYear;
    }

    if (!cvv || cvv.length !== 3) {
      newErrors.cvv = t.cvvError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    setIsProcessing(true); // ⬅️ انقله لأول سطر

    if (!validateForm()) {
      showError(t.invalidData);
      setIsProcessing(false); // ⬅️ أضف هنا أيضاً
      return;
    }

    if (!booking) {
      showError(t.cannotPay);
      setIsProcessing(false);
      return;
    }

    try {
      const cleanedCardNumber = cardNumber.replace(/\s/g, "");
      const amountInHalalas = Math.round(booking.final_amount * 100);

      const ccSource = new CreditCardRequestSource({
        name: cardName.trim(),
        number: cleanedCardNumber,
        cvc: cvv,
        month: expiryMonth,
        year: "20" + expiryYear,
        tokenizeCard: false,
        manualPayment: false,
      });

      const paymentRequest = new PaymentRequest({
        amount: amountInHalalas,
        currency: "SAR",
        description: `${
          currentLanguage === "ar" ? "حجز سيارة" : "Car booking"
        } - ${booking.car?.model?.brand?.name_ar} ${
          booking.car?.model?.name_ar
        }`,
        metadata: {
          booking_id: bookingId,
          customer_id: booking.customer_id,
          car_id: booking.car_id,
        },
        source: ccSource,
        callbackUrl: "myapp://payment/callback", // ⬅️ أضف هذا لـ 3DS
        applyCoupon: true,
      });

      // إضافة timeout للحماية من التعليق
      const paymentResponse = await Promise.race([
        createPayment(paymentRequest, MOYASAR_PUBLISHABLE_KEY),
        new Promise(
          (_, reject) =>
            setTimeout(
              () => reject(new Error("Payment timeout - please try again")),
              120000
            ) // دقيقتين
        ),
      ]);

      if (paymentResponse instanceof PaymentResponse) {
        if (paymentResponse.status === PaymentStatus.paid) {
          handleSuccessfulPayment(paymentResponse.id);
        } else if (paymentResponse.status === PaymentStatus.initiated) {
          showWarning(
            currentLanguage === "ar"
              ? "يرجى إكمال التحقق من خلال البنك"
              : "Please complete verification through your bank"
          );
          setIsProcessing(false);
        } else if (paymentResponse.status === PaymentStatus.failed) {
          throw new Error(paymentResponse.source?.message || t.paymentError);
        }
      } else {
        throw new Error(t.paymentError);
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      setIsProcessing(false);

      let errorMessage = t.paymentError;

      if (error.message) {
        if (error.message.includes("timeout")) {
          errorMessage =
            currentLanguage === "ar"
              ? "انتهت مهلة الدفع. يرجى المحاولة مرة أخرى"
              : "Payment timeout. Please try again";
        } else if (error.message.includes("card")) {
          errorMessage =
            currentLanguage === "ar"
              ? "بيانات البطاقة غير صحيحة"
              : "Invalid card data";
        } else if (error.message.includes("insufficient")) {
          errorMessage =
            currentLanguage === "ar"
              ? "رصيد غير كافٍ في البطاقة"
              : "Insufficient card balance";
        } else if (error.message.includes("declined")) {
          errorMessage =
            currentLanguage === "ar"
              ? "تم رفض البطاقة من قبل البنك"
              : "Card declined by bank";
        } else {
          errorMessage = error.message;
        }
      }

      showError(errorMessage);
    }
  };

  const handleSuccessfulPayment = async (paymentId: string) => {
    await confirmPayment(
      { bookingId, paymentReference: paymentId },
      {
        onSuccess: () => {
          setIsProcessing(false);
          showSuccess(t.bookingConfirmed);
          router.replace({
            pathname: `/screens/BookingDetailsScreen`,
            params: { bookingId: bookingId },
          });
        },
        onError: (error) => {
          setIsProcessing(false);
          showWarning(
            currentLanguage === "ar"
              ? "تم الدفع بنجاح ولكن حدث خطأ في تحديث البيانات"
              : "Payment successful but error updating data"
          );
        },
      }
    );
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
    });

  const styles = createStyles();

  if (isLoadingBooking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!booking || booking.status !== "confirmed") {
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

  const carName = `${booking.car?.model?.brand?.name_ar} ${booking.car?.model?.name_ar}`;

  return (
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
        {/* Booking Summary */}
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

        {/* Accepted Cards */}
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

        {/* Card Details */}
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
                    if (errors.cardName) {
                      setErrors({ ...errors, cardName: "" });
                    }
                  }}
                  placeholder="AHMED MOHAMMED"
                  autoCapitalize="characters"
                  textAlign="left"
                  placeholderTextColor={colors.textMuted}
                />
                {errors.cardName && (
                  <Text style={styles.errorText}>{errors.cardName}</Text>
                )}
              </View>

              {/* Expiry Date and CVV */}
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
                      setCvv(cleaned.substring(0, 3));
                      if (errors.cvv) {
                        setErrors({ ...errors, cvv: "" });
                      }
                    }}
                    placeholder="123"
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                    textAlign="center"
                    placeholderTextColor={colors.textMuted}
                  />
                  {errors.cvv && (
                    <Text style={styles.errorText}>{errors.cvv}</Text>
                  )}
                </View>
              </View>

              <Text style={styles.securityNote}>🔒 {t.securityNote}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Pay Button */}
        <View style={styles.section}>
          <CustomButton
            title={`${t.pay} ${booking.final_amount} ${t.sar}`}
            bgVariant="success"
            onPress={handlePayment}
            loading={isProcessing || isConfirming}
            disabled={isProcessing || isConfirming}
          />
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityInfoText}>{t.securityInfo}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
