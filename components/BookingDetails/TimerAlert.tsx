import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text, View } from "react-native";

interface TimerAlertProps {
  formattedTime?: string;
  isExpired: boolean;
}

export default function TimerAlert({
  formattedTime,
  isExpired,
}: TimerAlertProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage } = useLanguageStore();

  const t = {
    timeLeft:
      currentLanguage === "ar" ? "الوقت المتبقي للدفع" : "Time Left to Pay",
    pleasePayBefore:
      currentLanguage === "ar"
        ? "يرجى إتمام الدفع قبل انتهاء الوقت"
        : "Please complete payment before time expires",
    bookingExpired:
      currentLanguage === "ar" ? "انتهت صلاحية الحجز" : "Booking has expired",
  };

  const styles = StyleSheet.create({
    timerAlert: {
      backgroundColor: colors.warning + "20",
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      padding: responsive.getResponsiveValue(14, 16, 20, 22, 24),
      borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      borderWidth: 1,
      borderColor: colors.warning,
      alignItems: "center",
    },
    timerTitle: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.warning,
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    timerValue: {
      fontSize: responsive.getFontSize(28, 26, 32),
      fontFamily: fonts.Bold || fonts.SemiBold,
      color: colors.warning,
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    timerSubtext: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Regular,
      color: colors.warning,
      textAlign: "center",
    },
    expiredAlert: {
      backgroundColor: colors.error + "20",
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      padding: responsive.getResponsiveValue(14, 16, 20, 22, 24),
      borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      borderWidth: 1,
      borderColor: colors.error,
      alignItems: "center",
    },
    expiredText: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.SemiBold || fonts.Medium,
      color: colors.error,
    },
  });

  if (isExpired) {
    return (
      <View style={styles.expiredAlert}>
        <Text style={styles.expiredText}>{t.bookingExpired}</Text>
      </View>
    );
  }

  if (formattedTime) {
    return (
      <View style={styles.timerAlert}>
        <Text style={styles.timerTitle}>{t.timeLeft}</Text>
        <Text style={styles.timerValue}>{formattedTime}</Text>
        <Text style={styles.timerSubtext}>{t.pleasePayBefore}</Text>
      </View>
    );
  }

  return null;
}
