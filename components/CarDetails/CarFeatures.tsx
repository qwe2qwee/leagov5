import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React from "react";
import { Text, View } from "react-native";

interface CarFeaturesProps {
  features: string[];
}

export default function CarFeatures({ features }: CarFeaturesProps) {
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();

  if (!features || features.length === 0) {
    return null;
  }

  return (
    <Card style={{ marginBottom: responsive.spacing.lg }}>
      <Card.Header>
        <Card.Title
          style={{
            textAlign: language === "ar" ? "right" : "left",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {language === "ar" ? "المميزات" : "Features"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: responsive.spacing.md,
          }}
        >
          {features.map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: language === "ar" ? "row-reverse" : "row",
                alignItems: "center",
                gap: responsive.spacing.sm,
                paddingVertical: responsive.spacing.xs,
                minWidth: "45%",
                minHeight: 36,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.colors.primary,
                }}
              />
              <Text
                style={{
                  fontFamily: fonts.Regular,
                  fontSize: responsive.typography.body,
                  color: theme.colors.text,
                  flex: 1,
                  textAlign: language === "ar" ? "right" : "left",
                  lineHeight: responsive.typography.body * 1.3,
                  writingDirection: language === "ar" ? "rtl" : "ltr",
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}
