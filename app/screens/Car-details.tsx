import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Fuel,
  MapPin,
  Star,
  Users,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import our custom hooks and components
import { Badge } from "@/components/ui/Badge2";
import { Card } from "@/components/ui/Card";
import { icons } from "@/constants";
import { useCars } from "@/hooks/supabaseHooks/useCars";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";

type RentalType = "daily" | "weekly" | "monthly";

export default function CarDetailsScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const router = useRouter();

  // Hooks
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { selectedCar, loading, error, getCarById, calculatePriceWithOffers } =
    useCars();
  const { currentLanguage: language, isRTL } = useLanguageStore();

  // Local state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedRentalType, setSelectedRentalType] =
    useState<RentalType>("daily");
  const [priceCalculation, setPriceCalculation] = useState<any>(null);

  // Load car data
  useEffect(() => {
    if (carId) {
      getCarById(carId);
    }
  }, [carId]);

  // Calculate pricing when rental type or car changes
  useEffect(() => {
    if (selectedCar) {
      calculatePriceWithOffers(selectedCar.id, 1, selectedRentalType)
        .then(setPriceCalculation)
        .catch(console.error);
    }
  }, [selectedCar, selectedRentalType]);

  // Helper functions for localized content
  const getBrand = () =>
    language === "ar" ? selectedCar?.brand_name_ar : selectedCar?.brand_name_en;
  const getModel = () =>
    language === "ar" ? selectedCar?.model_name_ar : selectedCar?.model_name_en;
  const getColor = () =>
    language === "ar" ? selectedCar?.color_name_ar : selectedCar?.color_name_en;
  const getBranchName = () =>
    language === "ar"
      ? selectedCar?.branch_name_ar
      : selectedCar?.branch_name_en;
  const getBranchLocation = () =>
    language === "ar"
      ? selectedCar?.branch_location_ar
      : selectedCar?.branch_location_en;
  const getFeatures = () =>
    language === "ar" ? selectedCar?.features_ar : selectedCar?.features_en;
  const getDescription = () =>
    language === "ar"
      ? selectedCar?.description_ar
      : selectedCar?.description_en;

  // Helper function for fuel type translation
  const getFuelType = () => {
    const fuelType = selectedCar?.fuel_type;
    console.log("Fuel type from DB:", fuelType); // للتشخيص

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
    const transmission = selectedCar?.transmission;
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

  const handleBooking = () => {
    if (selectedCar?.status === "available") {
      router.push({
        pathname: "/screens/Booking",
        params: { carId: selectedCar.id },
      });
    }
  };

  const renderRentalTypeButton = (
    type: RentalType,
    label: string,
    price: number
  ) => {
    const isSelected = selectedRentalType === type;
    const finalPrice = selectedCar?.discount_percentage
      ? Math.round(price * (1 - selectedCar.discount_percentage / 100))
      : price;

    return (
      <TouchableOpacity
        onPress={() => setSelectedRentalType(type)}
        style={{
          flex: 1,
          backgroundColor: isSelected
            ? theme.colors.primary
            : theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          borderWidth: 1,
          borderRadius: responsive.getBorderRadius("medium"),
          paddingVertical: responsive.spacing.md,
          paddingHorizontal: responsive.spacing.sm,
          alignItems: "center",
          justifyContent: "center",
          minHeight: responsive.getButtonHeight("secondary"),
        }}
      >
        <Text
          style={{
            fontFamily: fonts.Medium || fonts.Regular,
            fontSize: responsive.typography.caption,
            color: isSelected ? theme.colors.textInverse : theme.colors.text,
            marginBottom: responsive.spacing.xs,
            textAlign: "center",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {label}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
              fontSize: responsive.typography.body,
              color: isSelected
                ? theme.colors.textInverse
                : theme.colors.primary,
              textAlign: "center",
              writingDirection: language === "ar" ? "rtl" : "ltr",
            }}
          >
            {finalPrice}
          </Text>
          <Image
            source={icons.riyalsymbol}
            resizeMode="contain"
            style={{
              width: responsive.typography.body * 0.8,
              height: responsive.typography.body * 0.8,
              marginLeft: responsive.spacing.xs,
              tintColor: isSelected
                ? theme.colors.textInverse
                : theme.colors.primary,
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Loading State
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
          ...responsive.getSafePadding(),
        }}
      >
        <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={{
            fontFamily: fonts.Regular,
            fontSize: responsive.typography.body,
            color: theme.colors.textSecondary,
            marginTop: responsive.spacing.md,
            textAlign: "center",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {language === "ar" ? "جاري التحميل..." : "Loading..."}
        </Text>
      </View>
    );
  }

  // Error State
  if (error || !selectedCar) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: responsive.spacing.lg,
          ...responsive.getSafePadding(),
        }}
      >
        <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
        <Text
          style={{
            fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
            fontSize: responsive.typography.h3,
            color: theme.colors.text,
            textAlign: "center",
            marginBottom: responsive.spacing.md,
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {language === "ar" ? "السيارة غير موجودة" : "Car Not Found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: responsive.spacing.lg,
            paddingVertical: responsive.spacing.md,
            borderRadius: responsive.getBorderRadius("medium"),
            minHeight: responsive.getButtonHeight("primary"),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.Medium || fonts.Regular,
              fontSize: responsive.typography.body,
              color: theme.colors.textInverse,
              textAlign: "center",
              writingDirection: language === "ar" ? "rtl" : "ltr",
            }}
          >
            {language === "ar" ? "العودة" : "Go Back"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images =
    selectedCar.additional_images && selectedCar.additional_images.length > 0
      ? selectedCar.additional_images
      : selectedCar.main_image_url
      ? [selectedCar.main_image_url]
      : [];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        ...responsive.getSafePadding(),
      }}
    >
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: responsive.spacing.lg,
          paddingVertical: responsive.spacing.md,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + "20",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: responsive.spacing.sm,
            borderRadius: responsive.getBorderRadius("medium"),
            backgroundColor: theme.colors.backgroundSecondary,
            width: 48,
            height: 48,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft
            size={responsive.getIconSize("medium")}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
            fontSize: responsive.typography.h4,
            color: theme.colors.text,
            marginHorizontal: responsive.spacing.md,
            flex: 1,
            textAlign: language === "ar" ? "right" : "left",
            writingDirection: language === "ar" ? "rtl" : "ltr",
          }}
        >
          {language === "ar" ? "تفاصيل السيارة" : "Car Details"}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: responsive.spacing.xl,
        }}
      >
        {/* Main Image Section */}
        <View
          style={{
            paddingHorizontal: responsive.spacing.lg,
            paddingVertical: responsive.spacing.lg,
          }}
        >
          {/* Main Image */}
          <View
            style={{
              borderRadius: responsive.getBorderRadius("large"),
              overflow: "hidden",
              backgroundColor: theme.colors.backgroundSecondary,
              marginBottom: responsive.spacing.md,
            }}
          >
            <Image
              source={{ uri: images[selectedImageIndex] || "" }}
              style={{
                width: "100%",
                height: responsive.isVerySmallScreen
                  ? 200
                  : responsive.isSmallScreen
                  ? 240
                  : responsive.isMediumScreen
                  ? 280
                  : 320,
              }}
              resizeMode="cover"
            />

            {/* Badges Overlay */}
            <View
              style={{
                position: "absolute",
                top: responsive.spacing.md,
                right: language === "ar" ? responsive.spacing.md : undefined,
                left: language === "ar" ? undefined : responsive.spacing.md,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: responsive.spacing.xs,
              }}
            >
              {selectedCar.is_new && (
                <Badge variant="success" size="sm">
                  {language === "ar" ? "جديد" : "New"}
                </Badge>
              )}
              {selectedCar.discount_percentage > 0 && (
                <Badge variant="warning" size="sm">
                  {language === "ar"
                    ? `خصم ${selectedCar.discount_percentage}%`
                    : `${selectedCar.discount_percentage}% Off`}
                </Badge>
              )}
              <Badge variant="available" size="sm">
                {language === "ar" ? "متاح" : "Available"}
              </Badge>
            </View>
          </View>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: responsive.spacing.sm,
                paddingHorizontal: responsive.spacing.xs,
              }}
            >
              {images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: responsive.getBorderRadius("medium"),
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor:
                      index === selectedImageIndex
                        ? theme.colors.primary
                        : "transparent",
                  }}
                >
                  <Image
                    source={{ uri: image || "" }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Car Info Section */}
        <View style={{ paddingHorizontal: responsive.spacing.lg }}>
          {/* Title and Rating */}
          <View style={{ marginBottom: responsive.spacing.lg }}>
            <Text
              style={{
                fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
                fontSize: responsive.typography.h2,
                color: theme.colors.text,
                marginBottom: responsive.spacing.sm,
                textAlign: language === "ar" ? "right" : "left",
                lineHeight: responsive.typography.h2 * 1.2,
                writingDirection: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {getBrand()} {getModel()}
            </Text>

            <Text
              style={{
                fontFamily: fonts.Regular,
                fontSize: responsive.typography.body,
                color: theme.colors.textSecondary,
                marginBottom: responsive.spacing.md,
                textAlign: language === "ar" ? "right" : "left",
                lineHeight: responsive.typography.body * 1.3,
                writingDirection: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {selectedCar.year} • {getColor()}
            </Text>

            {/* Rating */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: responsive.spacing.sm,
                justifyContent: language === "ar" ? "flex-end" : "flex-start",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 2,
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={responsive.getIconSize("small")}
                    color="#FCD34D"
                    fill="#FCD34D"
                  />
                ))}
              </View>
              <Text
                style={{
                  fontFamily: fonts.Regular,
                  fontSize: responsive.typography.caption,
                  color: theme.colors.textSecondary,
                  textAlign: language === "ar" ? "right" : "left",
                  writingDirection: language === "ar" ? "rtl" : "ltr",
                }}
              >
                4.8 (124 {language === "ar" ? "تقييم" : "reviews"})
              </Text>
            </View>
          </View>

          {/* Pricing Card */}
          <Card style={{ marginBottom: responsive.spacing.lg }}>
            <Card.Header>
              <Card.Title
                style={{
                  textAlign: language === "ar" ? "right" : "left",
                  writingDirection: language === "ar" ? "rtl" : "ltr",
                }}
              >
                {language === "ar" ? "الأسعار" : "Pricing"}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {/* Rental Type Selection */}
              <View
                style={{
                  flexDirection: "row",
                  gap: responsive.spacing.sm,
                  marginBottom: responsive.spacing.lg,
                }}
              >
                {renderRentalTypeButton(
                  "daily",
                  language === "ar" ? "يومي" : "Daily",
                  selectedCar.daily_price
                )}
                {selectedCar.weekly_price &&
                  renderRentalTypeButton(
                    "weekly",
                    language === "ar" ? "أسبوعي" : "Weekly",
                    selectedCar.weekly_price
                  )}
                {selectedCar.monthly_price &&
                  renderRentalTypeButton(
                    "monthly",
                    language === "ar" ? "شهري" : "Monthly",
                    selectedCar.monthly_price
                  )}
              </View>

              {/* Final Price Display */}
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: responsive.spacing.md,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: responsive.spacing.xs,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
                      fontSize: responsive.typography.h2,
                      color: theme.colors.primary,
                      textAlign: "center",
                      lineHeight: responsive.typography.h2 * 1.1,
                      writingDirection: language === "ar" ? "rtl" : "ltr",
                    }}
                  >
                    {priceCalculation?.finalPrice || selectedCar.daily_price}
                  </Text>
                  <Image
                    source={icons.riyalsymbol}
                    resizeMode="contain"
                    style={{
                      width: responsive.typography.h2 * 0.6,
                      height: responsive.typography.h2 * 0.6,
                      marginLeft: responsive.spacing.sm,
                      tintColor: theme.colors.primary,
                    }}
                  />
                </View>

                {selectedCar.discount_percentage > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: responsive.spacing.xs,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.Regular,
                        fontSize: responsive.typography.body,
                        color: theme.colors.textSecondary,
                        textDecorationLine: "line-through",
                        textAlign: "center",
                        writingDirection: language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      {priceCalculation?.originalPrice ||
                        selectedCar.daily_price}
                    </Text>
                    <Image
                      source={icons.riyalsymbol}
                      resizeMode="contain"
                      style={{
                        width: responsive.typography.body * 0.7,
                        height: responsive.typography.body * 0.7,
                        marginLeft: responsive.spacing.xs,
                        tintColor: theme.colors.textSecondary,
                      }}
                    />
                  </View>
                )}

                <Text
                  style={{
                    fontFamily: fonts.Regular,
                    fontSize: responsive.typography.caption,
                    color: theme.colors.textSecondary,
                    marginTop: responsive.spacing.sm,
                    textAlign: "center",
                    writingDirection: language === "ar" ? "rtl" : "ltr",
                  }}
                >
                  {selectedRentalType === "daily"
                    ? language === "ar"
                      ? "في اليوم"
                      : "per day"
                    : selectedRentalType === "weekly"
                    ? language === "ar"
                      ? "في الأسبوع"
                      : "per week"
                    : language === "ar"
                    ? "في الشهر"
                    : "per month"}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Book Button */}
          <TouchableOpacity
            onPress={handleBooking}
            disabled={selectedCar.status !== "available"}
            style={{
              backgroundColor:
                selectedCar.status === "available"
                  ? theme.colors.primary
                  : theme.colors.textMuted,
              paddingVertical: responsive.spacing.md,
              paddingHorizontal: responsive.spacing.lg,
              borderRadius: responsive.getBorderRadius("medium"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: responsive.spacing.md,
              opacity: selectedCar.status === "available" ? 1 : 0.6,
              minHeight: responsive.getButtonHeight("primary"),
              gap: responsive.spacing.sm,
            }}
          >
            <Calendar
              size={responsive.getIconSize("medium")}
              color={theme.colors.textInverse}
            />
            <Text
              style={{
                fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
                fontSize: responsive.typography.body,
                color: theme.colors.textInverse,
                textAlign: "center",
                writingDirection: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {selectedCar.status === "available"
                ? language === "ar"
                  ? "احجز الآن"
                  : "Book Now"
                : language === "ar"
                ? "غير متاح حالياً"
                : "Currently Unavailable"}
            </Text>
          </TouchableOpacity>

          {/* Availability Status */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: responsive.spacing.xs,
              marginBottom: responsive.spacing.lg,
            }}
          >
            <Clock
              size={responsive.getIconSize("small")}
              color={theme.colors.success}
            />
            <Text
              style={{
                fontFamily: fonts.Medium || fonts.Regular,
                fontSize: responsive.typography.caption,
                color: theme.colors.success,
                textAlign: "center",
                writingDirection: language === "ar" ? "rtl" : "ltr",
              }}
            >
              {language === "ar" ? "متاح للحجز" : "Available for booking"}
            </Text>
          </View>

          {/* Specifications Card */}
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
                {[
                  {
                    icon: Users,
                    label: language === "ar" ? "عدد المقاعد" : "Seats",
                    value: selectedCar?.seats?.toString() ?? "-",
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
                    value: selectedCar?.mileage
                      ? `${selectedCar.mileage.toLocaleString()} ${
                          language === "ar" ? "كم" : "km"
                        }`
                      : language === "ar"
                      ? "غير محدد"
                      : "Not specified",
                  },
                ].map((spec, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: language === "ar" ? "row-reverse" : "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: responsive.spacing.sm,
                      borderBottomWidth: index < 3 ? 1 : 0,
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

          {/* Features Card */}
          {getFeatures() && getFeatures()!.length > 0 && (
            <Card style={{ marginBottom: responsive.spacing.lg }}>
              <Card.Header>
                <Card.Title
                  style={{
                    textAlign: language === "ar" ? "right" : "left",
                    writingDirection: language === "ar" ? "rtl" : "ltr",
                  }}
                >
                  {language === "ar" ? "المميزات" : "Features"}
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: responsive.spacing.md,
                  }}
                >
                  {getFeatures()!.map((feature, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection:
                          language === "ar" ? "row-reverse" : "row",
                        alignItems: "center",
                        gap: responsive.spacing.sm,
                        paddingVertical: responsive.spacing.xs,
                        minWidth: "45%",
                        minHeight: 36,
                      }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: theme.colors.primary,
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: fonts.Regular,
                          fontSize: responsive.typography.body,
                          color: theme.colors.text,
                          flex: 1,
                          textAlign: language === "ar" ? "right" : "left",
                          lineHeight: responsive.typography.body * 1.3,
                          writingDirection: language === "ar" ? "rtl" : "ltr",
                        }}
                      >
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Branch Information */}
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
                    {getBranchName()}
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
                    {getBranchLocation()}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Insurance Card */}
          <Card style={{ marginBottom: responsive.spacing.lg }}>
            <Card.Header>
              <Card.Title
                style={{
                  textAlign: language === "ar" ? "right" : "left",
                  writingDirection: language === "ar" ? "rtl" : "ltr",
                }}
              >
                {language === "ar" ? "التأمين والضمان" : "Insurance & Warranty"}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <View style={{ gap: responsive.spacing.md }}>
                <Text
                  style={{
                    fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
                    fontSize: responsive.typography.h4,
                    color: theme.colors.text,
                    textAlign: language === "ar" ? "right" : "left",
                    lineHeight: responsive.typography.h4 * 1.3,
                    writingDirection: language === "ar" ? "rtl" : "ltr",
                  }}
                >
                  {language === "ar"
                    ? "التغطية التأمينية"
                    : "Insurance Coverage"}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: responsive.spacing.sm,
                  }}
                >
                  {[
                    language === "ar"
                      ? "تأمين شامل ضد الحوادث"
                      : "Comprehensive accident insurance",
                    language === "ar" ? "تأمين ضد السرقة" : "Theft insurance",
                    language === "ar"
                      ? "تأمين الطرف الثالث"
                      : "Third party insurance",
                    language === "ar"
                      ? "مساعدة طوارئ 24/7"
                      : "24/7 roadside assistance",
                  ].map((coverage, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: theme.colors.backgroundTertiary,
                        paddingHorizontal: responsive.spacing.md,
                        paddingVertical: responsive.spacing.sm,
                        borderRadius: responsive.getBorderRadius("medium"),
                        flexDirection:
                          language === "ar" ? "row-reverse" : "row",
                        alignItems: "center",
                        gap: responsive.spacing.sm,
                        width: "48%",
                        minHeight: 44,
                      }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: theme.colors.success,
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: fonts.Regular,
                          fontSize: responsive.typography.caption,
                          color: theme.colors.text,
                          flex: 1,
                          textAlign: language === "ar" ? "right" : "left",
                          lineHeight: responsive.typography.caption * 1.4,
                          writingDirection: language === "ar" ? "rtl" : "ltr",
                        }}
                      >
                        {coverage}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
