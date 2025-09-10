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
            flexDirection: "row",
            alignItems: "flex-start",
            gap: responsive.spacing.md,
          }}
        >
          <MapPin
            size={responsive.getIconSize("medium")}
            color={theme.colors.primary}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
                fontSize: responsive.typography.body,
                color: theme.colors.text,
                textAlign: language === "ar" ? "right" : "left",
                lineHeight: responsive.typography.body * 1.3,
                marginBottom: responsive.spacing.xs,
                writingDirection: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {branchName}
            </Text>
            <Text
              style={{
                fontFamily: fonts.Regular,
                fontSize: responsive.typography.caption,
                color: theme.colors.textSecondary,
                textAlign: language === "ar" ? "right" : "left",
                lineHeight: responsive.typography.caption * 1.4,
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
