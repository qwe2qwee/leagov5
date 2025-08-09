import CustomButtonAuth from "@/components/Auth/CustomButtonAuth";
import { buttonTitles, onboarding } from "@/constants/Lang/AuthLangs";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import React, { useRef, useState } from "react";
import {
  I18nManager,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const Onboarding: React.FC = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const { currentLanguage } = useLanguageStore();

  // Replace with your actual loading state from store if exists
  const [loading, setLoading] = useState<boolean>(false);

  const { colors } = useTheme();
  const { isSmallScreen, isMediumScreen, height, width } = useResponsive();
  const fonts = useFontFamily();
  const insets = useSafeAreaInsets();
  const { replace } = useSafeNavigate();

  // Support RTL display (I18nManager + language hint)
  const isRTL = I18nManager.isRTL || currentLanguage === "ar";

  const isLastSlide = activeIndex === onboarding.length - 1;

  // More flexible responsive values
  const getImageDimensions = () => {
    if (height < 600) {
      return {
        width: width * 0.75,
        height: Math.min(200, height * 0.25),
        marginBottom: 20,
      };
    } else if (height < 700) {
      return {
        width: width * 0.8,
        height: Math.min(260, height * 0.3),
        marginBottom: 25,
      };
    } else {
      return {
        width: width * 0.8,
        height: Math.min(340, height * 0.35),
        marginBottom: 30,
      };
    }
  };

  const getFontSizes = () => {
    const baseMultiplier = Math.min(width / 375, height / 812); // Based on iPhone X dimensions

    if (height < 600) {
      return {
        title: Math.max(18, 20 * baseMultiplier),
        description: Math.max(12, 14 * baseMultiplier),
        skip: Math.max(13, 15 * baseMultiplier),
      };
    } else if (height < 700) {
      return {
        title: Math.max(20, 24 * baseMultiplier),
        description: Math.max(13, 15 * baseMultiplier),
        skip: Math.max(14, 16 * baseMultiplier),
      };
    } else {
      return {
        title: Math.max(22, 28 * baseMultiplier),
        description: Math.max(14, 16 * baseMultiplier),
        skip: Math.max(15, 17 * baseMultiplier),
      };
    }
  };

  const getSpacing = () => {
    if (height < 600) {
      return {
        containerPadding: 16,
        titleMarginBottom: 10,
        descriptionMargin: 12,
        bottomPadding: Math.min(100, height * 0.12),
        paginationBottom: Math.min(100, height * 0.12),
      };
    } else if (height < 700) {
      return {
        containerPadding: 20,
        titleMarginBottom: 12,
        descriptionMargin: 15,
        bottomPadding: Math.min(110, height * 0.14),
        paginationBottom: Math.min(110, height * 0.14),
      };
    } else {
      return {
        containerPadding: 24,
        titleMarginBottom: 15,
        descriptionMargin: 18,
        bottomPadding: 120,
        paginationBottom: 120,
      };
    }
  };

  const imageDimensions = getImageDimensions();
  const fontSizes = getFontSizes();
  const spacing = getSpacing();

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background || "#ffffff",
    },
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
    },
    swiper: {
      flex: 1,
      width: "100%",
    },
    slideContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.containerPadding,
      paddingTop: isSmallScreen ? 10 : 20,
      paddingBottom: spacing.bottomPadding,
    },
    skipButtonContainer: {
      position: "absolute",
      top: insets.top,
      zIndex: 20,
      padding: 8,
    },
    skipButtonText: {
      fontSize: fontSizes.skip,
      fontFamily: fonts.Bold || "System",
      color: colors.text || "#000000",
    },
    image: {
      width: imageDimensions.width,
      height: imageDimensions.height,
      alignSelf: "center",
      resizeMode: "contain",
      marginBottom: imageDimensions.marginBottom,
    },
    titleContainer: {
      marginBottom: spacing.titleMarginBottom,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: fontSizes.title,
      textAlign: "center",
      fontFamily: fonts.Bold || "System",
      color: colors.text || "#000000",
      lineHeight: fontSizes.title * 1.2,
    },
    description: {
      fontSize: fontSizes.description,
      textAlign: "center",
      marginHorizontal: spacing.descriptionMargin,
      lineHeight: fontSizes.description * 1.4,
      fontFamily: fonts.SemiBold || "System",
      color: colors.textSecondary || "#858585",
    },
    dot: {
      width: isSmallScreen ? 6 : 8,
      height: isSmallScreen ? 6 : 8,
      backgroundColor: colors.borderLight || "#e2e8f0",
      borderRadius: isSmallScreen ? 3 : 4,
      marginHorizontal: isSmallScreen ? 3 : 4,
      marginVertical: 3,
    },
    activeDot: {
      width: isSmallScreen ? 14 : 18,
      height: isSmallScreen ? 6 : 8,
      backgroundColor: colors.primary || "#FF5C39",
      borderRadius: isSmallScreen ? 4 : 6,
      marginHorizontal: isSmallScreen ? 3 : 4,
      marginVertical: 3,
    },
    pagination: {
      bottom: spacing.paginationBottom,
      left: 0,
      right: 0,
    },
    footerButtonWrapper: {
      position: "absolute",
      left: "6%",
      right: "6%",
      bottom: Math.max(16, insets.bottom + 2),
      zIndex: 30,

      // إضافات لتمركز المحتوى
      alignItems: "center", // يركّز العناصر أفقياً داخل الحاوية
    },
  });

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={styles.swiper}>
          <Swiper
            ref={swiperRef}
            loop={false}
            dot={<View style={styles.dot} />}
            activeDot={<View style={styles.activeDot} />}
            onIndexChanged={(index) => setActiveIndex(index)}
            paginationStyle={styles.pagination}
            removeClippedSubviews={false}
          >
            {onboarding.map((item) => (
              <View key={item.id} style={styles.slideContainer}>
                {/* Skip Button (absolute position) */}
                {item.skip && (
                  <TouchableOpacity
                    onPress={() => replace("/(auth)/sign-in", { force: true })}
                    disabled={loading}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[
                      styles.skipButtonContainer,
                      isRTL ? { left: 16 } : { right: 16 },
                    ]}
                  >
                    <Text style={styles.skipButtonText}>
                      {item.skip[currentLanguage]}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Image */}
                <Image
                  source={item.image[currentLanguage]}
                  style={styles.image}
                  resizeMode="contain"
                />

                {/* Title centered below image */}
                <View style={styles.titleContainer}>
                  <Text
                    style={[
                      styles.title,
                      isRTL
                        ? { writingDirection: "rtl" }
                        : { writingDirection: "ltr" },
                    ]}
                    numberOfLines={isSmallScreen ? 2 : 3}
                    adjustsFontSizeToFit={isSmallScreen}
                    minimumFontScale={0.8}
                  >
                    {item.title[currentLanguage]}
                  </Text>
                </View>

                {/* Description centered below title */}
                <Text
                  style={[
                    styles.description,
                    isRTL
                      ? { writingDirection: "rtl" }
                      : { writingDirection: "ltr" },
                  ]}
                  numberOfLines={isSmallScreen ? 3 : 4}
                  adjustsFontSizeToFit={isSmallScreen}
                  minimumFontScale={0.9}
                >
                  {item.description[currentLanguage]}
                </Text>
              </View>
            ))}
          </Swiper>
        </View>

        {/* Footer button (fixed above safe area) */}
        <View style={styles.footerButtonWrapper}>
          <CustomButtonAuth
            title={
              isLastSlide
                ? buttonTitles[currentLanguage].getStarted
                : buttonTitles[currentLanguage].next
            }
            onPress={() =>
              isLastSlide
                ? replace("/(auth)/sign-up", { force: true })
                : swiperRef.current?.scrollBy(1)
            }
            loading={loading}
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );
};

export default Onboarding;
