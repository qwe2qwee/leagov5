import { Badge } from "@/components/ui/Badge2";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React, { useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";

interface CarImagesProps {
  images: string[];
  isNew?: boolean;
  discountPercentage?: number;
  isAvailable?: boolean;
}

export default function CarImages({
  images,
  isNew = false,
  discountPercentage = 0,
  isAvailable = true,
}: CarImagesProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const responsive = useResponsive();
  const theme = useTheme();
  const { currentLanguage: language } = useLanguageStore();

  if (!images || images.length === 0) {
    return null;
  }

  return (
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
          {isNew && (
            <Badge variant="success" size="sm">
              {language === "ar" ? "جديد" : "New"}
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="warning" size="sm">
              {language === "ar"
                ? `خصم ${discountPercentage}%`
                : `${discountPercentage}% Off`}
            </Badge>
          )}
          {isAvailable && (
            <Badge variant="available" size="sm">
              {language === "ar" ? "متاح" : "Available"}
            </Badge>
          )}
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
  );
}
