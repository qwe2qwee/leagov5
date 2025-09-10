import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Calendar, Clock } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CarBookingButtonProps {
  status: "available" | "rented" | "maintenance" | "hidden";
  onBookPress: () => void;
}

export default function CarBookingButton({
  status,
  onBookPress,
}: CarBookingButtonProps) {
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();

  const isAvailable = status === "available";
  const isHidden = status === "hidden";

  // لا تعرض الزر إذا كان مخفي
  if (isHidden) {
    return null;
  }

  return (
    <View>
      {/* Book Button */}
      <TouchableOpacity
        onPress={onBookPress}
        disabled={!isAvailable}
        style={{
          backgroundColor: isAvailable
            ? theme.colors.primary
            : theme.colors.textMuted,
          paddingVertical: responsive.spacing.md,
          paddingHorizontal: responsive.spacing.lg,
          borderRadius: responsive.getBorderRadius("medium"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: responsive.spacing.md,
          opacity: isAvailable ? 1 : 0.6,
          minHeight: responsive.getButtonHeight("primary"),
          gap: responsive.spacing.sm,
        }}
      >
        <Calendar
          size={responsive.getIconSize("medium")}
          color={theme.colors.textInverse}
        />
        <Text
          style={{
            fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
            fontSize: responsive.typography.body,
            color: theme.colors.textInverse,
            textAlign: "center",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {isAvailable
            ? language === "ar"
              ? "احجز الآن"
              : "Book Now"
            : language === "ar"
            ? "غير متاح حالياً"
            : "Currently Unavailable"}
        </Text>
      </TouchableOpacity>

      {/* Availability Status */}
      {isAvailable && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: responsive.spacing.xs,
            marginBottom: responsive.spacing.lg,
          }}
        >
          <Clock
            size={responsive.getIconSize("small")}
            color={theme.colors.success}
          />
          <Text
            style={{
              fontFamily: fonts.Medium || fonts.Regular,
              fontSize: responsive.typography.caption,
              color: theme.colors.success,
              textAlign: "center",
              writingDirection: language === "ar" ? "rtl" : "ltr",
            }}
          >
            {language === "ar" ? "متاح للحجز" : "Available for booking"}
          </Text>
        </View>
      )}
    </View>
  );
}
