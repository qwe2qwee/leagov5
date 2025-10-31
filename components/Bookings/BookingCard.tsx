// components/Bookings/BookingCard.tsx - UPDATED WITH TIMER
import { Badge } from "@/components/ui/Badge2";
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { icons } from "@/constants";
import { useBookingTimer } from "@/hooks/booking/useUserBookings";
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
  showTimer?: boolean; // جديد
  isCancelling?: boolean;
  translations: {
    from: string;
    to: string;
    sar: string;
    cancel: string;
    payNow: string;
    viewDetails: string; // جديد
    statusMessage?: string; // جديد
  };
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onCancel,
  onPay,
  showTimer = false,
  isCancelling,
  translations: t,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL, currentLanguage } = useLanguageStore();

  // العداد التنازلي
  const { formattedTime, isExpired, hoursLeft, minutesLeft } = useBookingTimer(
    showTimer ? booking.expires_at : null
  );

  const statusConfig = STATUS_CONFIG[booking.status];
  const carName = `${
    isRTL ? booking.car?.model?.name_ar : booking.car?.model?.brand?.name_en
  } ${
    isRTL ? booking.car?.model?.brand?.name_ar : booking.car?.model?.name_en
  }`;
  const imageUrl = booking.car?.model?.default_image_url;

  // تحديد لون العداد حسب الوقت المتبقي
  const getTimerColor = () => {
    if (isExpired) return colors.error;
    if (hoursLeft === 0 && minutesLeft < 10) return colors.error;
    if (hoursLeft < 2) return colors.warning;
    return colors.success;
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardWrapper: {
          marginBottom: responsive.spacing.md,
        },
        mainRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: responsive.spacing.md,
          justifyContent: "center",
          alignItems: "center",
        },
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
        contentSection: {
          flex: 1,
          justifyContent: "space-between",
          minWidth: 0,
        },
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
        statusRow: {
          marginBottom: responsive.spacing.xs,
          alignItems: isRTL ? "flex-end" : "flex-start",
        },
        // رسالة الحالة
        statusMessageContainer: {
          marginTop: responsive.spacing.xs,
          marginBottom: responsive.spacing.xs,
        },
        statusMessageText: {
          fontSize: responsive.getFontSize(12, 11, 13),
          fontFamily: fonts.Regular,
          color: colors.textSecondary,
          textAlign: isRTL ? "right" : "left",
          lineHeight: Math.round(responsive.getFontSize(12, 11, 13) * 1.4),
        },
        // العداد التنازلي
        timerContainer: {
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          backgroundColor: colors.backgroundSecondary,
          paddingHorizontal: responsive.spacing.sm,
          paddingVertical: responsive.spacing.xs,
          borderRadius: responsive.getBorderRadius("small"),
          gap: responsive.spacing.xs,
          marginBottom: responsive.spacing.sm,
          borderWidth: 1,
          borderColor: getTimerColor(),
        },
        timerIcon: {
          marginRight: isRTL ? 0 : responsive.spacing.xxl,
          marginLeft: isRTL ? responsive.spacing.xxl : 0,
        },
        timerText: {
          fontSize: responsive.getFontSize(13, 12, 14),
          fontFamily: fonts.SemiBold,
          color: getTimerColor(),
        },
        timerLabel: {
          fontSize: responsive.getFontSize(11, 10, 12),
          fontFamily: fonts.Regular,
          color: colors.textSecondary,
        },
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
    [colors, responsive, fonts, isRTL, hoursLeft, minutesLeft, isExpired]
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

              {/* Status Message */}
              {t.statusMessage && (
                <View style={styles.statusMessageContainer}>
                  <Text style={styles.statusMessageText} numberOfLines={2}>
                    {t.statusMessage}
                  </Text>
                </View>
              )}

              {/* Timer (for confirmed and payment_pending) */}
              {showTimer && formattedTime && !isExpired && (
                <View style={styles.timerContainer}>
                  <Ionicons
                    name={hoursLeft < 1 ? "alarm-outline" : "time-outline"}
                    size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                    color={getTimerColor()}
                    style={styles.timerIcon}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timerText}>
                      {isRTL ? "باقي" : "Remaining"} {formattedTime}
                    </Text>
                    <Text style={styles.timerLabel}>
                      {booking.status === "confirmed"
                        ? isRTL
                          ? "لإتمام الدفع"
                          : "to complete payment"
                        : isRTL
                        ? "لإتمام عملية الدفع"
                        : "to finish payment process"}
                    </Text>
                  </View>
                </View>
              )}

              {/* Expired Warning */}
              {showTimer && isExpired && (
                <View
                  style={[
                    styles.timerContainer,
                    {
                      borderColor: colors.error,
                      backgroundColor: colors.backgroundSecondary,
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                    color={colors.error}
                    style={styles.timerIcon}
                  />
                  <Text style={[styles.timerText, { color: colors.error }]}>
                    {isRTL ? "انتهت المهلة" : "Time Expired"}
                  </Text>
                </View>
              )}

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
                  {/* زر الإلغاء - للحالات: pending, confirmed, payment_pending */}
                  {onCancel && (
                    <CustomButton
                      bgVariant="outline"
                      onPress={onCancel}
                      loading={isCancelling}
                      disabled={isCancelling}
                      style={{
                        paddingHorizontal: responsive.spacing.sm,
                        paddingVertical: responsive.spacing.xs,
                      }}
                    >
                      {t.cancel}
                    </CustomButton>
                  )}

                  {/* زر الدفع - للحالات: confirmed, payment_pending */}
                  {onPay && (
                    <CustomButton
                      bgVariant="primary"
                      onPress={onPay}
                      style={{
                        paddingHorizontal: responsive.spacing.md,
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
