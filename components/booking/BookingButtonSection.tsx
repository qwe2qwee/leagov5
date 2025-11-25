// components/booking/BookingButtonSection.tsx
import BookingButton from "@/components/booking/BookingButton";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

interface Texts {
  processing: string;
  confirmBooking: string;
  riyal: string;
  customerInfo: string;
  name: string;
  email: string;
  phone: string;
}

interface BookingButtonSectionProps {
  loading: boolean;
  disabled: boolean;
  onSubmit: () => void;
  userProfile: UserProfile | null;
  totalPrice: number;
  texts: Texts;
}

const BookingButtonSection: React.FC<BookingButtonSectionProps> = ({
  loading,
  disabled,
  onSubmit,
  userProfile,
  totalPrice,
  texts,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();

  const styles = StyleSheet.create({
    container: {
      marginTop: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginBottom: responsive.safeAreaBottom + responsive.spacing.md + responsive.spacing.md + responsive.spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <BookingButton
        loading={loading}
        disabled={disabled}
        onSubmit={onSubmit}
        userProfile={userProfile as any}
        totalPrice={totalPrice}
        texts={texts}
      />
    </View>
  );
};

export default BookingButtonSection;
