import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { MapPin } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface CarBranchInfoProps {
  branchName: string;
  branchLocation: string;
}

export default function CarBranchInfo({
  branchName,
  branchLocation,
}: CarBranchInfoProps) {
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();

  return (
    <Card style={{ marginBottom: responsive.spacing.lg }}>
      <Card.Header>
        <Card.Title
          style={{
            textAlign: language === "ar" ? "right" : "left",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {language === "ar" ? "معلومات الفرع" : "Branch Information"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <View
          style={{
            flexDirection: language === "ar" ? "row-reverse" : "row",
            alignItems: "flex-start",
            gap: responsive.spacing.md,
          }}
        >
          {/* Icon with Circular Background */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor:
                theme.scheme === "dark"
                  ? theme.colors.primary + "20"
                  : theme.colors.primary + "15",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor:
                theme.scheme === "dark"
                  ? theme.colors.primary + "40"
                  : theme.colors.primary + "30",
            }}
          >
            <MapPin
              size={24}
              color={theme.colors.primary}
              strokeWidth={2.5}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
                fontSize: responsive.typography.h4,
                color: theme.colors.text,
                textAlign: language === "ar" ? "right" : "left",
                lineHeight: responsive.typography.h4 * 1.3,
                marginBottom: responsive.spacing.xs,
                writingDirection: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {branchName}
            </Text>
            <Text
              style={{
                fontFamily: fonts.Regular,
                fontSize: responsive.typography.body,
                color: theme.colors.textSecondary,
                textAlign: language === "ar" ? "right" : "left",
                lineHeight: responsive.typography.body * 1.4,
                writingDirection: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {branchLocation}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}
