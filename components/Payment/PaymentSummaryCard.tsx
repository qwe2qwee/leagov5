import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface PaymentSummaryCardProps {
  carName: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export default function PaymentSummaryCard({
  carName,
  imageUrl,
  startDate,
  endDate,
  totalDays,
  totalAmount,
  discountAmount,
  finalAmount,
}: PaymentSummaryCardProps) {
  const { colors, scheme } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    summary: currentLanguage === "ar" ? "ملخص الدفع" : "Payment Summary",
    total: currentLanguage === "ar" ? "المجموع" : "Total",
    discount: currentLanguage === "ar" ? "الخصم" : "Discount",
    final: currentLanguage === "ar" ? "الإجمالي للدفع" : "Total to Pay",
    days: currentLanguage === "ar" ? "يوم" : "days",
    sar: currentLanguage === "ar" ? "ر.س" : "SAR",
    rentalPeriod: currentLanguage === "ar" ? "فترة الإيجار" : "Rental Period",
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getBorderRadius("large"),
      padding: responsive.spacing.lg,
      marginBottom: responsive.spacing.xl,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: responsive.spacing.xl,
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      marginBottom: responsive.spacing.md,
      gap: responsive.spacing.sm,
    },
    headerTitle: {
      fontSize: responsive.getFontSize(18),
      fontFamily: fonts.Bold,
      color: colors.text,
    },
    carSection: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      marginBottom: responsive.spacing.md,
      backgroundColor: colors.background,
      padding: responsive.spacing.sm,
      borderRadius: responsive.getBorderRadius("medium"),
    },
    carImage: {
      width: 60,
      height: 60,
      borderRadius: responsive.getBorderRadius("small"),
      backgroundColor: colors.backgroundSecondary,
    },
    carInfo: {
      flex: 1,
      marginHorizontal: responsive.spacing.md,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    carName: {
      fontSize: responsive.getFontSize(16),
      fontFamily: fonts.Bold,
      color: colors.text,
      marginBottom: 4,
    },
    periodContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 6,
    },
    periodText: {
      fontSize: responsive.getFontSize(13),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: responsive.spacing.md,
    },
    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: responsive.spacing.sm,
    },
    label: {
      fontSize: responsive.getFontSize(15),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
    },
    value: {
      fontSize: responsive.getFontSize(15),
      fontFamily: fonts.Medium,
      color: colors.text,
    },
    finalRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: responsive.spacing.sm,
      paddingTop: responsive.spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    finalLabel: {
      fontSize: responsive.getFontSize(17),
      fontFamily: fonts.Bold,
      color: colors.text,
    },
    finalValue: {
      fontSize: responsive.getFontSize(20),
      fontFamily: fonts.Bold,
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="receipt-outline" size={24} color={colors.primary} />
        <Text style={styles.headerTitle}>{t.summary}</Text>
      </View>

      <View style={styles.carSection}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.carImage}
          resizeMode="cover"
        />
        <View style={styles.carInfo}>
          <Text style={styles.carName} numberOfLines={1}>
            {carName}
          </Text>
          <View style={styles.periodContainer}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.periodText}>
              {totalDays} {t.days} ({startDate})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t.total}</Text>
        <Text style={styles.value}>
          {totalAmount} <Text style={{ fontSize: 12 }}>{t.sar}</Text>
        </Text>
      </View>

      {discountAmount > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>{t.discount}</Text>
          <Text style={[styles.value, { color: colors.success }]}>
            - {discountAmount} <Text style={{ fontSize: 12 }}>{t.sar}</Text>
          </Text>
        </View>
      )}

      <View style={styles.finalRow}>
        <Text style={styles.finalLabel}>{t.final}</Text>
        <Text style={styles.finalValue}>
          {finalAmount} <Text style={{ fontSize: 14 }}>{t.sar}</Text>
        </Text>
      </View>
    </View>
  );
}
