import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Mail, Phone, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface UserProfile {
  name: string;
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
  const theme = useTheme();
  const { colors, scheme } = theme;
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL, currentLanguage } = useLanguageStore();

  const styles = StyleSheet.create({
    card: {
      marginBottom: responsive.spacing.lg,
    },
    infoRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "flex-start",
      gap: responsive.spacing.md,
      paddingVertical: responsive.spacing.sm,
      paddingHorizontal: responsive.spacing.md,
      backgroundColor:
        scheme === "dark"
          ? colors.backgroundSecondary
          : colors.backgroundTertiary,
      borderRadius: responsive.getBorderRadius("medium"),
      marginBottom: responsive.spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: responsive.typography.caption,
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.textSecondary,
      marginBottom: responsive.spacing.xs / 2,
      textAlign: isRTL ? "right" : "left",
    },
    infoValue: {
      fontSize: responsive.typography.body,
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      lineHeight: responsive.typography.body * 1.3,
    },
  });

  return (
    <View>
      {/* User Info Display */}
      {userProfile && (
        <Card style={styles.card}>
          <Card.Header>
            <Card.Title size="md">{texts.customerInfo}</Card.Title>
          </Card.Header>
          <Card.Content>
            {/* Name */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <User
                  size={responsive.getIconSize("small")}
                  color={colors.primary}
                  strokeWidth={2.5}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{texts.name}</Text>
                <Text style={styles.infoValue}>{userProfile.name}</Text>
              </View>
            </View>

            {/* Email */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Mail
                  size={responsive.getIconSize("small")}
                  color={colors.primary}
                  strokeWidth={2.5}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{texts.email}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {userProfile.email}
                </Text>
              </View>
            </View>

            {/* Phone */}
            {userProfile.phone && (
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Phone
                    size={responsive.getIconSize("small")}
                    color={colors.primary}
                    strokeWidth={2.5}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{texts.phone}</Text>
                  <Text style={styles.infoValue}>{userProfile.phone}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Submit Button */}
      <CustomButton
        title={
          loading
            ? texts.processing
            : `${texts.confirmBooking} - ${totalPrice.toLocaleString()} ${
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
