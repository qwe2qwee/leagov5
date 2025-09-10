import CustomButton from "@/components/ui/CustomButton";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface UserProfile {
  full_name: string;
  phone?: string;
  email: string;
}

interface BookingButtonProps {
  loading: boolean;
  disabled: boolean;
  onSubmit: () => void;
  userProfile: UserProfile | null;
  texts: {
    processing: string;
    confirmBooking: string;
    riyal: string;
    customerInfo: string;
    name: string;
    email: string;
    phone: string;
  };
  totalPrice: number;
}

export default function BookingButton({
  loading,
  disabled,
  onSubmit,
  userProfile,
  texts,
  totalPrice,
}: BookingButtonProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    userInfo: {
      backgroundColor: colors.backgroundSecondary,
      padding: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    userInfoTitle: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Medium || fonts.SemiBold || fonts.Regular,
      color: colors.textSecondary,
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      textAlign: isRTL ? "right" : "left",
    },
    userInfoRow: {
      marginBottom: responsive.getResponsiveValue(2, 3, 4, 5, 6),
    },
    userInfoText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
    },
  });

  return (
    <View>
      {/* User Info Display */}
      {userProfile && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoTitle}>{texts.customerInfo}</Text>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoText}>
              <Text style={{ fontFamily: fonts.Medium || fonts.SemiBold }}>
                {texts.name}
              </Text>{" "}
              {userProfile.full_name}
            </Text>
          </View>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoText}>
              <Text style={{ fontFamily: fonts.Medium || fonts.SemiBold }}>
                {texts.email}
              </Text>{" "}
              {userProfile.email}
            </Text>
          </View>
          {userProfile.phone && (
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoText}>
                <Text style={{ fontFamily: fonts.Medium || fonts.SemiBold }}>
                  {texts.phone}
                </Text>{" "}
                {userProfile.phone}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Submit Button */}
      <CustomButton
        title={
          loading
            ? texts.processing
            : `${texts.confirmBooking} - ${totalPrice.toFixed(2)} ${
                texts.riyal
              }`
        }
        onPress={onSubmit}
        loading={loading}
        disabled={disabled}
        bgVariant="primary"
      />
    </View>
  );
}
