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
          elevation: 8,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme.scheme === "dark" ? 0.5 : 0.15,
          shadowRadius: 12,
          borderWidth: 1,
          borderColor:
            theme.scheme === "dark"
              ? theme.colors.border + "40"
              : theme.colors.border + "30",
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

        {/* Badges Overlay with Enhanced Design */}
        <View
          style={{
            position: "absolute",
            top: responsive.spacing.md,
            right: language === "ar" ? responsive.spacing.md : undefined,
            left: language === "ar" ? undefined : responsive.spacing.md,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: responsive.spacing.sm,
          }}
        >
          {isNew && (
            <View
              style={{
                elevation: 4,
                shadowColor: theme.colors.success,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }}
            >
              <Badge variant="success" size="sm">
                {language === "ar" ? "جديد" : "New"}
              </Badge>
            </View>
          )}
          {discountPercentage > 0 && (
            <View
              style={{
                elevation: 4,
                shadowColor: theme.colors.warning,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }}
            >
              <Badge variant="warning" size="sm">
                {language === "ar"
                  ? `خصم ${discountPercentage}%`
                  : `${discountPercentage}% Off`}
              </Badge>
            </View>
          )}
          {isAvailable && (
            <View
              style={{
                elevation: 4,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }}
            >
              <Badge variant="available" size="sm">
                {language === "ar" ? "متاح" : "Available"}
              </Badge>
            </View>
          )}
        </View>
      </View>

      {/* Thumbnail Images with Enhanced Selection */}
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
              activeOpacity={0.7}
              style={{
                width: 70,
                height: 70,
                borderRadius: responsive.getBorderRadius("medium"),
                overflow: "hidden",
                borderWidth: index === selectedImageIndex ? 3 : 1.5,
                borderColor:
                  index === selectedImageIndex
                    ? theme.colors.primary
                    : theme.scheme === "dark"
                    ? theme.colors.border + "60"
                    : theme.colors.border + "80",
                elevation: index === selectedImageIndex ? 6 : 2,
                shadowColor:
                  index === selectedImageIndex
                    ? theme.colors.primary
                    : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: index === selectedImageIndex ? 0.4 : 0.1,
                shadowRadius: index === selectedImageIndex ? 6 : 3,
                transform: [
                  { scale: index === selectedImageIndex ? 1.05 : 1 },
                ],
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
