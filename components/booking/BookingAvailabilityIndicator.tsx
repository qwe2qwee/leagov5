// components/booking/BookingAvailabilityIndicator.tsx
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface AvailabilityData {
  isAvailable?: boolean;
  message?: string;
}

interface BookingAvailabilityIndicatorProps {
  availability: AvailabilityData | null;
  isCheckingAvailability: boolean;
  startDate: string;
  endDate: string;
  checkingText: string;
}

const BookingAvailabilityIndicator: React.FC<
  BookingAvailabilityIndicatorProps
> = ({
  availability,
  isCheckingAvailability,
  startDate,
  endDate,
  checkingText,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    availabilityContainer: {
      marginTop: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      padding: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      borderRadius: 12,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 10,
    },
    availabilityAvailable: {
      backgroundColor: colors.success + "15",
      borderWidth: 1,
      borderColor: colors.success + "40",
    },
    availabilityNotAvailable: {
      backgroundColor: colors.error + "15",
      borderWidth: 1,
      borderColor: colors.error + "40",
    },
    availabilityChecking: {
      backgroundColor: colors.primary + "10",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    availabilityText: {
      flex: 1,
      fontSize: responsive.getFontSize(14, 13, 16),
    },
    availabilityTextAvailable: {
      color: colors.success,
    },
    availabilityTextNotAvailable: {
      color: colors.error,
    },
    availabilityTextChecking: {
      color: colors.primary,
    },
  });

  if (!startDate || !endDate) {
    return null;
  }

  return (
    <View
      style={[
        styles.availabilityContainer,
        isCheckingAvailability
          ? styles.availabilityChecking
          : availability?.isAvailable === true
          ? styles.availabilityAvailable
          : availability?.isAvailable === false
          ? styles.availabilityNotAvailable
          : styles.availabilityChecking,
      ]}
    >
      {isCheckingAvailability ? (
        <>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text
            style={[styles.availabilityText, styles.availabilityTextChecking]}
          >
            {checkingText}
          </Text>
        </>
      ) : availability?.isAvailable === true ? (
        <>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text
            style={[styles.availabilityText, styles.availabilityTextAvailable]}
          >
            {availability.message}
          </Text>
        </>
      ) : availability?.isAvailable === false ? (
        <>
          <Ionicons name="close-circle" size={24} color={colors.error} />
          <Text
            style={[
              styles.availabilityText,
              styles.availabilityTextNotAvailable,
            ]}
          >
            {availability.message}
          </Text>
        </>
      ) : null}
    </View>
  );
};

export default BookingAvailabilityIndicator;
