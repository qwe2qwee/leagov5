import { icons } from "@/constants";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { Car, CarCardProps } from "@/types/CardTypes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Badge } from "../ui/Badge";

export const CarCard: React.FC<CarCardProps> = ({
  car,
  onSelect,
  language = "ar",
  cardWidth,
}) => {
  const { colors } = useTheme();

  const fonts = useFontFamily();
  const {
    width,
    height,
    getFontSize,
    getSpacing,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
  } = useResponsive();

  // Helper functions
  const getBrand = (car: Car) =>
    language === "ar" ? car.brand_ar : car.brand_en;
  const getModel = (car: Car) =>
    language === "ar" ? car.model_ar : car.model_en;
  const getColor = (car: Car) =>
    language === "ar" ? car.color_ar : car.color_en;
  const getTransmission = (car: Car) =>
    language === "ar" ? car.specs.transmission_ar : car.specs.transmission_en;
  const getBranchLocation = (car: Car) =>
    language === "ar" ? car.branch.location_ar : car.branch.location_en;

  const t = (key: string) => {
    const translations = {
      "featured.new": language === "ar" ? "جديد" : "New",
      "featured.unavailable": language === "ar" ? "غير متاح" : "Unavailable",
      "featured.book": language === "ar" ? "احجز الآن" : "Book Now",
      "common.sar": language === "ar" ? "ر.س" : "SAR",
    };
    return translations[key as keyof typeof translations] || key;
  };

  // Responsive dimensions - MUCH smaller for phones
  const getCardWidth = () => {
    if (cardWidth) return cardWidth;

    // Very compact sizing for phones
    if (isSmallScreen) return width - getSpacing(16); // Much less padding
    if (isMediumScreen) return width - getSpacing(20);
    return Math.min(width - getSpacing(24), 320); // Much smaller max width
  };

  const getImageHeight = () => {
    // Much smaller image heights
    if (isSmallScreen) return 100; // Very compact
    if (isMediumScreen) return 100;
    return 140;
  };

  const handleBookNow = () => {
    if (car.available && onSelect) {
      onSelect(car);
    }
  };

  const discountedPrice =
    (car.discount ?? 0) > 0
      ? Math.round(car.price.daily * (1 - (car.discount ?? 0) / 100))
      : car.price.daily;
  // مسافة ديناميكية حسب حجم الشاشة
  const dynamicPricingMargin = isSmallScreen
    ? getSpacing(1)
    : isMediumScreen
    ? getSpacing(1)
    : getSpacing(3);

  const styles = StyleSheet.create({
    card: {
      width: getCardWidth() + getSpacing(6),
      // إرتفاع ثابت لكل الكروت
      height: getImageHeight() + getSpacing(145), // fixed height for all cards
      backgroundColor: colors.surface,
      borderRadius: getSpacing(8),
      overflow: "hidden",
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      marginBottom: getSpacing(8),
    },
    imageContainer: {
      position: "relative",
      height: getImageHeight() - getSpacing(7),
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    badgeContainer: {
      position: "absolute",
      top: getSpacing(4),
      left: getSpacing(4),
      flexDirection: "row",
      gap: getSpacing(3),
      flexWrap: "wrap",
    },
    gradientOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 20,
    },
    content: {
      flex: 1, // يخلي المحتوى يمتد للمساحة المتاحة
      padding: getSpacing(8),
      justifyContent: "space-between", // يوزع المحتوى بالتساوي
    },
    carInfo: {
      marginBottom: getSpacing(4),
    },

    featuresContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: getSpacing(4),
    },
    featureItem: {
      flexDirection: language === "ar" ? "row-reverse" : "row", // ترتيب الأيقونة حسب اللغة
      alignItems: "center",
      gap: getSpacing(2),
    },
    featureText: {
      fontSize: getFontSize(9),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: getSpacing(4),
      marginBottom: getSpacing(8),
    },

    pricingContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "nowrap",
      marginBottom: dynamicPricingMargin, // مسافة ديناميكية بدل رقم ثابت
    },
    carTitle: {
      fontSize: getFontSize(14),
      fontFamily: fonts.Bold,
      color: colors.text,
      marginBottom: getSpacing(1),
      textAlign: language === "ar" ? "right" : "left",
    },
    carSubtitle: {
      fontSize: getFontSize(10),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: language === "ar" ? "right" : "left",
    },
    locationText: {
      fontSize: getFontSize(9),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      flexShrink: 1,
      textAlign: language === "ar" ? "right" : "left",
    },

    priceContainer: {
      flexShrink: 1,
      marginRight: getSpacing(8),
    },
    currentPrice: {
      fontSize: getFontSize(16),
      fontFamily: fonts.Bold,
      color: colors.primary,
      flexShrink: 1,
    },
    originalPrice: {
      fontSize: getFontSize(10),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textDecorationLine: "line-through",
      flexShrink: 1,
    },
    perDayText: {
      fontSize: getFontSize(8),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: language === "ar" ? "right" : "left",
    },
    availabilityContainer: {
      flexDirection: language === "ar" ? "row-reverse" : "row", // ترتيب الأيقونة حسب اللغة
      alignItems: "center",
      flexShrink: 0,
      gap: getSpacing(4),
    },
    availabilityText: {
      fontSize: getFontSize(8),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      flexShrink: 1,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: getSpacing(8),
      borderRadius: getSpacing(6),
      alignItems: "center",
      marginTop: "auto", // يبقى الزر في الأسفل للحفاظ على التوازن
    },
    buttonDisabled: {
      backgroundColor: colors.borderDark,
    },
    buttonText: {
      fontSize: getFontSize(12),
      fontFamily: fonts.SemiBold,
      color: colors.textInverse,
    },
    buttonTextDisabled: {
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: car.images[0] }} style={styles.image} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)"]}
          style={styles.gradientOverlay}
        />

        <View style={styles.badgeContainer}>
          {car.isNew && <Badge variant="default">{t("featured.new")}</Badge>}
          {(car.discount ?? 0) > 0 && (
            <Badge variant="secondary">
              {language === "ar"
                ? `خصم ${car.discount}%`
                : `${car.discount}% OFF`}
            </Badge>
          )}
          {!car.available && (
            <Badge variant="destructive">{t("featured.unavailable")}</Badge>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View>
          <View style={styles.carInfo}>
            <Text
              style={styles.carTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getBrand(car)} {getModel(car)}
            </Text>

            <Text
              style={styles.carSubtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {car.year} • {getColor(car)}
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons
                name="people-outline"
                size={getFontSize(14)}
                color={colors.textSecondary}
              />
              <Text style={styles.featureText}>
                {car.specs.seats} {language === "ar" ? "مقاعد" : "seats"}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="flash-outline"
                size={getFontSize(14)}
                color={colors.textSecondary}
              />
              <Text style={styles.featureText}>{getTransmission(car)}</Text>
            </View>
          </View>

          <View style={styles.pricingContainer}>
            <View style={styles.priceContainer}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.currentPrice}>{discountedPrice}</Text>
                <Image
                  source={icons.riyalsymbol}
                  resizeMode="contain"
                  style={{
                    width: getFontSize(12),
                    height: getFontSize(12),
                    marginLeft: getFontSize(2),
                    tintColor: colors.primary,
                  }}
                />
              </View>

              {(car.discount ?? 0) > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.originalPrice}>{car.price.daily}</Text>
                  <Image
                    source={icons.riyalsymbol}
                    resizeMode="contain"
                    style={{
                      width: getFontSize(10),
                      height: getFontSize(10),
                      marginLeft: getFontSize(2),
                      tintColor: colors.textSecondary,
                    }}
                  />
                </View>
              )}

              <Text style={styles.perDayText}>
                {language === "ar" ? "في اليوم" : "per day"}
              </Text>
            </View>

            <View style={styles.availabilityContainer}>
              <Ionicons
                name="time-outline"
                size={getFontSize(12)}
                color={colors.textSecondary}
              />
              <Text style={styles.availabilityText}>
                {language === "ar" ? "متاح الآن" : "Available now"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !car.available && styles.buttonDisabled]}
          onPress={handleBookNow}
          disabled={!car.available}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.buttonText,
              !car.available && styles.buttonTextDisabled,
            ]}
          >
            {car.available ? t("featured.book") : t("featured.unavailable")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CarCard;
