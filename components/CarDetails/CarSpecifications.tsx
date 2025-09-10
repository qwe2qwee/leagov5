import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Fuel, MapPin, Users, Zap } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface CarSpecificationsProps {
  seats?: number;
  transmission?: string;
  fuelType?: string;
  mileage?: number;
}

export default function CarSpecifications({
  seats,
  transmission,
  fuelType,
  mileage,
}: CarSpecificationsProps) {
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();

  // Helper function for fuel type translation
  const getFuelType = () => {
    if (!fuelType) return language === "ar" ? "غير محدد" : "Not specified";

    if (language === "ar") {
      switch (fuelType.toLowerCase()) {
        case "gasoline":
        case "petrol":
        case "بنزين":
          return "بنزين";
        case "diesel":
        case "ديزل":
          return "ديزل";
        case "hybrid":
        case "هجين":
          return "هجين";
        case "electric":
        case "كهربائي":
          return "كهربائي";
        case "cng":
          return "غاز طبيعي";
        case "lpg":
          return "غاز البترول المسال";
        default:
          return fuelType;
      }
    }
    return fuelType;
  };

  // Helper function for transmission translation
  const getTransmission = () => {
    console.log("Transmission from DB:", transmission); // للتشخيص
    if (!transmission) return language === "ar" ? "غير محدد" : "Not specified";

    if (language === "ar") {
      switch (transmission.toLowerCase()) {
        case "automatic":
        case "auto":
        case "أوتوماتيك":
          return "أوتوماتيك";
        case "manual":
        case "يدوي":
          return "يدوي";
        case "cvt":
          return "متغير مستمر";
        default:
          return transmission;
      }
    }
    return transmission;
  };

  const specifications = [
    {
      icon: Users,
      label: language === "ar" ? "عدد المقاعد" : "Seats",
      value: seats?.toString() ?? "-",
    },
    {
      icon: Zap,
      label: language === "ar" ? "ناقل الحركة" : "Transmission",
      value: getTransmission(),
    },
    {
      icon: Fuel,
      label: language === "ar" ? "نوع الوقود" : "Fuel Type",
      value: getFuelType(),
    },
    {
      icon: MapPin,
      label: language === "ar" ? "المسافة المقطوعة" : "Mileage",
      value: mileage
        ? `${mileage.toLocaleString()} ${language === "ar" ? "كم" : "km"}`
        : language === "ar"
        ? "غير محدد"
        : "Not specified",
    },
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
          {language === "ar" ? "المواصفات" : "Specifications"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <View style={{ gap: responsive.spacing.md }}>
          {specifications.map((spec, index) => (
            <View
              key={index}
              style={{
                flexDirection: language === "ar" ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: responsive.spacing.sm,
                borderBottomWidth: index < specifications.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.border + "30",
                minHeight: 48,
              }}
            >
              <spec.icon
                size={responsive.getIconSize("medium")}
                color={theme.colors.textSecondary}
                style={{
                  marginHorizontal: responsive.spacing.sm,
                }}
              />
              <Text
                style={{
                  fontFamily: fonts.Medium || fonts.Regular,
                  fontSize: responsive.typography.body,
                  color: theme.colors.text,
                  flex: 1,
                  textAlign: language === "ar" ? "right" : "left",
                  lineHeight: responsive.typography.body * 1.3,
                }}
              >
                {spec.label}:
              </Text>
              <Text
                style={{
                  fontFamily: fonts.Regular,
                  fontSize: responsive.typography.body,
                  color: theme.colors.textSecondary,
                  textAlign: language === "ar" ? "left" : "right",
                  lineHeight: responsive.typography.body * 1.3,
                }}
              >
                {spec.value}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}
