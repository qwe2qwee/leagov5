import { Badge } from "@/components/ui/Badge2";
import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Fuel, Gauge, MapPin, Users } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface CarData {
  car_id: string;
  brand_name_ar: string;
  brand_name_en: string;
  model_name_ar: string;
  model_name_en: string;
  model_year: number;
  main_image_url: string;
  color_name_ar: string;
  color_name_en: string;
  fuel_type: string;
  transmission: string;

  daily_price: number;
  seats: number;
  branch_name_ar: string;
  branch_name_en: string;
  is_new: boolean;
  discount_percentage: number;
}

interface BookingCarInfoProps {
  car: CarData;
  cardTitle: string;
  newLabel: string;
  seatsLabel: string;

  riyalLabel: string;
}

export default function BookingCarInfo({
  car,
  cardTitle,
  newLabel,
  seatsLabel,
  riyalLabel,
}: BookingCarInfoProps) {
  const theme = useTheme();
  const { colors, scheme } = theme;
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  // Helper functions
  const getTransmissionLabel = () => {
    if (car.transmission === "automatic") {
      return currentLanguage === "ar" ? "أوتوماتيك" : "Automatic";
    }
    return currentLanguage === "ar" ? "يدوي" : "Manual";
  };

  const getFuelTypeLabel = () => {
    const fuelTypes: { [key: string]: { ar: string; en: string } } = {
      gasoline: { ar: "بنزين", en: "Gasoline" },
      diesel: { ar: "ديزل", en: "Diesel" },
      electric: { ar: "كهربائي", en: "Electric" },
      hybrid: { ar: "هجين", en: "Hybrid" },
    };
    const fuelType = fuelTypes[car.fuel_type] || {
      ar: "بنزين",
      en: "Gasoline",
    };
    return currentLanguage === "ar" ? fuelType.ar : fuelType.en;
  };

  const styles = StyleSheet.create({
    cardContainer: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    carImage: {
      width: "100%",
      height: 200,
      borderRadius: responsive.getBorderRadius("large"),
      marginBottom: responsive.spacing.md,
      backgroundColor: colors.backgroundSecondary,
    },
    titleRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: responsive.spacing.xs,
    },
    carTitle: {
      fontSize: responsive.typography.h3,
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      flex: 1,
      textAlign: isRTL ? "right" : "left",
    },
    colorRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: responsive.spacing.xs,
      marginBottom: responsive.spacing.md,
    },
    colorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.textSecondary,
    },
    colorText: {
      fontSize: responsive.typography.body,
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
    },
    badgeContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      flexWrap: "wrap",
      gap: responsive.spacing.sm,
      marginBottom: responsive.spacing.lg,
    },
    specsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: responsive.spacing.md,
    },
    specItem: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: responsive.spacing.sm,
      width: "47%",
      paddingVertical: responsive.spacing.sm,
      paddingHorizontal: responsive.spacing.md,
      backgroundColor:
        scheme === "dark"
          ? colors.backgroundSecondary
          : colors.backgroundTertiary,
      borderRadius: responsive.getBorderRadius("medium"),
      borderWidth: 1,
      borderColor: colors.border,
    },
    specText: {
      fontSize: responsive.typography.body,
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      flex: 1,
      textAlign: isRTL ? "right" : "left",
    },
  });

  return (
    <Card style={styles.cardContainer}>
      <Card.Header>
        <Card.Title size="md">{cardTitle}</Card.Title>
      </Card.Header>
      <Card.Content>
        {/* Car Image */}
        <Image
          source={{ uri: car.main_image_url }}
          style={styles.carImage}
          resizeMode="cover"
        />

        {/* Title Row */}
        <Text style={styles.carTitle}>
          {currentLanguage === "ar"
            ? `${car.brand_name_ar} ${car.model_name_ar} ${car.model_year}`
            : `${car.brand_name_en} ${car.model_name_en} ${car.model_year}`}
        </Text>

        {/* Color with Dot */}
        <View style={styles.colorRow}>
          <View style={styles.colorDot} />
          <Text style={styles.colorText}>
            {currentLanguage === "ar" ? car.color_name_ar : car.color_name_en}
          </Text>
        </View>

        {/* Badges */}
        {(car.is_new || car.discount_percentage > 0) && (
          <View style={styles.badgeContainer}>
            {car.is_new && (
              <Badge variant="success" size="sm">
                {newLabel}
              </Badge>
            )}
            {car.discount_percentage > 0 && (
              <Badge variant="warning" size="sm">
                {currentLanguage === "ar"
                  ? `خصم ${car.discount_percentage}%`
                  : `${car.discount_percentage}% Off`}
              </Badge>
            )}
          </View>
        )}

        {/* Specs Grid 2x2 */}
        <View style={styles.specsGrid}>
          {/* Branch */}
          <View style={styles.specItem}>
            <MapPin
              size={responsive.getIconSize("small")}
              color={colors.primary}
              strokeWidth={2.5}
            />
            <Text style={styles.specText} numberOfLines={1}>
              {currentLanguage === "ar"
                ? car.branch_name_ar
                : car.branch_name_en}
            </Text>
          </View>

          {/* Transmission */}
          <View style={styles.specItem}>
            <Gauge
              size={responsive.getIconSize("small")}
              color={colors.primary}
              strokeWidth={2.5}
            />
            <Text style={styles.specText}>{getTransmissionLabel()}</Text>
          </View>

          {/* Seats */}
          <View style={styles.specItem}>
            <Users
              size={responsive.getIconSize("small")}
              color={colors.primary}
              strokeWidth={2.5}
            />
            <Text style={styles.specText}>
              {car.seats} {seatsLabel}
            </Text>
          </View>

          {/* Fuel */}
          <View style={styles.specItem}>
            <Fuel
              size={responsive.getIconSize("small")}
              color={colors.primary}
              strokeWidth={2.5}
            />
            <Text style={styles.specText}>{getFuelTypeLabel()}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}
