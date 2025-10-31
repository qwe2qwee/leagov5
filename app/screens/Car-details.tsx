import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import our custom hooks and components

import CarBookingButton from "@/components/CarDetails/CarBookingButton";
import CarBranchInfo from "@/components/CarDetails/CarBranchInfo";
import CarDetailsHeader from "@/components/CarDetails/CarDetailsHeader";
import CarFeatures from "@/components/CarDetails/CarFeatures";
import CarImages from "@/components/CarDetails/CarImages";
import CarInsurance from "@/components/CarDetails/CarInsurance";
import CarPricing from "@/components/CarDetails/CarPricing";
import CarSpecifications from "@/components/CarDetails/CarSpecifications";
import CarTitleAndRating from "@/components/CarDetails/CarTitleAndRating";
import { useCars } from "@/hooks/supabaseHooks/useCars";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";

type RentalType = "daily" | "weekly" | "monthly";

export default function CarDetailsScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const { push, back } = useSafeNavigate();

  // Hooks
  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { selectedCar, loading, error, getCarById, calculateQuickPrice } =
    useCars();
  const { currentLanguage: language } = useLanguageStore();

  // Local state
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
      calculateQuickPrice(selectedCar, selectedRentalType);
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

  const handleBooking = () => {
    if (selectedCar?.status === "available") {
      push({
        pathname: "/screens/Booking",
        params: { carId: selectedCar.id },
      });
    }
  };

  const handleRentalTypeChange = (type: RentalType) => {
    setSelectedRentalType(type);
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
          onPress={() => back()}
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
      <CarDetailsHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: responsive.spacing.xl,
        }}
      >
        {/* Main Image Section */}
        <CarImages
          images={images}
          isNew={selectedCar.is_new}
          discountPercentage={selectedCar.discount_percentage}
          isAvailable={selectedCar.status === "available"}
        />

        {/* Car Info Section */}
        <View style={{ paddingHorizontal: responsive.spacing.lg }}>
          {/* Title and Rating */}
          <CarTitleAndRating
            brand={getBrand() || ""}
            model={getModel() || ""}
            year={selectedCar.year}
            color={getColor() || ""}
          />

          {/* Pricing Card */}
          <CarPricing
            dailyPrice={selectedCar.daily_price}
            weeklyPrice={selectedCar.weekly_price || selectedCar.daily_price}
            monthlyPrice={selectedCar.monthly_price || selectedCar.daily_price}
            discountPercentage={selectedCar.discount_percentage}
            priceCalculation={priceCalculation}
            onRentalTypeChange={handleRentalTypeChange}
          />

          {/* Book Button */}
          <CarBookingButton
            status={selectedCar.status}
            onBookPress={handleBooking}
          />

          {/* Specifications Card */}
          <CarSpecifications
            seats={selectedCar.seats}
            transmission={selectedCar.transmission}
            fuelType={selectedCar.fuel_type}
            mileage={selectedCar.mileage}
          />

          {/* Features Card */}
          {getFeatures() && getFeatures()!.length > 0 && (
            <CarFeatures features={getFeatures()!} />
          )}

          {/* Branch Information */}
          <CarBranchInfo
            branchName={getBranchName() || ""}
            branchLocation={getBranchLocation() || ""}
          />
          {/* Insurance Card */}
          <CarInsurance />
        </View>
      </ScrollView>
    </View>
  );
}
