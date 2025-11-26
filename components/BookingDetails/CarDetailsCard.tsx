import { Booking } from "@/hooks/booking/useUserBookings";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface CarDetailsCardProps {
  booking: Booking;
}

const CarDetailsCard: React.FC<CarDetailsCardProps> = ({ booking }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const car = booking.car;
  const model = car?.model;
  const brand = model?.brand;

  const carName = `${
    isRTL ? model?.name_ar : brand?.name_en
  } ${
    isRTL ? brand?.name_ar : model?.name_en
  }`;

  const t = {
    year: currentLanguage === "ar" ? "السنة" : "Year",
    color: currentLanguage === "ar" ? "اللون" : "Color",
    transmission: currentLanguage === "ar" ? "ناقل الحركة" : "Transmission",
    fuel: currentLanguage === "ar" ? "الوقود" : "Fuel",
    seats: currentLanguage === "ar" ? "المقاعد" : "Seats",
  };

  const getTransmissionLabel = (type: string | undefined) => {
    if (!type) return "-";
    const map: Record<string, { ar: string; en: string }> = {
      automatic: { ar: "أوتوماتيك", en: "Automatic" },
      manual: { ar: "عادي", en: "Manual" },
    };
    const key = type.toLowerCase();
    return map[key] ? (isRTL ? map[key].ar : map[key].en) : type;
  };

  const getFuelLabel = (type: string | undefined) => {
    if (!type) return "-";
    const map: Record<string, { ar: string; en: string }> = {
      petrol: { ar: "بنزين", en: "Petrol" },
      gasoline: { ar: "بنزين", en: "Gasoline" },
      benzine: { ar: "بنزين", en: "Benzine" },
      diesel: { ar: "ديزل", en: "Diesel" },
      electric: { ar: "كهرباء", en: "Electric" },
      hybrid: { ar: "هجين", en: "Hybrid" },
    };
    const key = type.toLowerCase();
    return map[key] ? (isRTL ? map[key].ar : map[key].en) : type;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginTop: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
      overflow: "hidden",
    },
    imageContainer: {
      height: responsive.getResponsiveValue(180, 200, 220, 240, 260),
      width: "100%",
      backgroundColor: colors.backgroundSecondary,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    content: {
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    header: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    carName: {
      fontSize: responsive.getFontSize(20, 22, 26),
      fontFamily: fonts.Bold,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    plateNumber: {
      fontSize: responsive.getFontSize(14, 15, 17),
      fontFamily: fonts.Medium,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      backgroundColor: colors.backgroundSecondary,
      alignSelf: isRTL ? "flex-end" : "flex-start",
      paddingHorizontal: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingVertical: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      borderRadius: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      overflow: "hidden",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    gridItem: {
      width: "50%",
      paddingHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      marginBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    specItem: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
    },
    iconBox: {
      width: responsive.getResponsiveValue(36, 40, 44, 48, 52),
      height: responsive.getResponsiveValue(36, 40, 44, 48, 52),
      borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: isRTL ? 0 : responsive.getResponsiveValue(10, 12, 14, 16, 18),
      marginLeft: isRTL ? responsive.getResponsiveValue(10, 12, 14, 16, 18) : 0,
    },
    specContent: {
      flex: 1,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    specLabel: {
      fontSize: responsive.getFontSize(11, 12, 13),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    specValue: {
      fontSize: responsive.getFontSize(13, 14, 16),
      fontFamily: fonts.SemiBold,
      color: colors.text,
    },
  });

  const SpecItem = ({ icon, label, value }: { icon: string; label: string; value: string | number | undefined }) => (
    <View style={styles.gridItem}>
      <View style={styles.specItem}>
        <View style={styles.iconBox}>
          <Ionicons
            name={icon as any}
            size={responsive.getResponsiveValue(18, 20, 22, 24, 26)}
            color={colors.primary}
          />
        </View>
        <View style={styles.specContent}>
          <Text style={styles.specLabel}>{label}</Text>
          <Text style={styles.specValue} numberOfLines={1}>{value || "-"}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Car Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: model?.default_image_url || "https://via.placeholder.com/400" }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        {/* Header: Name & Plate */}
        <View style={styles.header}>
          <Text style={styles.carName}>{carName}</Text>
          {car?.plate_number && (
             <Text style={styles.plateNumber}>{car.plate_number}</Text>
          )}
        </View>

        {/* Specs Grid */}
        <View style={styles.grid}>
          <SpecItem
            icon="calendar-outline"
            label={t.year}
            value={model?.year}
          />
          <SpecItem
            icon="color-palette-outline"
            label={t.color}
            value={isRTL ? car?.color?.name_ar : car?.color?.name_en}
          />
          <SpecItem
            icon="settings-outline"
            label={t.transmission}
            value={getTransmissionLabel(car?.transmission)}
          />
          <SpecItem
            icon="water-outline"
            label={t.fuel}
            value={getFuelLabel(car?.fuel_type)}
          />
          <SpecItem
            icon="people-outline"
            label={t.seats}
            value={car?.seats}
          />
        </View>
      </View>
    </View>
  );
};

export default CarDetailsCard;
