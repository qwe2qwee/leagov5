import { icons } from "@/constants";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface FinancialInfoCardProps {
  rentalType: "daily" | "weekly" | "monthly" | "ownership";
  dailyRate: number;
  totalDays: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  carDiscountPercentage?: number;
}

const FinancialInfoCard: React.FC<FinancialInfoCardProps> = ({
  rentalType,
  dailyRate,
  totalDays,
  totalAmount,
  discountAmount,
  finalAmount,
  carDiscountPercentage,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title:
      currentLanguage === "ar" ? "المعلومات المالية" : "Financial Information",
    dailyRate: currentLanguage === "ar" ? "السعر اليومي" : "Daily Rate",
    weeklyRate: currentLanguage === "ar" ? "السعر الأسبوعي" : "Weekly Rate",
    monthlyRate: currentLanguage === "ar" ? "السعر الشهري" : "Monthly Rate",
    ownershipPrice:
      currentLanguage === "ar" ? "سعر التمليك" : "Ownership Price",
    subtotal: currentLanguage === "ar" ? "المجموع الفرعي" : "Subtotal",
    discount: currentLanguage === "ar" ? "خصم العرض" : "Offer Discount",
    finalAmount: currentLanguage === "ar" ? "المبلغ النهائي" : "Final Amount",
    ownershipNote:
      currentLanguage === "ar"
        ? "* سعر التمليك ثابت بدون خصومات"
        : "* Ownership price is fixed without discounts",
    priceAfterDiscount:
      currentLanguage === "ar" ? "(بعد الخصم)" : "(after discount)",
  };

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

  const originalRate =
    discountAmount > 0 && rentalType !== "ownership"
      ? dailyRate / (1 - (carDiscountPercentage || 0) / 100)
      : dailyRate;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    header: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
    title: {
      fontSize: responsive.getFontSize(16, 18, 20),
      fontFamily: fonts.Bold,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
    },
    rateRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      backgroundColor: colors.primary + "10",
      paddingHorizontal: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
    rateLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.SemiBold,
      color: colors.primary,
    },
    rateValueContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    rateValue: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.Bold,
      color: colors.primary,
    },
    rateNote: {
      fontSize: responsive.getFontSize(11, 10, 12),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginTop: 2,
    },
    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    label: {
      fontSize: responsive.getFontSize(14, 15, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    value: {
      fontSize: responsive.getFontSize(14, 15, 16),
      fontFamily: fonts.SemiBold,
      color: colors.text,
    },
    discountDetailRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
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
      fontFamily: fonts.Bold,
      color: colors.success,
    },
    strikethroughContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    strikethrough: {
      fontSize: responsive.getFontSize(13, 12, 14),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textDecorationLine: "line-through",
    },
    totalRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingTop: responsive.getResponsiveValue(12, 16, 20, 22, 24),
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.Bold,
      color: colors.text,
    },
    totalValue: {
      fontSize: responsive.getFontSize(20, 18, 24),
      fontFamily: fonts.Bold,
      color: colors.primary,
    },
    ownershipNote: {
      fontSize: responsive.getFontSize(11, 10, 12),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      fontStyle: "italic",
    },
    icon: {
      width: responsive.getFontSize(14),
      height: responsive.getFontSize(14),
    },
    totalIcon: {
      width: responsive.getFontSize(18),
      height: responsive.getFontSize(18),
    },
  });

  const CurrencyIcon = ({
    color,
    size = "normal",
  }: {
    color: string;
    size?: "normal" | "large";
  }) => (
    <Image
      source={icons.riyalsymbol}
      style={[
        size === "large" ? styles.totalIcon : styles.icon,
        { tintColor: color },
      ]}
      resizeMode="contain"
    />
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
      </View>

      {/* Rate Row */}
      <View style={styles.rateRow}>
        <View>
          <Text style={styles.rateLabel}>{getRateLabel()}</Text>
          {discountAmount > 0 && rentalType !== "ownership" && (
            <Text style={styles.rateNote}>{t.priceAfterDiscount}</Text>
          )}
        </View>
        <View style={styles.rateValueContainer}>
          <Text style={styles.rateValue}>{dailyRate.toFixed(2)}</Text>
          <CurrencyIcon color={colors.primary} />
        </View>
      </View>

      {/* Details */}
      {discountAmount > 0 && rentalType !== "ownership" ? (
        <>
          <View style={styles.discountDetailRow}>
            <View style={styles.discountLeft}>
              <View style={styles.strikethroughContainer}>
                <Text style={styles.strikethrough}>
                  {originalRate.toFixed(2)}
                </Text>
                <CurrencyIcon color={colors.textSecondary} />
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  -{carDiscountPercentage}%
                </Text>
              </View>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{dailyRate.toFixed(2)}</Text>
              <CurrencyIcon color={colors.text} />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t.subtotal}</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{totalAmount.toFixed(2)}</Text>
              <CurrencyIcon color={colors.text} />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              {t.discount} ({carDiscountPercentage}%)
            </Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.value, { color: colors.success }]}>
                -{discountAmount.toFixed(2)}
              </Text>
              <CurrencyIcon color={colors.success} />
            </View>
          </View>
        </>
      ) : (
        <View style={styles.row}>
          <Text style={styles.label}>{t.subtotal}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{totalAmount.toFixed(2)}</Text>
            <CurrencyIcon color={colors.text} />
          </View>
        </View>
      )}

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t.finalAmount}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.totalValue}>{finalAmount.toFixed(2)}</Text>
          <CurrencyIcon color={colors.primary} size="large" />
        </View>
      </View>

      {/* Ownership Note */}
      {rentalType === "ownership" && (
        <Text style={styles.ownershipNote}>{t.ownershipNote}</Text>
      )}
    </View>
  );
};

export default FinancialInfoCard;
