// components/booking/BookingFormSection.tsx
import BookingForm from "@/components/booking/BookingForm";
import { Card } from "@/components/ui/Card";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet } from "react-native";

interface BookingFormData {
  startDate: string;
  endDate: string;
  rentalType: "daily" | "weekly" | "monthly";
  duration: number;
}

interface RentalTypeOption {
  value: string;
  label: string;
}

interface Prices {
  daily: number;
  weekly: number;
  monthly: number;
}

interface Texts {
  rentalType: string;
  duration: string;
  rentalDate: string;
  startDate: string;
  selectRentalType: string;
  selectWeeks: string;
  selectMonths: string;
  tapToSelectDate: string;
  totalPrice: string;
}

interface BookingFormSectionProps {
  formData: BookingFormData;
  onFormDataChange: (data: Partial<BookingFormData>) => void;
  onOpenCalendar: () => void;
  availableRentalTypes: RentalTypeOption[];
  prices: Prices;
  cardTitle: string;
  texts: Texts;
}

const BookingFormSection: React.FC<BookingFormSectionProps> = ({
  formData,
  onFormDataChange,
  onOpenCalendar,
  availableRentalTypes,
  prices,
  cardTitle,
  texts,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();

  const styles = StyleSheet.create({
    container: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
  });

  return (
    <Card style={styles.container}>
      <Card.Header>
        <Card.Title size="md">{cardTitle}</Card.Title>
      </Card.Header>
      <Card.Content>
        <BookingForm
          formData={formData}
          onFormDataChange={onFormDataChange}
          onOpenCalendar={onOpenCalendar}
          availableRentalTypes={availableRentalTypes}
          prices={prices}
          texts={texts}
        />
      </Card.Content>
    </Card>
  );
};

export default BookingFormSection;
