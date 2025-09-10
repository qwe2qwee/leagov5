import { Badge } from "@/components/ui/Badge2";
import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
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
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    cardContainer: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    carImage: {
      width: "100%",
      height: responsive.getResponsiveValue(180, 200, 220, 240, 260),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    carTitle: {
      fontSize: responsive.getFontSize(18, 17, 21),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      textAlign: isRTL ? "right" : "left",
    },
    carSubtitle: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginBottom: responsive.getResponsiveValue(8, 12, 16, 18, 20),
      textAlign: isRTL ? "right" : "left",
    },
    badgeContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      flexWrap: "wrap",
      gap: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      marginBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    carInfoGrid: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    carInfoItem: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    carInfoText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Regular,
      color: colors.text,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    priceRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    priceLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
    },
    priceValue: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.SemiBold || fonts.Regular,
      color: colors.text,
    },
  });

  return (
    <Card style={styles.cardContainer}>
      <Card.Header>
        <Card.Title size="md">{cardTitle}</Card.Title>
      </Card.Header>
      <Card.Content>
        <Image
          source={{ uri: car.main_image_url }}
          style={styles.carImage}
          resizeMode="cover"
        />

        <Text style={styles.carTitle}>
          {currentLanguage === "ar"
            ? `${car.brand_name_ar} ${car.model_name_ar} ${car.model_year}`
            : `${car.brand_name_en} ${car.model_name_en} ${car.model_year}`}
        </Text>
        <Text style={styles.carSubtitle}>
          {currentLanguage === "ar" ? car.color_name_ar : car.color_name_en}
        </Text>

        <View style={styles.badgeContainer}>
          {car.is_new && (
            <Badge variant="secondary" size="sm">
              {newLabel}
            </Badge>
          )}
          {car.discount_percentage > 0 && (
            <Badge variant="destructive" size="sm">
              {currentLanguage === "ar"
                ? `خصم ${car.discount_percentage}%`
                : `${car.discount_percentage}% Off`}
            </Badge>
          )}
        </View>

        <View style={styles.carInfoGrid}>
          <View style={styles.carInfoItem}>
            <Ionicons
              name="location"
              size={responsive.getIconSize("small")}
              color={colors.textSecondary}
            />
            <Text style={styles.carInfoText}>
              {currentLanguage === "ar"
                ? car.branch_name_ar
                : car.branch_name_en}
            </Text>
          </View>
          <View style={styles.carInfoItem}>
            <Ionicons
              name="people"
              size={responsive.getIconSize("small")}
              color={colors.textSecondary}
            />
            <Text style={styles.carInfoText}>
              {car.seats} {seatsLabel}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Basic Price Info */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {currentLanguage === "ar" ? "السعر اليومي:" : "Daily Price:"}
          </Text>
          <Text style={styles.priceValue}>
            {car.daily_price} {riyalLabel}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}
