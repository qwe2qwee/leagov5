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

  // Get icon colors based on theme
  const getIconColors = (index: number) => {
    // Use theme colors with variations
    const baseColors = [
      theme.colors.primary, // Primary orange
      theme.colors.success, // Success green
      theme.colors.warning, // Warning yellow
      theme.colors.error, // Error red
    ];
    return baseColors[index % baseColors.length];
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
          {language === "ar" ? "المواصفات" : "Specifications"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <View style={{ gap: responsive.spacing.lg }}>
          {specifications.map((spec, index) => {
            const iconColor = getIconColors(index);
            return (
              <View
                key={index}
                style={{
                  flexDirection: language === "ar" ? "row-reverse" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: responsive.spacing.xs,
                }}
              >
                {/* Icon with Theme Color Background */}
                <View
                  style={{
                    flexDirection: language === "ar" ? "row-reverse" : "row",
                    alignItems: "center",
                    gap: responsive.spacing.md,
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor:
                        theme.scheme === "dark"
                          ? iconColor + "20"
                          : iconColor + "15",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1.5,
                      borderColor:
                        theme.scheme === "dark"
                          ? iconColor + "40"
                          : iconColor + "30",
                    }}
                  >
                    <spec.icon
                      size={responsive.getIconSize("medium")}
                      color={iconColor}
                      strokeWidth={2.5}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: fonts.Medium || fonts.Regular,
                        fontSize: responsive.typography.body,
                        color: theme.colors.text,
                        textAlign: language === "ar" ? "right" : "left",
                        lineHeight: responsive.typography.body * 1.3,
                        marginBottom: 2,
                      }}
                    >
                      {spec.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.Regular,
                        fontSize: responsive.typography.caption,
                        color: theme.colors.textSecondary,
                        textAlign: language === "ar" ? "right" : "left",
                        lineHeight: responsive.typography.caption * 1.3,
                      }}
                    >
                      {spec.value}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
}
