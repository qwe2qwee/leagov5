import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + "20",
      }}
    >
      <TouchableOpacity
        onPress={() => back()}
        style={{
          padding: responsive.spacing.sm,
          borderRadius: responsive.getBorderRadius("medium"),
          backgroundColor: theme.colors.backgroundSecondary,
          width: 48,
          height: 48,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ArrowLeft
          size={responsive.getIconSize("medium")}
          color={theme.colors.text}
        />
      </TouchableOpacity>

      <Text
        style={{
          fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
          fontSize: responsive.typography.h4,
          color: theme.colors.text,
          marginHorizontal: responsive.spacing.md,
          flex: 1,
          textAlign: language === "ar" ? "right" : "left",
          writingDirection: language === "ar" ? "rtl" : "ltr",
        }}
      >
        {language === "ar" ? "تفاصيل السيارة" : "Car Details"}
      </Text>
    </View>
  );
}
