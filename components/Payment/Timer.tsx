import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text, View } from "react-native";

interface TimerProps {
  status: string;
  timeLeft?: number;
  formattedTime?: string;
}

export default function Timer({ status, timeLeft, formattedTime }: TimerProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage } = useLanguageStore();

  const t = {
    timeLeftToPay:
      currentLanguage === "ar" ? "الوقت المتبقي للدفع:" : "Time left to pay:",
    paymentTimeout:
      currentLanguage === "ar" ? "وقت إتمام الدفع:" : "Payment timeout:",
    hurryUp:
      currentLanguage === "ar" ? "يرجى الإسراع في الدفع!" : "Please hurry!",
  };

  if (!timeLeft) return null;

  const isUrgent = timeLeft < 3600;

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      padding: responsive.getResponsiveValue(14, 16, 20, 22, 24),
      backgroundColor: colors.primary + "10",
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: "center",
    },
    label: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.textSecondary,
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    value: {
      fontSize: responsive.getFontSize(24, 22, 28),
      fontFamily: fonts.Bold,
      color: colors.primary,
    },
    warning: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Medium,
      color: colors.error,
      marginTop: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {status === "confirmed" ? t.timeLeftToPay : t.paymentTimeout}
      </Text>
      <Text style={[styles.value, isUrgent && { color: colors.error }]}>
        {formattedTime}
      </Text>
      {isUrgent && <Text style={styles.warning}>{t.hurryUp}</Text>}
    </View>
  );
}
