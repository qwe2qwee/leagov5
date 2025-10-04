import { Card } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Image, StyleSheet, Text, View } from "react-native";

interface BookingSummaryProps {
  carName: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export default function BookingSummary({
  carName,
  imageUrl,
  startDate,
  endDate,
  totalDays,
  totalAmount,
  discountAmount,
  finalAmount,
}: BookingSummaryProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title: currentLanguage === "ar" ? "ملخص الحجز" : "Booking Summary",
    total: currentLanguage === "ar" ? "المجموع" : "Total",
    discount: currentLanguage === "ar" ? "الخصم" : "Discount",
    finalAmount: currentLanguage === "ar" ? "المبلغ الإجمالي" : "Final Amount",
    days: currentLanguage === "ar" ? "يوم" : "days",
    sar: currentLanguage === "ar" ? "ر.س" : "SAR",
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    title: {
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
      marginLeft: isRTL ? 0 : responsive.getResponsiveValue(10, 12, 16, 18, 20),
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
  });

  return (
    <View style={styles.container}>
      <Card type="default">
        <Card.Content>
          <Text style={styles.title}>{t.title}</Text>
          <View style={styles.carInfo}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.carImage}
              resizeMode="cover"
            />
            <View style={styles.carDetails}>
              <Text style={styles.carName}>{carName}</Text>
              <Text style={styles.carDate}>
                {startDate} - {endDate}
              </Text>
              <Text style={styles.carDays}>
                {totalDays} {t.days}
              </Text>
            </View>
          </View>
          <Separator />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t.total}</Text>
            <Text style={styles.priceValue}>
              {totalAmount} {t.sar}
            </Text>
          </View>
          {discountAmount > 0 && (
            <>
              <Separator />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t.discount}</Text>
                <Text style={[styles.priceValue, { color: colors.success }]}>
                  -{discountAmount} {t.sar}
                </Text>
              </View>
            </>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.finalAmount}</Text>
            <Text style={styles.totalValue}>
              {finalAmount} {t.sar}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}
