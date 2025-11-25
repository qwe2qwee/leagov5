// components/booking/BookingHeader.tsx
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";

interface BookingHeaderProps {
  title: string;
  onBack: () => void;
}

const BookingHeader: React.FC<BookingHeaderProps> = ({ title, onBack }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();

  const styles = StyleSheet.create({
    container: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} onBack={onBack} />
    </View>
  );
};

export default BookingHeader;
