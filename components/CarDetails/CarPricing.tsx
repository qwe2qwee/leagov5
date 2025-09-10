import { Card } from "@/components/ui/Card";
import { icons } from "@/constants";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React, { useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type RentalType = "daily" | "weekly" | "monthly";

interface PriceCalculation {
  finalPrice: number;
  originalPrice: number;
}

interface CarPricingProps {
  dailyPrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  discountPercentage?: number;
  priceCalculation?: PriceCalculation;
  onRentalTypeChange?: (type: RentalType) => void;
}

export default function CarPricing({
  dailyPrice,
  weeklyPrice,
  monthlyPrice,
  discountPercentage = 0,
  priceCalculation,
  onRentalTypeChange,
}: CarPricingProps) {
  const [selectedRentalType, setSelectedRentalType] =
    useState<RentalType>("daily");

  const responsive = useResponsive();
  const theme = useTheme();
  const fonts = useFontFamily();
  const { currentLanguage: language } = useLanguageStore();

  // Get base price for selected rental type
  const getBasePrice = useMemo(() => {
    switch (selectedRentalType) {
      case "weekly":
        return weeklyPrice || dailyPrice;
      case "monthly":
        return monthlyPrice || dailyPrice;
      default:
        return dailyPrice;
    }
  }, [selectedRentalType, dailyPrice, weeklyPrice, monthlyPrice]);

  // Calculate final price with discount
  const finalPrice = useMemo(() => {
    if (priceCalculation?.finalPrice) {
      return priceCalculation.finalPrice;
    }

    if (discountPercentage > 0) {
      return Math.round(getBasePrice * (1 - discountPercentage / 100));
    }

    return getBasePrice;
  }, [priceCalculation, getBasePrice, discountPercentage]);

  // Get original price for display
  const originalPrice = useMemo(() => {
    return priceCalculation?.originalPrice || getBasePrice;
  }, [priceCalculation, getBasePrice]);

  // Handle rental type selection
  const handleRentalTypeChange = (type: RentalType) => {
    setSelectedRentalType(type);
    onRentalTypeChange?.(type);
  };

  // Calculate price for rental type button
  const getButtonPrice = (type: RentalType, price: number) => {
    if (discountPercentage > 0) {
      return Math.round(price * (1 - discountPercentage / 100));
    }
    return price;
  };

  // Render rental type selection button
  const renderRentalTypeButton = (
    type: RentalType,
    label: string,
    price: number
  ) => {
    const isSelected = selectedRentalType === type;
    const buttonPrice = getButtonPrice(type, price);

    return (
      <TouchableOpacity
        onPress={() => handleRentalTypeChange(type)}
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
            {buttonPrice}
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

  // Get period text for selected rental type
  const getPeriodText = () => {
    switch (selectedRentalType) {
      case "weekly":
        return language === "ar" ? "في الأسبوع" : "per week";
      case "monthly":
        return language === "ar" ? "في الشهر" : "per month";
      default:
        return language === "ar" ? "في اليوم" : "per day";
    }
  };

  const hasDiscount =
    discountPercentage > 0 ||
    (priceCalculation &&
      priceCalculation.finalPrice < priceCalculation.originalPrice);

  return (
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
        {/* Rental Type Selection Buttons */}
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
            dailyPrice
          )}

          {weeklyPrice &&
            renderRentalTypeButton(
              "weekly",
              language === "ar" ? "أسبوعي" : "Weekly",
              weeklyPrice
            )}

          {monthlyPrice &&
            renderRentalTypeButton(
              "monthly",
              language === "ar" ? "شهري" : "Monthly",
              monthlyPrice
            )}
        </View>

        {/* Price Display Section */}
        <View
          style={{
            alignItems: "center",
            paddingVertical: responsive.spacing.md,
          }}
        >
          {/* Final Price */}
          {/* <View
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
              {finalPrice}
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
          </View> */}

          {/* Original Price (if there's a discount) */}
          {hasDiscount && (
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
                {originalPrice}
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

          {/* Period Text */}
          {hasDiscount && (
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
              {getPeriodText()}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
