import { icons } from "@/constants";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useLocation } from "@/hooks/useLocation";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useNavLockStore } from "@/store/useNavLockStore";
import { Car, CarCardProps } from "@/types/CardTypes";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export const CarCard: React.FC<CarCardProps> = ({
  car,
  language = "ar",
  cardWidth,
}) => {
  const { colors, scheme } = useTheme();
  const { currentLanguage } = useLanguageStore();
  const { lock, unlock } = useNavLockStore();
  const { userLocation, calculateDistance } = useLocation();

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

  const activeLanguage = language || currentLanguage;
  const { push, replace, back } = useSafeNavigate();

  // Helper functions
  const getBrand = (car: Car) =>
    activeLanguage === "ar" ? car.brand_ar : car.brand_en;
  const getModel = (car: Car) =>
    activeLanguage === "ar" ? car.model_ar : car.model_en;
  const getColor = (car: Car) =>
    activeLanguage === "ar" ? car.color_ar : car.color_en;
  const getTransmission = (car: Car) =>
    activeLanguage === "ar"
      ? car.specs.transmission_ar
      : car.specs.transmission_en;

  const t = (key: string) => {
    const translations = {
      "featured.new": activeLanguage === "ar" ? "جديد" : "New",
      "featured.unavailable":
        activeLanguage === "ar" ? "غير متاح" : "Unavailable",
      "featured.available": activeLanguage === "ar" ? "متاح" : "Available",
      "featured.book": activeLanguage === "ar" ? "احجز" : "Book",
      "common.sar": activeLanguage === "ar" ? "ر.س" : "SAR",
      "common.perday": activeLanguage === "ar" ? "يومياً" : "per day",
      "common.km": activeLanguage === "ar" ? "كم" : "km",
    };
    return translations[key as keyof typeof translations] || key;
  };

  // ✅ أحجام مناسبة للـ Grid Layout
  const getImageHeight = () => {
    if (isSmallScreen) return 110;
    if (isMediumScreen) return 120;
    return 130;
  };

  const handleCardPress = () => {
    try {
      lock();
      push({
        pathname: "/screens/Car-details",
        params: {
          carId: car.id,
        },
      });
    } catch (error) {
      console.error("[CarCard] Error navigating to car details:", error);
      unlock();
    }
  };

  const handleBookNow = (e: any) => {
    e.stopPropagation();

    if (car.available) {
      try {
        lock();
        push({
          pathname: "/screens/Booking",
          params: {
            carId: car.id,
          },
        });
      } catch (error) {
        console.error("[CarCard] Error navigating to booking:", error);
        unlock();
      }
    }
  };

  const discountedPrice =
    (car.discount ?? 0) > 0
      ? Math.round(car.price.daily * (1 - (car.discount ?? 0) / 100))
      : car.price.daily;

  const isAvailable = car.available === true;
  const isUnavailable = !isAvailable;

  // Calculate distance
  const distance = useMemo(() => {
    // 1. Use pre-calculated distance if available (from nearest cars)
    if (typeof car.distance_km === "number") {
      return car.distance_km.toFixed(1);
    }

    // 2. Calculate if we have coordinates
    if (
      userLocation &&
      car.branch?.latitude &&
      car.branch?.longitude
    ) {
      const dist = calculateDistance(userLocation, {
        lat: car.branch.latitude,
        lon: car.branch.longitude,
      });
      return dist.toFixed(1);
    }

    return null;
  }, [car, userLocation, calculateDistance]);

  const styles = StyleSheet.create({
    // ✅ Card محسّن للـ Grid - أصغر وأكثر تناسق
    card: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: getSpacing(10),
      overflow: "hidden",
      opacity: isUnavailable ? 0.7 : 1,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    imageContainer: {
      position: "relative",
      height: getImageHeight(),
      width: "100%",
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    badgeContainer: {
      position: "absolute",
      top: getSpacing(6),
      left: activeLanguage === "ar" ? undefined : getSpacing(6),
      right: activeLanguage === "ar" ? getSpacing(6) : undefined,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: getSpacing(4),
      maxWidth: "85%",
      alignItems: activeLanguage === "ar" ? "flex-end" : "flex-start",
    },
    gradientOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
    },
    // ✅ Content مضغوط للـ Grid
    content: {
      padding: getSpacing(10),
    },
    // ✅ Car Info مختصر
    carInfo: {
      marginBottom: getSpacing(6),
    },
    carTitle: {
      fontSize: getFontSize(13),
      fontFamily: fonts.Bold,
      color: colors.text,
      marginBottom: getSpacing(2),
      textAlign: activeLanguage === "ar" ? "right" : "left",
      letterSpacing: -0.2,
    },
    carSubtitle: {
      fontSize: getFontSize(10),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: activeLanguage === "ar" ? "right" : "left",
    },
    // ✅ Features - icons فقط بدون نص (لتوفير المساحة)
    featuresContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: getSpacing(8),
      marginBottom: getSpacing(8),
      paddingVertical: getSpacing(6),
      paddingHorizontal: getSpacing(8),
      backgroundColor:
        scheme === "light" ? colors.backgroundSecondary : colors.background,
      borderRadius: getSpacing(6),
    },
    featureItem: {
      flexDirection: activeLanguage === "ar" ? "row-reverse" : "row",
      alignItems: "center",
      gap: getSpacing(3),
      flex: 1,
    },
    featureDivider: {
      width: 1,
      height: getFontSize(12),
      backgroundColor: colors.border,
    },
    featureText: {
      fontSize: getFontSize(9),
      fontFamily: fonts.Medium,
      color: colors.text,
    },
    // ✅ Pricing مضغوط
    pricingContainer: {
      marginBottom: getSpacing(8),
    },
    priceRow: {
      flexDirection: activeLanguage === "ar" ? "row-reverse" : "row",
      alignItems: "center",
      gap: getSpacing(3),
      marginBottom: getSpacing(1),
    },
    currentPrice: {
      fontSize: getFontSize(17),
      fontFamily: fonts.Bold,
      color: colors.primary,
      letterSpacing: -0.3,
    },
    currency: {
      fontSize: getFontSize(11),
      fontFamily: fonts.SemiBold,
      color: colors.primary,
    },
    perDayText: {
      fontSize: getFontSize(9),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: activeLanguage === "ar" ? "right" : "left",
    },
    // ✅ Original Price مختصر
    originalPriceRow: {
      flexDirection: activeLanguage === "ar" ? "row-reverse" : "row",
      alignItems: "center",
      gap: getSpacing(2),
      marginTop: getSpacing(1),
    },
    originalPrice: {
      fontSize: getFontSize(10),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textDecorationLine: "line-through",
    },
    discountBadge: {
      fontSize: getFontSize(8),
      fontFamily: fonts.Bold,
      color: colors.success,
      paddingHorizontal: getSpacing(3),
      paddingVertical: getSpacing(1),
      backgroundColor: colors.success + "15",
      borderRadius: getSpacing(3),
    },
    // ✅ Button مدمج - full width
    button: {
      backgroundColor: colors.primary,
      paddingVertical: getSpacing(8),
      borderRadius: getSpacing(6),
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: getSpacing(4),
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    buttonDisabled: {
      backgroundColor: colors.borderDark,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: getSpacing(3),
    },
    buttonText: {
      fontSize: getFontSize(11),
      fontFamily: fonts.Bold,
      color: colors.textInverse,
    },
    buttonTextDisabled: {
      color: colors.textSecondary,
    },
    // ✅ Status indicator صغير
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isAvailable ? colors.success : colors.error,
    },
    // ✅ Distance Badge Styles
    distanceBadge: {
      position: "absolute",
      bottom: getSpacing(8),
      right: activeLanguage === "ar" ? undefined : getSpacing(8),
      left: activeLanguage === "ar" ? getSpacing(8) : undefined,
      flexDirection: "row",
      alignItems: "center",
      gap: getSpacing(2),
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      paddingHorizontal: getSpacing(6),
      paddingVertical: getSpacing(3),
      borderRadius: getSpacing(4),
      zIndex: 10,
    },
    distanceText: {
      fontSize: getFontSize(10),
      fontFamily: fonts.Bold,
      color: "#FFFFFF",
    },
  });

  const savedAmount = car.price.daily - discountedPrice;

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={handleCardPress}
        activeOpacity={0.95}
        disabled={isUnavailable}
      >
        {/* ✅ Image Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: car.images[0] }} style={styles.image} />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.35)"]}
            style={styles.gradientOverlay}
          />

          {/* ✅ Badges مختصرة */}
          <View style={styles.badgeContainer}>
            {car.isNew && <Badge variant="default">{t("featured.new")}</Badge>}

            {(car.discount ?? 0) > 0 && (
              <Badge variant="secondary">
                {activeLanguage === "ar"
                  ? `-${car.discount}%`
                  : `-${car.discount}%`}
              </Badge>
            )}

            {isUnavailable && (
              <Badge variant="destructive">{t("featured.unavailable")}</Badge>
            )}
          </View>

          {/* ✅ Distance Badge (New High Visibility) */}
          {distance && (
            <View style={styles.distanceBadge}>
              <Ionicons
                name="location"
                size={getFontSize(10)}
                color="#FFFFFF"
              />
              <Text style={styles.distanceText}>
                {distance} {t("common.km")}
              </Text>
            </View>
          )}
        </View>

        {/* ✅ Content مضغوط */}
        <View style={styles.content}>
          {/* Car Info */}
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

          {/* ✅ Features مختصرة */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons
                name="people-outline"
                size={getFontSize(13)}
                color={colors.primary}
              />
              <Text style={styles.featureText}>{car.specs.seats}</Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureItem}>
              <Ionicons
                name="flash-outline"
                size={getFontSize(13)}
                color={colors.primary}
              />
              <Text style={styles.featureText} numberOfLines={1}>
                {activeLanguage === "ar" ? "أوتو" : "Auto"}
              </Text>
            </View>
          </View>

          {/* ✅ Pricing مختصر */}
          <View style={styles.pricingContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>{discountedPrice}</Text>
              <Image
                source={icons.riyalsymbol}
                resizeMode="contain"
                style={{
                  width: getFontSize(14),
                  height: getFontSize(14),
                  tintColor: colors.primary,
                }}
              />
            </View>

            <View style={{flexDirection:'row', alignItems:'center', justifyContent: activeLanguage === "ar" ? "flex-end" : "flex-start" , gap:getSpacing(2)}}>


            <Text style={styles.perDayText}>{t("common.perday")}</Text>

            {(car.discount ?? 0) > 0 && (
              <View style={styles.originalPriceRow}>
                <Text style={styles.originalPrice}>{car.price.daily}</Text>
                <Image
                  source={icons.riyalsymbol}
                  resizeMode="contain"
                  style={{
                    width: getFontSize(10),
                    height: getFontSize(10),
                    tintColor: colors.textSecondary,
                  }}
                />
                <Text style={styles.discountBadge}>
                  {activeLanguage === "ar"
                    ? `وفّر ${savedAmount}`
                    : `Save ${savedAmount}`}
                </Text>
              </View>
            )}
                        </View>

          </View>

          {/* ✅ Button مع status indicator */}
          <TouchableOpacity
            style={[styles.button, isUnavailable && styles.buttonDisabled]}
            onPress={handleBookNow}
            disabled={isUnavailable}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.statusDot} />
              <Text
                style={[
                  styles.buttonText,
                  isUnavailable && styles.buttonTextDisabled,
                ]}
              >
                {isAvailable ? t("featured.book") : t("featured.unavailable")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

export default CarCard;
