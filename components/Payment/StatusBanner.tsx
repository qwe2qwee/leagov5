import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text, View } from "react-native";

interface StatusBannerProps {
  status: string;
}

export default function StatusBanner({ status }: StatusBannerProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage } = useLanguageStore();

  const t = {
    awaitingApproval:
      currentLanguage === "ar"
        ? "الحجز في انتظار موافقة الفرع. سيتم إشعارك عند الموافقة"
        : "Booking pending approval",
    approvedPayNow:
      currentLanguage === "ar"
        ? "تمت موافقة الفرع. يرجى إتمام الدفع"
        : "Approved. Please complete payment",
    processingPayment:
      currentLanguage === "ar"
        ? "جاري معالجة الدفع..."
        : "Payment processing...",
  };

  let bgColor = colors.background;
  let textColor = colors.text;
  let message = "";

  switch (status) {
    case "pending":
      bgColor = colors.warning + "20";
      textColor = colors.warning;
      message = t.awaitingApproval;
      break;
    case "confirmed":
      bgColor = colors.success + "20";
      textColor = colors.success;
      message = t.approvedPayNow;
      break;
    case "payment_pending":
      bgColor = colors.primary + "20";
      textColor = colors.primary;
      message = t.processingPayment;
      break;
    default:
      return null;
  }

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      padding: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      borderWidth: 1,
      backgroundColor: bgColor,
      borderColor: textColor,
    },
    text: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Medium || fonts.Regular,
      textAlign: "center",
      lineHeight: responsive.getFontSize(13, 12, 15) * 1.5,
      color: textColor,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}
