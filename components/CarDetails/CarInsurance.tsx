import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Headphones, Shield, ShieldAlert, ShieldCheck } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

export default function CarInsurance() {
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();

  const insuranceCoverages = [
    {
      icon: ShieldCheck,
      text: language === "ar"
        ? "تأمين شامل ضد الحوادث"
        : "Comprehensive accident insurance",
    },
    {
      icon: Shield,
      text: language === "ar" ? "تأمين ضد السرقة" : "Theft insurance",
    },
    {
      icon: ShieldAlert,
      text: language === "ar" ? "تأمين الطرف الثالث" : "Third party insurance",
    },
    {
      icon: Headphones,
      text: language === "ar" ? "مساعدة طوارئ 24/7" : "24/7 roadside assistance",
    },
  ];

  // Get icon color from theme colors
  const getIconColor = (index: number) => {
    const colors = [
      theme.colors.success,   // Green
      theme.colors.primary,   // Orange
      theme.colors.warning,   // Yellow
      theme.colors.info,      // Blue
    ];
    return colors[index % colors.length];
  };

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
        <View style={{ gap: responsive.spacing.sm }}>
          {insuranceCoverages.map((coverage, index) => {
            const IconComponent = coverage.icon;
            const iconColor = getIconColor(index);
            
            return (
              <View
                key={index}
                style={{
                  flexDirection: language === "ar" ? "row-reverse" : "row",
                  alignItems: "center",
                  gap: responsive.spacing.md,
                  paddingVertical: responsive.spacing.md,
                  paddingHorizontal: responsive.spacing.md,
                  backgroundColor:
                    theme.scheme === "dark"
                      ? iconColor + "15"
                      : iconColor + "10",
                  borderRadius: responsive.getBorderRadius("medium"),
                  borderWidth: 1,
                  borderColor:
                    theme.scheme === "dark"
                      ? iconColor + "30"
                      : iconColor + "25",
                  minHeight: 52,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: iconColor + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent
                    size={20}
                    color={iconColor}
                    fill={iconColor + "30"}
                    strokeWidth={2.5}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: fonts.Medium || fonts.Regular,
                    fontSize: responsive.typography.body,
                    color: theme.colors.text,
                    flex: 1,
                    textAlign: language === "ar" ? "right" : "left",
                    lineHeight: responsive.typography.body * 1.4,
                    writingDirection: language === "ar" ? "rtl" : "ltr",
                  }}
                >
                  {coverage.text}
                </Text>
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
}
