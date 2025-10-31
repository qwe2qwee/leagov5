import { icons } from "@/constants";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useNavLockStore } from "@/store/useNavLockStore";
import { Car, CarCardProps } from "@/types/CardTypes";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export const CarCard: React.FC<CarCardProps> = ({
  car,
  language = "ar",
  cardWidth,
}) => {
  const { colors } = useTheme();
  const { currentLanguage } = useLanguageStore();
  const { lock, unlock } = useNavLockStore();

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

  // Use the language from store if not provided
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
  const getBranchLocation = (car: Car) =>
    activeLanguage === "ar" ? car.branch.location_ar : car.branch.location_en;

  const t = (key: string) => {
    const translations = {
      "featured.new": activeLanguage === "ar" ? "جديد" : "New",
      "featured.unavailable":
        activeLanguage === "ar" ? "غير متاح" : "Unavailable",
      "featured.book": activeLanguage === "ar" ? "احجز الآن" : "Book Now",
      "common.sar": activeLanguage === "ar" ? "ر.س" : "SAR",
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

  const handleCardPress = () => {
    try {
      // Lock navigation to prevent double taps
      lock();

      // Navigate to car details page
      push({
        pathname: "/screens/Car-details",
        params: {
          carId: car.id,
        },
      });
    } catch (error) {
      console.error("[CarCard] Error navigating to car details:", error);
      // Unlock navigation on error
      unlock();
    }
  };

  const handleBookNow = (e: any) => {
    // Prevent event from bubbling to card press
    e.stopPropagation();

    if (car.available) {
      try {
        lock();

        // Navigate to booking page
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

  // Dynamic spacing based on screen size
  const dynamicPricingMargin = isSmallScreen
    ? getSpacing(1)
    : isMediumScreen
    ? getSpacing(1)
    : getSpacing(3);

  const styles = StyleSheet.create({
    card: {
      width: getCardWidth() + getSpacing(6),
      // Fixed height for all cards
      height: getImageHeight() + getSpacing(145),
      backgroundColor: colors.surface,
      borderRadius: getSpacing(8),
      overflow: "hidden",

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
      flex: 1,
      padding: getSpacing(8),
      justifyContent: "space-between",
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
      flexDirection: activeLanguage === "ar" ? "row-reverse" : "row",
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
      marginBottom: dynamicPricingMargin,
    },
    carTitle: {
      fontSize: getFontSize(14),
      fontFamily: fonts.Bold,
      color: colors.text,
      marginBottom: getSpacing(1),
      textAlign: activeLanguage === "ar" ? "right" : "left",
    },
    carSubtitle: {
      fontSize: getFontSize(10),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: activeLanguage === "ar" ? "right" : "left",
    },
    locationText: {
      fontSize: getFontSize(9),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      flexShrink: 1,
      textAlign: activeLanguage === "ar" ? "right" : "left",
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
      textAlign: activeLanguage === "ar" ? "right" : "left",
    },
    availabilityContainer: {
      flexDirection: activeLanguage === "ar" ? "row-reverse" : "row",
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
      marginTop: "auto",
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
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.card}
        onPress={handleCardPress}
        activeOpacity={0.9}
      >
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
                {activeLanguage === "ar"
                  ? `خصم ${car.discount}%`
                  : `${car.discount}% OFF`}
              </Badge>
            )}
            {car.available && (
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
                  {car.specs.seats}{" "}
                  {activeLanguage === "ar" ? "مقاعد" : "seats"}
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
                  {activeLanguage === "ar" ? "في اليوم" : "per day"}
                </Text>
              </View>

              <View style={styles.availabilityContainer}>
                <Ionicons
                  name="time-outline"
                  size={getFontSize(12)}
                  color={colors.textSecondary}
                />
                <Text style={styles.availabilityText}>
                  {activeLanguage === "ar" ? "متاح الآن" : "Available now"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, car.available && styles.buttonDisabled]}
            onPress={handleBookNow}
            disabled={!car.available}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.buttonText,
                car.available && styles.buttonTextDisabled,
              ]}
            >
              {!car.available ? t("featured.book") : t("featured.unavailable")}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

export default CarCard;
