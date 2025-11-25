import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

interface CarTitleAndRatingProps {
  brand: string;
  model: string;
  year: number;
  color: string;
  rating?: number;
  reviewCount?: number;
}

export default function CarTitleAndRating({
  brand,
  model,
  year,
  color,
  rating = 4.8,
  reviewCount = 124,
}: CarTitleAndRatingProps) {
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();

  return (
    <View style={{ marginBottom: responsive.spacing.lg }}>
      {/* Title with Gradient Badge */}
      <View
        style={{
          flexDirection: language === "ar" ? "row-reverse" : "row",
          alignItems: "center",
          marginBottom: responsive.spacing.sm,
          gap: responsive.spacing.sm,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
            fontSize: responsive.typography.h2,
            color: theme.colors.text,
            textAlign: language === "ar" ? "right" : "left",
            lineHeight: responsive.typography.h2 * 1.2,
            writingDirection: language === "ar" ? "rtl" : "ltr",
            flex: 1,
          }}
        >
          {brand} {model}
        </Text>

        {/* Year Badge with Theme Gradient */}
        <LinearGradient
          colors={
            theme.scheme === "dark"
              ? [theme.colors.primary, theme.colors.primaryLight]
              : [theme.colors.primary, theme.colors.primaryDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: responsive.spacing.md,
            paddingVertical: responsive.spacing.xs,
            borderRadius: responsive.getBorderRadius("medium"),
            elevation: 4,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
              fontSize: responsive.typography.caption,
              color: theme.colors.textInverse,
              textAlign: "center",
            }}
          >
            {year}
          </Text>
        </LinearGradient>
      </View>

      {/* Color Info */}
      <Text
        style={{
          fontFamily: fonts.Medium || fonts.Regular,
          fontSize: responsive.typography.body,
          color: theme.colors.textSecondary,
          textAlign: language === "ar" ? "right" : "left",
          lineHeight: responsive.typography.body * 1.3,
          writingDirection: language === "ar" ? "rtl" : "ltr",
        }}
      >
        {color}
      </Text>

      {/* Rating - Commented out for now */}
      {/* <View
        style={{
          flexDirection: language === "ar" ? "row-reverse" : "row",
          alignItems: "center",
          gap: responsive.spacing.sm,
          justifyContent: language === "ar" ? "flex-end" : "flex-start",
          marginTop: responsive.spacing.md,
        }}
      >
        <LinearGradient
          colors={
            theme.scheme === "dark"
              ? ["#FCD34D20", "#F59E0B20"]
              : ["#FEF3C7", "##FDE68A"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: responsive.spacing.xs,
            paddingHorizontal: responsive.spacing.md,
            paddingVertical: responsive.spacing.sm,
            borderRadius: responsive.getBorderRadius("medium"),
            borderWidth: 1,
            borderColor:
              theme.scheme === "dark" ? "#FCD34D40" : "#FCD34D80",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 2,
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={responsive.getIconSize("small")}
                color="#F59E0B"
                fill="#FBBF24"
              />
            ))}
          </View>
          <Text
            style={{
              fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
              fontSize: responsive.typography.body,
              color: theme.scheme === "dark" ? "#FCD34D" : "#D97706",
              textAlign: language === "ar" ? "right" : "left",
              writingDirection: language === "ar" ? "rtl" : "ltr",
            }}
          >
            {rating}
          </Text>
        </LinearGradient>

        <Text
          style={{
            fontFamily: fonts.Regular,
            fontSize: responsive.typography.caption,
            color: theme.colors.textSecondary,
            textAlign: language === "ar" ? "right" : "left",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          ({reviewCount} {language === "ar" ? "تقييم" : "reviews"})
        </Text>
      </View> */}
    </View>
  );
}
