import InfoRow from "@/components/BookingDetails/InfoRow";
import Section from "@/components/BookingDetails/Section";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text, View } from "react-native";

interface FinancialSectionProps {
  rentalType: "daily" | "weekly" | "monthly" | "ownership";
  dailyRate: number; // السعر الفعلي المستخدم في الحساب
  totalDays: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  carDiscountPercentage?: number; // نسبة خصم السيارة (من جدول cars)
}

export default function FinancialSection({
  rentalType,
  dailyRate,
  totalDays,
  totalAmount,
  discountAmount,
  finalAmount,
  carDiscountPercentage,
}: FinancialSectionProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title:
      currentLanguage === "ar" ? "المعلومات المالية" : "Financial Information",

    // تسميات السعر حسب النوع
    dailyRate: currentLanguage === "ar" ? "السعر اليومي" : "Daily Rate",
    weeklyRate: currentLanguage === "ar" ? "السعر الأسبوعي" : "Weekly Rate",
    monthlyRate: currentLanguage === "ar" ? "السعر الشهري" : "Monthly Rate",
    ownershipPrice:
      currentLanguage === "ar" ? "سعر التمليك" : "Ownership Price",

    subtotal: currentLanguage === "ar" ? "المجموع الفرعي" : "Subtotal",
    discount: currentLanguage === "ar" ? "خصم العرض" : "Offer Discount",
    finalAmount: currentLanguage === "ar" ? "المبلغ النهائي" : "Final Amount",
    sar: currentLanguage === "ar" ? "ر.س" : "SAR",

    // ملاحظات
    ownershipNote:
      currentLanguage === "ar"
        ? "* سعر التمليك ثابت بدون خصومات"
        : "* Ownership price is fixed without discounts",
    priceAfterDiscount:
      currentLanguage === "ar" ? "(بعد الخصم)" : "(after discount)",
  };

  // ✅ تحديد تسمية السعر حسب نوع الإيجار
  const getRateLabel = () => {
    switch (rentalType) {
      case "daily":
        return t.dailyRate;
      case "weekly":
        return t.weeklyRate;
      case "monthly":
        return t.monthlyRate;
      case "ownership":
        return t.ownershipPrice;
      default:
        return t.dailyRate;
    }
  };

  // ✅ حساب السعر الأصلي (قبل الخصم)
  const originalRate =
    discountAmount > 0 && rentalType !== "ownership"
      ? dailyRate / (1 - (carDiscountPercentage || 0) / 100)
      : dailyRate;

  const styles = StyleSheet.create({
    // السطر الأول (السعر الأساسي) - مميز
    rateRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      backgroundColor: colors.primary + "10",
      paddingHorizontal: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    rateLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.SemiBold || fonts.Medium,
      color: colors.primary,
    },
    rateValue: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.Bold || fonts.SemiBold,
      color: colors.primary,
    },
    rateNote: {
      fontSize: responsive.getFontSize(11, 10, 12),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginTop: 2,
    },

    // خط الخصم - بقيمتين (الأصلي + المخصوم)
    discountDetailRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: responsive.getResponsiveValue(10, 12, 14, 16, 18),
    },
    discountLeft: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 8,
    },
    discountBadge: {
      backgroundColor: colors.success + "20",
      paddingHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      paddingVertical: responsive.getResponsiveValue(2, 4, 6, 8, 10),
      borderRadius: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    discountBadgeText: {
      fontSize: responsive.getFontSize(11, 10, 12),
      fontFamily: fonts.Bold || fonts.SemiBold,
      color: colors.success,
    },
    strikethrough: {
      fontSize: responsive.getFontSize(13, 12, 14),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textDecorationLine: "line-through",
    },

    // السطر النهائي (المبلغ الإجمالي)
    totalRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingTop: responsive.getResponsiveValue(12, 16, 20, 22, 24),
      paddingVertical: responsive.getResponsiveValue(10, 12, 14, 16, 18),
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

    // ملاحظة التمليك
    ownershipNote: {
      fontSize: responsive.getFontSize(11, 10, 12),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      fontStyle: "italic",
    },
  });

  return (
    <Section title={t.title}>
      {/* ✅ السعر الأساسي (مميز بخلفية) */}
      <View style={styles.rateRow}>
        <View>
          <Text style={styles.rateLabel}>{getRateLabel()}</Text>
          {discountAmount > 0 && rentalType !== "ownership" && (
            <Text style={styles.rateNote}>{t.priceAfterDiscount}</Text>
          )}
        </View>
        <Text style={styles.rateValue}>
          {dailyRate.toFixed(2)} {t.sar}
        </Text>
      </View>

      {/* ✅ المجموع الفرعي (إذا كان هناك خصم) */}
      {discountAmount > 0 && rentalType !== "ownership" ? (
        <>
          {/* السعر الأصلي مع خط وسط */}
          <View style={styles.discountDetailRow}>
            <View style={styles.discountLeft}>
              <Text style={styles.strikethrough}>
                {originalRate.toFixed(2)} {t.sar}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  -{carDiscountPercentage}%
                </Text>
              </View>
            </View>
            <Text style={styles.rateValue}>
              {dailyRate.toFixed(2)} {t.sar}
            </Text>
          </View>

          <InfoRow
            label={t.subtotal}
            value={`${totalAmount.toFixed(2)} ${t.sar}`}
            showSeparator={true}
          />

          <InfoRow
            label={`${t.discount} (${carDiscountPercentage}%)`}
            value={`-${discountAmount.toFixed(2)} ${t.sar}`}
            valueStyle={{ color: colors.success, fontFamily: fonts.Bold }}
            showSeparator={false}
          />
        </>
      ) : (
        /* ✅ بدون خصم - عرض مباشر */
        <InfoRow
          label={t.subtotal}
          value={`${totalAmount.toFixed(2)} ${t.sar}`}
          showSeparator={false}
        />
      )}

      {/* ✅ المبلغ النهائي */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t.finalAmount}</Text>
        <Text style={styles.totalValue}>
          {finalAmount.toFixed(2)} {t.sar}
        </Text>
      </View>

      {/* ✅ ملاحظة التمليك */}
      {rentalType === "ownership" && (
        <Text style={styles.ownershipNote}>{t.ownershipNote}</Text>
      )}
    </Section>
  );
}
