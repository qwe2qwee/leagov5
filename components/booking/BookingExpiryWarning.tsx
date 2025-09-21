import { Badge } from "@/components/ui/Badge2";
import { useBookingTimer } from "@/hooks/booking/useBookingTimer";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/store/useToastStore";
import React from "react";
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface BookingExpiryWarningProps {
  bookingId?: string;
  expiresAt?: string | null;
  onRebook?: () => void;
  style?: ViewStyle;
}

export function BookingExpiryWarning({
  bookingId,
  expiresAt,
  onRebook,
  style,
}: BookingExpiryWarningProps) {
  const {
    timeRemaining,
    isExpired,
    formatTime,
    warningLevel,
    runCleanup,
    isLoading,
  } = useBookingTimer(bookingId, expiresAt);

  const toast = useToast();
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();

  // Don't render if no expiry data
  if (!expiresAt || (!timeRemaining && !isExpired)) {
    return null;
  }

  const getAlertColors = () => {
    const { colors } = theme;

    if (isExpired) {
      return {
        backgroundColor: `${colors.error}15`, // 15% opacity
        borderColor: colors.error,
        iconColor: colors.error,
        textColor: colors.text,
      };
    }

    if (warningLevel === "critical") {
      return {
        backgroundColor: `${colors.error}15`,
        borderColor: colors.error,
        iconColor: colors.error,
        textColor: colors.text,
      };
    }

    if (warningLevel === "warning") {
      return {
        backgroundColor: `${colors.warning}15`,
        borderColor: colors.warning,
        iconColor: colors.warning,
        textColor: colors.text,
      };
    }

    return {
      backgroundColor: `${colors.info}15`,
      borderColor: colors.info,
      iconColor: colors.info,
      textColor: colors.text,
    };
  };

  const getIcon = () => {
    const colors = getAlertColors();
    const iconSize = responsive.getIconSize("medium");

    if (isExpired) {
      // Alert Triangle icon as text
      return (
        <Text style={{ fontSize: iconSize, color: colors.iconColor }}>⚠️</Text>
      );
    }

    // Clock icon as text
    return (
      <Text style={{ fontSize: iconSize, color: colors.iconColor }}>🕐</Text>
    );
  };

  const getMessage = () => {
    if (isExpired) {
      return "انتهت صلاحية الحجز! تم إلغاء الحجز تلقائياً وتحرير السيارة للعملاء الآخرين.";
    }

    if (warningLevel === "critical") {
      return "تحذير! سينتهي حجزك خلال أقل من 5 دقائق. أكمل عملية الدفع الآن لتجنب الإلغاء!";
    }

    if (warningLevel === "warning") {
      return "تنبيه: يتبقى أقل من 10 دقائق لإكمال حجزك";
    }

    return "يرجى إكمال عملية الحجز في الوقت المحدد";
  };

  const handleCleanup = async () => {
    try {
      await runCleanup();
      toast.showSuccess("تم تحديث حالة الحجوزات بنجاح");
    } catch (error) {
      toast.showError("حدث خطأ أثناء التحديث");
    }
  };

  const alertColors = getAlertColors();

  // Enhanced responsive styles
  const containerStyle: ViewStyle = {
    // Enhanced responsive margin vertical
    marginVertical: responsive.getResponsiveValue(
      responsive.spacing.md,
      responsive.spacing.lg,
      responsive.spacing.lg,
      responsive.spacing.xl,
      responsive.spacing.xl
    ),
  };

  const alertStyle: ViewStyle = {
    backgroundColor: alertColors.backgroundColor,
    borderColor: alertColors.borderColor,
    borderWidth: responsive.getResponsiveValue(1.5, 2, 2, 2.5, 3),
    borderRadius: responsive.getBorderRadius("medium"),
    // Enhanced responsive padding
    padding: responsive.getResponsiveValue(
      responsive.spacing.md,
      responsive.spacing.lg,
      responsive.spacing.lg,
      responsive.spacing.xl,
      responsive.spacing.xl
    ),
    // Add minimum height for better touch targets
    minHeight: responsive.getResponsiveValue(60, 70, 80, 90, 100),
  };

  const contentStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  };

  const leftContentStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    // Enhanced responsive gap
    gap: responsive.getResponsiveValue(
      responsive.spacing.sm,
      responsive.spacing.md,
      responsive.spacing.md,
      responsive.spacing.lg,
      responsive.spacing.lg
    ),
  };

  const textContainerStyle: ViewStyle = {
    flex: 1,
  };

  const messageStyle: TextStyle = {
    fontSize: responsive.typography.body,
    fontFamily: fonts.Medium || fonts.Regular,
    color: alertColors.textColor,
    lineHeight: responsive.typography.body * (responsive.isTablet ? 1.6 : 1.5),
    // Enhanced responsive margin bottom
    marginBottom:
      timeRemaining && formatTime && !isExpired
        ? responsive.getResponsiveValue(
            responsive.spacing.sm,
            responsive.spacing.md,
            responsive.spacing.md,
            responsive.spacing.lg,
            responsive.spacing.lg
          )
        : 0,
  };

  const timerContainerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    // Enhanced responsive gap
    gap: responsive.getResponsiveValue(
      responsive.spacing.xs,
      responsive.spacing.sm,
      responsive.spacing.sm,
      responsive.spacing.md,
      responsive.spacing.md
    ),
  };

  const timerLabelStyle: TextStyle = {
    fontSize: responsive.typography.small,
    fontFamily: fonts.Regular,
    color: theme.colors.textSecondary,
    lineHeight: responsive.typography.small * 1.3,
  };

  const buttonContainerStyle: ViewStyle = {
    flexDirection: responsive.isTablet ? "row" : "column",
    alignItems: "center",
    // Enhanced responsive gap
    gap: responsive.getResponsiveValue(
      responsive.spacing.xs,
      responsive.spacing.sm,
      responsive.spacing.sm,
      responsive.spacing.md,
      responsive.spacing.md
    ),
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: "transparent",
    borderColor: theme.colors.border,
    borderWidth: responsive.getResponsiveValue(1, 1, 1.5, 1.5, 2),
    borderRadius: responsive.getBorderRadius("small"),
    // Enhanced responsive padding
    paddingHorizontal: responsive.getResponsiveValue(
      responsive.spacing.sm,
      responsive.spacing.md,
      responsive.spacing.md,
      responsive.spacing.lg,
      responsive.spacing.lg
    ),
    paddingVertical: responsive.getResponsiveValue(
      responsive.spacing.xs,
      responsive.spacing.sm,
      responsive.spacing.sm,
      responsive.spacing.md,
      responsive.spacing.md
    ),
    minHeight: responsive.getButtonHeight("secondary"),
    flexDirection: "row",
    alignItems: "center",
    // Enhanced responsive gap
    gap: responsive.getResponsiveValue(
      responsive.spacing.xs,
      responsive.spacing.sm,
      responsive.spacing.sm,
      responsive.spacing.md,
      responsive.spacing.md
    ),
    opacity: isLoading ? 0.6 : 1,
  };

  const buttonTextStyle: TextStyle = {
    fontSize: responsive.typography.caption,
    fontFamily: fonts.Medium || fonts.Regular,
    color: theme.colors.textSecondary,
    lineHeight: responsive.typography.caption * 1.2,
  };

  const tipsAlertStyle: ViewStyle = {
    backgroundColor: `${theme.colors.primary}08`, // 8% opacity
    borderColor: `${theme.colors.primary}33`, // 20% opacity
    borderWidth: responsive.getResponsiveValue(1, 1, 1.5, 1.5, 2),
    borderRadius: responsive.getBorderRadius("medium"),
    // Enhanced responsive padding
    padding: responsive.getResponsiveValue(
      responsive.spacing.md,
      responsive.spacing.lg,
      responsive.spacing.lg,
      responsive.spacing.xl,
      responsive.spacing.xl
    ),
    // Enhanced responsive margin top
    marginTop: responsive.getResponsiveValue(
      responsive.spacing.md,
      responsive.spacing.lg,
      responsive.spacing.lg,
      responsive.spacing.xl,
      responsive.spacing.xl
    ),
  };

  const tipsTitleStyle: TextStyle = {
    fontSize: responsive.typography.body,
    fontFamily: fonts.SemiBold || fonts.Bold,
    color: theme.colors.primary,
    lineHeight: responsive.typography.body * 1.2,
    // Enhanced responsive margin bottom
    marginBottom: responsive.getResponsiveValue(
      responsive.spacing.xs,
      responsive.spacing.sm,
      responsive.spacing.sm,
      responsive.spacing.md,
      responsive.spacing.md
    ),
  };

  const tipsListStyle: TextStyle = {
    fontSize: responsive.typography.small,
    fontFamily: fonts.Regular,
    color: theme.colors.textSecondary,
    lineHeight: responsive.typography.small * 1.4,
  };

  return (
    <View style={[containerStyle, style]}>
      <View style={alertStyle}>
        <View style={contentStyle}>
          <View style={leftContentStyle}>
            {getIcon()}
            <View style={textContainerStyle}>
              <Text style={messageStyle}>{getMessage()}</Text>

              {timeRemaining && formatTime && !isExpired && (
                <View style={timerContainerStyle}>
                  <Badge
                    variant={
                      warningLevel === "critical" ? "destructive" : "secondary"
                    }
                    size="md"
                  >
                    {formatTime}
                  </Badge>
                  <Text style={timerLabelStyle}>المتبقي لإكمال الحجز</Text>
                </View>
              )}
            </View>
          </View>

          <View style={buttonContainerStyle}>
            {isExpired && onRebook && (
              <TouchableOpacity
                style={[buttonStyle, { borderColor: theme.colors.primary }]}
                onPress={onRebook}
                activeOpacity={0.7}
                accessible
                accessibilityRole="button"
                accessibilityLabel="حجز مجدد"
              >
                <Text style={{ fontSize: responsive.getIconSize("small") }}>
                  🔄
                </Text>
                <Text
                  style={[buttonTextStyle, { color: theme.colors.primary }]}
                >
                  حجز مجدد
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={buttonStyle}
              onPress={handleCleanup}
              disabled={isLoading}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel="تحديث الحجوزات"
            >
              <Text
                style={{
                  fontSize: responsive.getIconSize("small"),
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                🔄
              </Text>
              <Text style={buttonTextStyle}>تحديث</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {warningLevel === "critical" && !isExpired && (
        <View style={tipsAlertStyle}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: responsive.spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: responsive.getIconSize("medium"),
                color: theme.colors.primary,
              }}
            >
              ⚠️
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={tipsTitleStyle}>نصائح سريعة للإكمال:</Text>
              <Text style={tipsListStyle}>
                • تأكد من صحة بيانات الدفع{"\n"}• تحقق من اتصال الإنترنت{"\n"}•
                في حالة المشاكل، اتصل بالدعم: 920003344
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

/* 
Usage Examples:

// Basic usage with timer
<BookingExpiryWarning 
  bookingId="booking_123"
  expiresAt="2024-03-15T14:30:00Z"
/>

// With rebook handler
<BookingExpiryWarning 
  bookingId="booking_123"
  expiresAt="2024-03-15T14:30:00Z"
  onRebook={() => {
    // Handle rebooking logic
    navigation.navigate('BookingFlow');
  }}
/>

// With custom styling
<BookingExpiryWarning 
  bookingId="booking_123"
  expiresAt="2024-03-15T14:30:00Z"
  style={{ marginHorizontal: 20 }}
  onRebook={handleRebook}
/>
*/
