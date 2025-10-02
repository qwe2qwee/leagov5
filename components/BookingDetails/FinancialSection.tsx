import InfoRow from "@/components/BookingDetails/InfoRow";
import Section from "@/components/BookingDetails/Section";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text, View } from "react-native";

interface FinancialSectionProps {
  dailyRate: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export default function FinancialSection({
  dailyRate,
  totalAmount,
  discountAmount,
  finalAmount,
}: FinancialSectionProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title:
      currentLanguage === "ar" ? "المعلومات المالية" : "Financial Information",
    dailyRate: currentLanguage === "ar" ? "السعر اليومي" : "Daily Rate",
    total: currentLanguage === "ar" ? "المجموع" : "Total",
    discount: currentLanguage === "ar" ? "الخصم" : "Discount",
    finalAmount: currentLanguage === "ar" ? "المبلغ النهائي" : "Final Amount",
    sar: currentLanguage === "ar" ? "ر.س" : "SAR",
  };

  const styles = StyleSheet.create({
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
  });

  return (
    <Section title={t.title}>
      <InfoRow label={t.dailyRate} value={`${dailyRate} ${t.sar}`} />
      <InfoRow
        label={t.total}
        value={`${totalAmount} ${t.sar}`}
        showSeparator={discountAmount > 0}
      />

      {discountAmount > 0 && (
        <InfoRow
          label={t.discount}
          value={`-${discountAmount} ${t.sar}`}
          valueStyle={{ color: colors.success }}
          showSeparator={false}
        />
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t.finalAmount}</Text>
        <Text style={styles.totalValue}>
          {finalAmount} {t.sar}
        </Text>
      </View>
    </Section>
  );
}
