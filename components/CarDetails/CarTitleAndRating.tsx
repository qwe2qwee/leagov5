import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Star } from "lucide-react-native";
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
      <Text
        style={{
          fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
          fontSize: responsive.typography.h2,
          color: theme.colors.text,
          marginBottom: responsive.spacing.sm,
          textAlign: language === "ar" ? "right" : "left",
          lineHeight: responsive.typography.h2 * 1.2,
          writingDirection: language === "ar" ? "rtl" : "ltr",
        }}
      >
        {brand} {model}
      </Text>

      <Text
        style={{
          fontFamily: fonts.Regular,
          fontSize: responsive.typography.body,
          color: theme.colors.textSecondary,
          marginBottom: responsive.spacing.md,
          textAlign: language === "ar" ? "right" : "left",
          lineHeight: responsive.typography.body * 1.3,
          writingDirection: language === "ar" ? "rtl" : "ltr",
        }}
      >
        {year} • {color}
      </Text>

      {/* Rating */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: responsive.spacing.sm,
          justifyContent: language === "ar" ? "flex-end" : "flex-start",
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
              color="#FCD34D"
              fill="#FCD34D"
            />
          ))}
        </View>
        <Text
          style={{
            fontFamily: fonts.Regular,
            fontSize: responsive.typography.caption,
            color: theme.colors.textSecondary,
            textAlign: language === "ar" ? "right" : "left",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {rating} ({reviewCount} {language === "ar" ? "تقييم" : "reviews"})
        </Text>
      </View>
    </View>
  );
}
