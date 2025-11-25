// components/booking/BookingSummarySection.tsx
import BookingSummary from "@/components/booking/BookingSummary";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";

interface PricePreview {
  price_per_unit: number;
  total_days: number;
  discount_percentage: number;
  total_amount: number;
  final_price: number;
  discount_amount: number;
}

interface Texts {
  dailyPrice: string;
  numberOfDays: string;
  originalPrice: string;
  totalAmount: string;
  saved: string;
  days: string;
  riyal: string;
}

interface BookingSummarySectionProps {
  pricePreview: PricePreview | null;
  texts: Texts;
}

const BookingSummarySection: React.FC<BookingSummarySectionProps> = ({
  pricePreview,
  texts,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();

  const styles = StyleSheet.create({
    container: {
      marginTop: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
  });

  if (!pricePreview) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BookingSummary
        dailyPrice={pricePreview.price_per_unit}
        actualDays={pricePreview.total_days}
        bestOffer={{
          offer_source: "direct_discount",
          offer_id: null,
          offer_name_ar: null,
          offer_name_en: null,
          discount_type: "percentage",
          discount_value: pricePreview.discount_percentage,
          original_price: pricePreview.total_amount,
          discounted_price: pricePreview.final_price,
          savings_amount: pricePreview.discount_amount,
        }}
        texts={texts}
      />
    </View>
  );
};

export default BookingSummarySection;
