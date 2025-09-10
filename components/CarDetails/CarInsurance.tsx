import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React from "react";
import { Text, View } from "react-native";

export default function CarInsurance() {
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();

  const insuranceCoverages = [
    language === "ar"
      ? "تأمين شامل ضد الحوادث"
      : "Comprehensive accident insurance",
    language === "ar" ? "تأمين ضد السرقة" : "Theft insurance",
    language === "ar" ? "تأمين الطرف الثالث" : "Third party insurance",
    language === "ar" ? "مساعدة طوارئ 24/7" : "24/7 roadside assistance",
  ];

  return (
    <Card style={{ marginBottom: responsive.spacing.lg }}>
      <Card.Header>
        <Card.Title
          style={{
            textAlign: language === "ar" ? "right" : "left",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {language === "ar" ? "التأمين والضمان" : "Insurance & Warranty"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <View style={{ gap: responsive.spacing.md }}>
          <Text
            style={{
              fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
              fontSize: responsive.typography.h4,
              color: theme.colors.text,
              textAlign: language === "ar" ? "right" : "left",
              lineHeight: responsive.typography.h4 * 1.3,
              writingDirection: language === "ar" ? "rtl" : "ltr",
            }}
          >
            {language === "ar" ? "التغطية التأمينية" : "Insurance Coverage"}
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: responsive.spacing.sm,
            }}
          >
            {insuranceCoverages.map((coverage, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  paddingHorizontal: responsive.spacing.md,
                  paddingVertical: responsive.spacing.sm,
                  borderRadius: responsive.getBorderRadius("medium"),
                  flexDirection: language === "ar" ? "row-reverse" : "row",
                  alignItems: "center",
                  gap: responsive.spacing.sm,
                  width: "48%",
                  minHeight: 44,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.colors.success,
                  }}
                />
                <Text
                  style={{
                    fontFamily: fonts.Regular,
                    fontSize: responsive.typography.caption,
                    color: theme.colors.text,
                    flex: 1,
                    textAlign: language === "ar" ? "right" : "left",
                    lineHeight: responsive.typography.caption * 1.4,
                    writingDirection: language === "ar" ? "rtl" : "ltr",
                  }}
                >
                  {coverage}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}
