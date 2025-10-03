import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import React from "react";
import { View } from "react-native";
import ScreenHeader from "../ui/ScreenHeader";

export default function CarDetailsHeader() {
  const { push, replace, back } = useSafeNavigate();
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();

  return (
    <View
      style={{
        paddingHorizontal: responsive.spacing.lg,
        paddingVertical: responsive.spacing.md,

        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + "20",
      }}
    >
      <ScreenHeader
        title={language === "ar" ? "تفاصيل السيارة" : "Car Details"}
        onBack={() => back()}
      />
    </View>
  );
}
