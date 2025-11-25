import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { LinearGradient } from "expo-linear-gradient";
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
      {/* Book Button with Gradient */}
      <TouchableOpacity
        onPress={onBookPress}
        disabled={!isAvailable}
        activeOpacity={0.8}
        style={{
          marginBottom: responsive.spacing.md,
          opacity: isAvailable ? 1 : 0.6,
          borderRadius: responsive.getBorderRadius("medium"),
          overflow: "hidden",
          elevation: isAvailable ? 8 : 2,
          shadowColor: isAvailable ? theme.colors.primary : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isAvailable ? 0.4 : 0.2,
          shadowRadius: 8,
        }}
      >
        <LinearGradient
          colors={
            isAvailable
              ? theme.scheme === "dark"
                ? [theme.colors.primary, theme.colors.primaryLight, theme.colors.primary]
                : [theme.colors.primary, theme.colors.primaryDark, theme.colors.primary]
              : [theme.colors.textMuted, theme.colors.textMuted]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingVertical: responsive.spacing.md + 2,
            paddingHorizontal: responsive.spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            minHeight: responsive.getButtonHeight("primary"),
            gap: responsive.spacing.sm,
          }}
        >

          <Text
            style={{
              fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
              fontSize: responsive.typography.body,
              color: "#FFFFFF",
              textAlign: "center",
              writingDirection: language === "ar" ? "rtl" : "ltr",
              letterSpacing: 0.5,
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
          {isAvailable && (
            <Calendar
              size={responsive.getIconSize("medium")}
              color="#FFFFFF"
              strokeWidth={2.5}
            />
          )}
        </LinearGradient>
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
            paddingHorizontal: responsive.spacing.md,
            paddingVertical: responsive.spacing.sm,
            backgroundColor:
              theme.scheme === "dark" ? "#10B98120" : "#D1FAE5",
            borderRadius: responsive.getBorderRadius("medium"),
            borderWidth: 1,
            borderColor: theme.scheme === "dark" ? "#10B98140" : "#10B981",
          }}
        >
          <Clock
            size={responsive.getIconSize("small")}
            color={theme.colors.success}
            strokeWidth={2.5}
          />
          <Text
            style={{
              fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
              fontSize: responsive.typography.caption,
              color: theme.colors.success,
              textAlign: "center",
              writingDirection: language === "ar" ? "rtl" : "ltr",
            }}
          >
            {language === "ar" ? "متاح للحجز فوراً" : "Available immediately"}
          </Text>
        </View>
      )}
    </View>
  );
}
