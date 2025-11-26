import CustomButton from "@/components/ui/CustomButton";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, View } from "react-native";

interface ActionButtonsProps {
  status: string;
  isExpired: boolean;
  isCancelling: boolean;
  onPayNow: () => void;
  onCallBranch: () => void;
  onCancel: () => void;
}

export default function ActionButtons({
  status,
  isExpired,
  isCancelling,
  onPayNow,
  onCallBranch,
  onCancel,
}: ActionButtonsProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { currentLanguage } = useLanguageStore();

  const t = {
    payNow: currentLanguage === "ar" ? "ادفع الآن" : "Pay Now",
    callBranch: currentLanguage === "ar" ? "اتصل بالفرع" : "Call Branch",
    cancelBooking: currentLanguage === "ar" ? "إلغاء الحجز" : "Cancel Booking",
    cancelling: currentLanguage === "ar" ? "جاري الإلغاء..." : "Cancelling...",
  };

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      
      right: 0,
      backgroundColor: colors.surface,
      padding: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      paddingBottom:
        responsive.safeAreaBottom +
        responsive.getResponsiveValue(12, 16, 20, 24, 28),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
  });

  return (
    <View style={styles.container}>
      {["confirmed", "payment_pending"].includes(status) && !isExpired && (
        <CustomButton title={t.payNow} bgVariant="success" onPress={onPayNow} />
      )}
      {["active", "confirmed"].includes(status) && (
        <CustomButton
          title={t.callBranch}
          bgVariant="primary"
          onPress={onCallBranch}
        />
      )}
      {status === "pending" && (
        <CustomButton
          title={isCancelling ? t.cancelling : t.cancelBooking}
          bgVariant="outline"
          textVariant="primary"
          onPress={onCancel}
          disabled={isCancelling}
        />
      )}
    </View>
  );
}
