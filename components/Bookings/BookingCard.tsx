// components/Bookings/BookingCard.tsx - IMPROVED LAYOUT
import { Badge } from "@/components/ui/Badge2";
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { icons } from "@/constants";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Booking } from "./types";
import { STATUS_CONFIG } from "./types";

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  onCancel?: () => void;
  onPay?: () => void;
  isCancelling?: boolean;
  translations: {
    from: string;
    to: string;
    sar: string;
    cancel: string;
    payNow: string;
  };
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onCancel,
  onPay,
  isCancelling,
  translations: t,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();

  const fonts = useFontFamily();
  const { isRTL, currentLanguage } = useLanguageStore();

  const statusConfig = STATUS_CONFIG[booking.status];
  const carName = `${
    isRTL ? booking.car?.model?.name_ar : booking.car?.model?.brand?.name_en
  } ${
    isRTL ? booking.car?.model?.brand?.name_ar : booking.car?.model?.name_en
  }`;
  const imageUrl = booking.car?.model?.default_image_url;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Card wrapper
        cardWrapper: {
          marginBottom: responsive.spacing.md,
        },

        // Main horizontal layout: Image | Content
        mainRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: responsive.spacing.md,
          justifyContent: "center",
          alignItems: "center",
        },

        // Left side: Car image
        imageSection: {
          width: responsive.getResponsiveValue(100, 110, 120, 130, 140),
          height: responsive.getResponsiveValue(100, 110, 120, 130, 140),
          borderRadius: responsive.getBorderRadius("medium"),
          overflow: "hidden",
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.border,
          flexShrink: 0,
        },
        carImage: {
          width: "100%",
          height: "100%",
        },

        // Right side: All content
        contentSection: {
          flex: 1,
          justifyContent: "space-between",
          minWidth: 0,
        },

        // Row 1: Car name
        nameRow: {
          marginBottom: responsive.spacing.xs,
        },
        carNameText: {
          fontSize: responsive.getFontSize(17, 16, 19),
          fontFamily: fonts.Bold || fonts.SemiBold,
          color: colors.text,
          lineHeight: Math.round(responsive.getFontSize(17, 16, 19) * 1.35),
          textAlign: isRTL ? "right" : "left",
        },

        // Row 2: Status badge
        statusRow: {
          marginBottom: responsive.spacing.sm,
          alignItems: isRTL ? "flex-end" : "flex-start",
        },

        // Row 3: Date info
        dateInfoRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          gap: responsive.spacing.xs,
          marginBottom: responsive.spacing.md,
        },
        dateInfoText: {
          fontSize: responsive.getFontSize(14, 13, 16),
          fontFamily: fonts.Regular,
          color: colors.textSecondary,
          lineHeight: Math.round(responsive.getFontSize(14, 13, 16) * 1.3),
          flex: 1,
          textAlign: isRTL ? "right" : "left",
        },

        // Row 4: Price and actions
        actionRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: responsive.spacing.sm,
          marginTop: responsive.spacing.xs,
        },
        priceText: {
          fontSize: responsive.getFontSize(20, 19, 23),
          fontFamily: fonts.Bold || fonts.SemiBold,
          color: colors.primary,
        },
        actionsContainer: {
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: responsive.spacing.xs,
          flexShrink: 0,
        },
      }),
    [colors, responsive, fonts, isRTL]
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.cardWrapper}
    >
      <Card>
        <Card.Content
          style={{
            paddingTop: responsive.spacing.sm,
          }}
        >
          <View style={styles.mainRow}>
            {/* LEFT: Car Image */}
            <View style={styles.imageSection}>
              <Image
                source={{
                  uri: imageUrl || "https://via.placeholder.com/150",
                }}
                style={styles.carImage}
                resizeMode="cover"
              />
            </View>

            {/* RIGHT: Content Stack */}
            <View style={styles.contentSection}>
              {/* Car Name */}
              <View style={styles.nameRow}>
                <Text style={styles.carNameText} numberOfLines={2}>
                  {carName}
                </Text>
              </View>

              {/* Status Badge */}
              <View style={styles.statusRow}>
                <Badge variant={statusConfig.variant} size="sm">
                  {statusConfig.label[currentLanguage]}
                </Badge>
              </View>

              {/* Date Information */}
              <View style={styles.dateInfoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                  color={colors.textSecondary}
                />
                <Text style={styles.dateInfoText} numberOfLines={1}>
                  {t.from} {booking.start_date} • {t.to} {booking.end_date}
                </Text>
              </View>

              {/* Price + Action Buttons */}
              <View style={styles.actionRow}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.priceText}>{booking.final_amount}</Text>
                  <Image
                    source={icons.riyalsymbol}
                    resizeMode="contain"
                    style={{
                      width: responsive.getFontSize(12),
                      height: responsive.getFontSize(12),
                      marginLeft: responsive.getFontSize(2),
                      tintColor: colors.primary,
                    }}
                  />
                </View>

                <View style={styles.actionsContainer}>
                  {booking.status === "pending" && onCancel && (
                    <CustomButton
                      bgVariant="outline"
                      onPress={onCancel}
                      loading={isCancelling}
                      style={{
                        paddingHorizontal: responsive.spacing.sm,
                        paddingVertical: responsive.spacing.xs,
                      }}
                    >
                      {t.cancel}
                    </CustomButton>
                  )}

                  {booking.status === "confirmed" && onPay && (
                    <CustomButton
                      bgVariant="primary"
                      onPress={onPay}
                      style={{
                        paddingHorizontal: responsive.spacing.sm,
                        paddingVertical: responsive.spacing.xs,
                      }}
                    >
                      {t.payNow}
                    </CustomButton>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};
