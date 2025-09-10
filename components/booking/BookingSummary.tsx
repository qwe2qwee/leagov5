import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BestOffer {
  offer_source: string;
  offer_id: string | null;
  offer_name_ar: string | null;
  offer_name_en: string | null;
  discount_type: string;
  discount_value: number;
  original_price: number;
  discounted_price: number;
  savings_amount: number;
}

interface BookingSummaryProps {
  dailyPrice: number;
  actualDays: number;
  bestOffer: BestOffer | null;
  texts: {
    dailyPrice: string;
    numberOfDays: string;
    originalPrice: string;
    totalAmount: string;
    saved: string;
    days: string;
    riyal: string;
  };
}

export default function BookingSummary({
  dailyPrice,
  actualDays,
  bestOffer,
  texts,
}: BookingSummaryProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    priceRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    priceLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
    },
    priceValue: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.SemiBold || fonts.Regular,
      color: colors.text,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    totalRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    totalLabel: {
      fontSize: responsive.getFontSize(16, 15, 19),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
    },
    totalValue: {
      fontSize: responsive.getFontSize(16, 15, 19),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.primary,
    },
    savingsText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.success,
      textAlign: isRTL ? "right" : "left",
      marginTop: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
  });

  if (!bestOffer) {
    return null;
  }

  return (
    <View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>{texts.dailyPrice}</Text>
        <Text style={styles.priceValue}>
          {dailyPrice} {texts.riyal}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>{texts.numberOfDays}</Text>
        <Text style={styles.priceValue}>
          {actualDays} {texts.days}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>{texts.originalPrice}</Text>
        <Text style={styles.priceValue}>
          {bestOffer.original_price.toFixed(2)} {texts.riyal}
        </Text>
      </View>

      {bestOffer.savings_amount > 0 && (
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.error }]}>
            {bestOffer.offer_source === "car_offer" && bestOffer.offer_name_ar
              ? `${currentLanguage === "ar" ? "عرض:" : "Offer:"} ${
                  currentLanguage === "ar"
                    ? bestOffer.offer_name_ar
                    : bestOffer.offer_name_en
                }`
              : `${currentLanguage === "ar" ? "الخصم" : "Discount"} (${
                  bestOffer.discount_value
                }${
                  bestOffer.discount_type === "percentage"
                    ? "%"
                    : ` ${texts.riyal}`
                })`}
            :
          </Text>
          <Text style={[styles.priceValue, { color: colors.error }]}>
            -{bestOffer.savings_amount.toFixed(2)} {texts.riyal}
          </Text>
        </View>
      )}

      <View style={styles.separator} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{texts.totalAmount}</Text>
        <Text style={styles.totalValue}>
          {bestOffer.discounted_price.toFixed(2)} {texts.riyal}
        </Text>
      </View>

      {bestOffer.savings_amount > 0 && (
        <Text style={styles.savingsText}>
          {texts.saved} {bestOffer.savings_amount.toFixed(2)} {texts.riyal}
        </Text>
      )}
    </View>
  );
}
