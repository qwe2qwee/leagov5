// components/Bookings/BookingCard.tsx - REBUILT FROM SCRATCH
import { Badge } from "@/components/ui/Badge2";
import { Card } from "@/components/ui/Card";
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

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  onCancel?: () => void;
  onPay?: () => void;
  showTimer?: boolean;
  isCancelling?: boolean;
  translations: {
    from: string;
    to: string;
    sar: string;
    cancel: string;
    payNow: string;
    viewDetails: string;
    statusMessage?: string;
  };
}

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  onCancel,
  onPay,
  showTimer = false,
  isCancelling,
  translations: t,
}) => {
  // ═══════════════════════════════════════════════════════════
  // Hooks
  // ═══════════════════════════════════════════════════════════

  const { colors } = useTheme();
  const fonts = useFontFamily();
  const { isRTL, currentLanguage } = useLanguageStore();
  const { spacing, getFontSize, getBorderRadius } = useResponsive();

  // Timer Hook
  const { formattedTime, isExpired, hoursLeft, minutesLeft } = useBookingTimer(
    showTimer ? booking.expires_at : null
  );

  // ═══════════════════════════════════════════════════════════
  // Computed Values
  // ═══════════════════════════════════════════════════════════

  const statusConfig = STATUS_CONFIG[booking.status];

  // Car Information
  const carInfo = useMemo(() => {
    const brand = isRTL
      ? booking.car?.model?.brand?.name_ar
      : booking.car?.model?.brand?.name_en;
    const model = isRTL
      ? booking.car?.model?.name_ar
      : booking.car?.model?.name_en;

    return {
      name: `${brand || ""} ${model || ""}`.trim(),
      image: booking.car?.model?.default_image_url,
    };
  }, [booking.car, isRTL]);

  // Date Information (Compact Format)
  const dateInfo = useMemo(() => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    };

    return {
      start: formatDate(booking.start_date),
      end: formatDate(booking.end_date),
      days: booking.total_days,
    };
  }, [booking.start_date, booking.end_date, booking.total_days, isRTL]);

  // Timer Status (Colors & Urgency)
  const timerStatus = useMemo(() => {
    if (isExpired) return { color: colors.error, isUrgent: true };
    if (hoursLeft === 0 && minutesLeft < 10)
      return { color: colors.error, isUrgent: true };
    if (hoursLeft < 2) return { color: colors.warning, isUrgent: false };
    return { color: colors.success, isUrgent: false };
  }, [isExpired, hoursLeft, minutesLeft, colors]);

  // Show Status Badge on Image (only for inactive states)
  const showBadgeOnImage =
    booking.status === "expired" || booking.status === "cancelled";

  // ═══════════════════════════════════════════════════════════
  // Styles
  // ═══════════════════════════════════════════════════════════

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Card Wrapper
        cardWrapper: {
          marginBottom: spacing.md,
        },

        // Override Card.Content default padding
        cardContentOverride: {
          paddingHorizontal: 0,
          paddingBottom: 0,
        },

        // Main Container (with custom padding)
        container: {
          padding: spacing.md,
        },

        // Layout: Horizontal (Image + Content)
        row: {
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: spacing.md,
        },

        // ═══ Image Section ═══
        imageWrapper: {
          width: 90,
          height: 90,
          borderRadius: getBorderRadius("medium"),
          overflow: "hidden",
          backgroundColor: colors.backgroundSecondary,
          position: "relative",
        },
        image: {
          width: "100%",
          height: "100%",
          resizeMode: "cover",
        },
        badgeOnImage: {
          position: "absolute",
          bottom: spacing.xs - 2,
          [isRTL ? "right" : "left"]: spacing.xs - 2,
          transform: [{ scale: 0.85 }], // Make badge smaller
        },
        badgeInline: {
          transform: [{ scale: 0.85 }], // Make badge smaller
        },
        actionsRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: spacing.xs,
          flexShrink: 0,
        },
        buttonWrapper: {
          flex: 1, // Equal width for both buttons
          maxWidth: 80, // Max 120px per button
        },
        buttonText: {
          fontSize: getFontSize(5), // Smaller text (11px)
          fontFamily: fonts.Medium,
        },

        // ═══ Content Section ═══
        content: {
          flex: 1,
          justifyContent: "space-between",
          minWidth: 0,
        },

        // Top Section
        topSection: {
          gap: spacing.xs - 2,
        },

        // Car Name Row
        carNameRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: spacing.xs,
          marginBottom: spacing.xs - 4,
        },
        carName: {
          flex: 1,
          fontSize: getFontSize(15),
          fontFamily: fonts.Bold,
          color: colors.text,
          textAlign: isRTL ? "right" : "left",
          letterSpacing: -0.2,
        },

        // Date Row
        dateRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          gap: spacing.xs - 2,
          marginBottom: spacing.xs - 2,
        },
        dateText: {
          fontSize: getFontSize(11),
          fontFamily: fonts.Regular,
          color: colors.textSecondary,
        },
        dateArrow: {
          marginHorizontal: 2,
        },
        dateDivider: {
          width: 3,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: colors.textSecondary,
        },
        daysText: {
          fontSize: getFontSize(11),
          fontFamily: fonts.SemiBold,
          color: colors.primary,
        },

        // Timer Row
        timerRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          gap: spacing.xs - 2,
          backgroundColor: timerStatus.color + "15",
          paddingVertical: spacing.xs - 2,
          paddingHorizontal: spacing.xs,
          borderRadius: getBorderRadius("small"),
          borderLeftWidth: isRTL ? 0 : 3,
          borderRightWidth: isRTL ? 3 : 0,
          borderColor: timerStatus.color,
          marginTop: spacing.xs - 4,
        },
        timerText: {
          fontSize: getFontSize(11),
          fontFamily: fonts.Bold,
          color: timerStatus.color,
          letterSpacing: 0.5,
        },

        // Bottom Section
        bottomSection: {
          flexDirection: isRTL ? "row-reverse" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: spacing.sm,
          marginTop: spacing.xs,
        },

        // Price
        priceRow: {
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          gap: spacing.xs - 2,
        },
        priceText: {
          fontSize: getFontSize(18),
          fontFamily: fonts.Bold,
          color: colors.primary,
          letterSpacing: -0.3,
        },
        riyalIcon: {
          width: getFontSize(12),
          height: getFontSize(12),
          tintColor: colors.primary,
        },
      }),
    [colors, spacing, fonts, isRTL, timerStatus, getFontSize, getBorderRadius]
  );

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.cardWrapper}
    >
      <Card>
        <Card.Content style={styles.cardContentOverride}>
          <View style={styles.container}>
            <View style={styles.row}>
              {/* ═══════════════════════════════════════════════════════════
                  IMAGE SECTION
              ═══════════════════════════════════════════════════════════ */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{
                    uri: carInfo.image || "https://via.placeholder.com/90",
                  }}
                  style={styles.image}
                />

                {/* Badge on Image (for expired/cancelled only) */}
                {showBadgeOnImage && (
                  <View style={styles.badgeOnImage}>
                    <Badge variant={statusConfig.variant} size="sm">
                      {statusConfig.label[currentLanguage]}
                    </Badge>
                  </View>
                )}
              </View>

              {/* ═══════════════════════════════════════════════════════════
                  CONTENT SECTION
              ═══════════════════════════════════════════════════════════ */}
              <View style={styles.content}>
                {/* Top Section */}
                <View style={styles.topSection}>
                  {/* Car Name + Status Badge */}
                  <View style={styles.carNameRow}>
                    <Text style={styles.carName} numberOfLines={1}>
                      {carInfo.name || t.viewDetails}
                    </Text>

                    {/* Status Badge (inline for active states) */}
                    {!showBadgeOnImage && (
                      <View style={styles.badgeInline}>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label[currentLanguage]}
                        </Badge>
                      </View>
                    )}
                  </View>

                  {/* Date + Duration Row */}
                  <View style={styles.dateRow}>
                    <Text style={styles.dateText}>{dateInfo.start}</Text>
                    <Ionicons
                      name={isRTL ? "arrow-back" : "arrow-forward"}
                      size={10}
                      color={colors.textSecondary}
                      style={styles.dateArrow}
                    />
                    <Text style={styles.dateText}>{dateInfo.end}</Text>
                    <View style={styles.dateDivider} />
                    <Text style={styles.daysText}>
                      {dateInfo.days} {isRTL ? "يوم" : "d"}
                    </Text>
                  </View>

                  {/* Timer (if applicable and not expired) */}
                  {showTimer && formattedTime && !isExpired && (
                    <View style={styles.timerRow}>
                      <Ionicons
                        name={timerStatus.isUrgent ? "alarm" : "time"}
                        size={14}
                        color={timerStatus.color}
                      />
                      <Text style={styles.timerText}>{formattedTime}</Text>
                    </View>
                  )}

                  {/* Expired Warning */}
                  {showTimer && isExpired && (
                    <View style={styles.timerRow}>
                      <Ionicons
                        name="alert-circle"
                        size={14}
                        color={colors.error}
                      />
                      <Text style={[styles.timerText, { color: colors.error }]}>
                        {isRTL ? "منتهي" : "Expired"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bottom Section - Price + Actions */}
                <View style={styles.bottomSection}>
                  {/* Price */}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{booking.final_amount}</Text>
                    <Image
                      source={icons.riyalsymbol}
                      resizeMode="contain"
                      style={styles.riyalIcon}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════

export default BookingCard;
