// components/booking/BookingCarSection.tsx
import BookingCarInfo from "@/components/booking/BookingCarInfo";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";

interface CarData {
  car_id: string;
  brand_name_ar: string;
  brand_name_en: string;
  model_name_ar: string;
  model_name_en: string;
  model_year: number;
  main_image_url: string;
  color_name_ar: string;
  color_name_en: string;
  daily_price: number;
  seats: number;
  fuel_type: string;
  transmission: string;
  is_new: boolean;
  discount_percentage: number;
  branch_name_ar: string;
  branch_name_en: string;
}

interface BookingCarSectionProps {
  car: CarData;
  cardTitle: string;
  newLabel: string;
  seatsLabel: string;
  riyalLabel: string;
}

const BookingCarSection: React.FC<BookingCarSectionProps> = ({
  car,
  cardTitle,
  newLabel,
  seatsLabel,
  riyalLabel,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();

  const styles = StyleSheet.create({
    container: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
  });

  return (
    <View style={styles.container}>
      <BookingCarInfo
        car={car}
        cardTitle={cardTitle}
        newLabel={newLabel}
        seatsLabel={seatsLabel}
        riyalLabel={riyalLabel}
      />
    </View>
  );
};

export default BookingCarSection;
