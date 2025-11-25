import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { CheckCircle2 } from "lucide-react-native";
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

  // Get feature color from theme colors
  const getFeatureColor = (index: number) => {
    const colors = [
      theme.colors.success,   // Green
      theme.colors.primary,   // Orange
      theme.colors.warning,   // Yellow
      theme.colors.error,     // Red
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
          {language === "ar" ? "المميزات" : "Features"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <View style={{ gap: responsive.spacing.sm }}>
          {features.map((feature, index) => (
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
                    ? getFeatureColor(index) + "15"
                    : getFeatureColor(index) + "10",
                borderRadius: responsive.getBorderRadius("medium"),
                borderWidth: 1,
                borderColor:
                  theme.scheme === "dark"
                    ? getFeatureColor(index) + "30"
                    : getFeatureColor(index) + "25",
                minHeight: 52,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: getFeatureColor(index) + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2
                  size={20}
                  color={getFeatureColor(index)}
                  fill={getFeatureColor(index) + "30"}
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
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}
