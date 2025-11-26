import { Booking } from "@/hooks/booking/useUserBookings";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BookingInfoCardProps {
  booking: Booking;
}

const BookingInfoCard: React.FC<BookingInfoCardProps> = ({ booking }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    bookingInfo: currentLanguage === "ar" ? "معلومات الحجز" : "Booking Info",
    reference: currentLanguage === "ar" ? "المرجع" : "Ref",
    duration: currentLanguage === "ar" ? "المدة" : "Duration",
    days: currentLanguage === "ar" ? "يوم" : "days",
    daily: currentLanguage === "ar" ? "يومي" : "Daily",
    weekly: currentLanguage === "ar" ? "أسبوعي" : "Weekly",
    monthly: currentLanguage === "ar" ? "شهري" : "Monthly",
    ownership: currentLanguage === "ar" ? "تمليك" : "Ownership",
    start: currentLanguage === "ar" ? "البداية" : "Start",
    end: currentLanguage === "ar" ? "النهاية" : "End",
  };

  const getRentalTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      daily: t.daily,
      weekly: t.weekly,
      monthly: t.monthly,
    };
    return types[type] || t.ownership;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
    title: {
      fontSize: responsive.getFontSize(16, 18, 20),
      fontFamily: fonts.Bold,
      color: colors.text,
    },
    refContainer: {
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingVertical: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      borderRadius: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    refText: {
      fontSize: responsive.getFontSize(12, 13, 14),
      fontFamily: fonts.Medium,
      color: colors.textSecondary,
    },
    timelineContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateBox: {
      flex: 1,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    dateLabel: {
      fontSize: responsive.getFontSize(11, 12, 13),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    dateValue: {
      fontSize: responsive.getFontSize(14, 15, 17),
      fontFamily: fonts.SemiBold,
      color: colors.text,
    },
    connectorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    line: {
      height: 2,
      width: "100%",
      backgroundColor: colors.border,
      position: "absolute",
    },
    durationBadge: {
      backgroundColor: colors.primary + "15", // 15% opacity
      paddingHorizontal: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingVertical: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      borderRadius: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      zIndex: 1,
    },
    durationText: {
      fontSize: responsive.getFontSize(11, 12, 13),
      fontFamily: fonts.Medium,
      color: colors.primary,
    },
    footer: {
      marginTop: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    typeBadge: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    typeText: {
      fontSize: responsive.getFontSize(12, 13, 15),
      fontFamily: fonts.Medium,
      color: colors.text,
      marginHorizontal: 6,
    },
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.bookingInfo}</Text>
        <View style={styles.refContainer}>
          <Text style={styles.refText}>
            {t.reference}: {booking.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        {/* Start Date */}
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>{t.start}</Text>
          <Text style={styles.dateValue}>{booking.start_date}</Text>
        </View>

        {/* Connector & Duration */}
        <View style={styles.connectorContainer}>
          <View style={styles.line} />
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {booking.total_days} {t.days}
            </Text>
          </View>
        </View>

        {/* End Date */}
        <View style={[styles.dateBox, { alignItems: isRTL ? "flex-start" : "flex-end" }]}>
          <Text style={styles.dateLabel}>{t.end}</Text>
          <Text style={styles.dateValue}>{booking.end_date}</Text>
        </View>
      </View>

      {/* Footer: Rental Type */}
      <View style={styles.footer}>
        <View style={styles.typeBadge}>
          <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.typeText}>{getRentalTypeLabel(booking.rental_type)}</Text>
        </View>
      </View>
    </View>
  );
};

export default BookingInfoCard;
