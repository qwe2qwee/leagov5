import LeagoMark from "@/components/LeagoMark"; // Import your logo component
import { splashTranslations } from "@/constants/Lang/SplashLang";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  I18nManager,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const textSlideAnim = useRef(new Animated.Value(20)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const { colors, scheme } = useTheme();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { isSmallScreen, isMediumScreen, isLargeScreen } = useResponsive();

  const t = splashTranslations[currentLanguage];

  // Responsive sizing configuration
  const responsiveConfig = {
    logo: {
      size: isSmallScreen ? 120 : isMediumScreen ? 140 : 160,
      markWidth: isSmallScreen ? 100 : isMediumScreen ? 110 : 120,
      markHeight: isSmallScreen ? 50 : isMediumScreen ? 55 : 60,
      borderRadius: isSmallScreen ? 24 : isMediumScreen ? 28 : 32,
    },
    spacing: {
      logoMargin: isSmallScreen ? 32 : isMediumScreen ? 40 : 48,
      textMargin: isSmallScreen ? 40 : isMediumScreen ? 48 : 56,
      horizontalPadding: isSmallScreen ? 24 : isMediumScreen ? 28 : 32,
      footerBottom: isSmallScreen ? 60 : isMediumScreen ? 70 : 80,
    },
    text: {
      subtitle: isSmallScreen ? 16 : isMediumScreen ? 17 : 18,
      loading: isSmallScreen ? 13 : isMediumScreen ? 13.5 : 14,
      footer: isSmallScreen ? 11 : isMediumScreen ? 11.5 : 12,
    },
    dots: {
      size: isSmallScreen ? 6 : isMediumScreen ? 7 : 8,
      gap: isSmallScreen ? 8 : isMediumScreen ? 9 : 10,
    },
  };

  useEffect(() => {
    // Set RTL layout if Arabic
    if (isRTL && !I18nManager.isRTL) {
      // Note: In a real app, you might want to handle RTL layout changes
      // I18nManager.forceRTL(true);
    }

    // Optimized animation sequence
    const startAnimations = () => {
      // Main entrance animation - reduced complexity
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 600,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Simple loading dots animation
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dotsAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(dotsAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 800);
    };

    startAnimations();

    // Auto finish after 3 seconds (reduced from 4)
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentLanguage]);

  // Leago Logo Component with responsive sizing
  const LeagoLogo = () => (
    <Animated.View
      style={[
        styles.logoContainer,
        {
          marginBottom: responsiveConfig.spacing.logoMargin,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryLight, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.logoBackground,
          {
            width: responsiveConfig.logo.size,
            height: responsiveConfig.logo.size,
            borderRadius: responsiveConfig.logo.borderRadius,
          },
        ]}
      >
        <LeagoMark
          width={responsiveConfig.logo.markWidth}
          height={responsiveConfig.logo.markHeight}
          color={colors.textInverse}
        />
      </LinearGradient>
    </Animated.View>
  );

  const LoadingDot = ({ index }: { index: number }) => (
    <Animated.View
      style={[
        styles.dot,
        {
          width: responsiveConfig.dots.size,
          height: responsiveConfig.dots.size,
          borderRadius: responsiveConfig.dots.size / 2,
          backgroundColor: colors.primary,
          opacity: dotsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [
            {
              scale: dotsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2],
              }),
            },
          ],
        },
      ]}
    />
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar
        barStyle={scheme === "light" ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
        translucent
      />

      {/* Simplified background gradient */}
      <LinearGradient
        colors={[
          colors.background,
          colors.backgroundSecondary,
          colors.background,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.splashContainer,
          {
            paddingHorizontal: responsiveConfig.spacing.horizontalPadding,
            opacity: fadeAnim,
          },
        ]}
      >
        <LeagoLogo />

        <Animated.View
          style={[
            styles.textContainer,
            {
              marginBottom: responsiveConfig.spacing.textMargin,
              transform: [{ translateY: textSlideAnim }],
            },
          ]}
        >
          <Text
            style={[
              styles.appSubtitle,
              {
                fontSize: responsiveConfig.text.subtitle,
                color: colors.textSecondary,
                textAlign: "center",
                fontFamily: isRTL ? "System" : "System", // You can specify different fonts for Arabic
              },
            ]}
          >
            {t.appSubtitle}
          </Text>
        </Animated.View>

        <View style={styles.loadingContainer}>
          <View
            style={[
              styles.loadingDots,
              { gap: responsiveConfig.dots.gap },
              isRTL && styles.loadingDotsRTL,
            ]}
          >
            <LoadingDot index={0} />
            <LoadingDot index={1} />
            <LoadingDot index={2} />
          </View>
          <Text
            style={[
              styles.loadingText,
              {
                fontSize: responsiveConfig.text.loading,
                color: colors.textMuted,
                textAlign: "center",
                fontFamily: isRTL ? "System" : "System",
              },
            ]}
          >
            {t.loading}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: textSlideAnim }],
            bottom: responsiveConfig.spacing.footerBottom + insets.bottom,
          },
        ]}
      >
        <Text
          style={[
            styles.footerText,
            {
              fontSize: responsiveConfig.text.footer,
              color: colors.textMuted,
              textAlign: "center",
              fontFamily: isRTL ? "System" : "System",
            },
          ]}
        >
          {t.footerText}
        </Text>
        <View style={[styles.footerLine, { backgroundColor: colors.border }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashContainer: {
    alignItems: "center",
  },
  logoContainer: {
    position: "relative",
  },
  logoBackground: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
  },
  appSubtitle: {
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: "System",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    marginBottom: 16,
  },
  loadingDotsRTL: {
    flexDirection: "row-reverse",
  },
  dot: {
    // Dynamic sizing applied via responsiveConfig
  },
  loadingText: {
    fontWeight: "500",
    letterSpacing: 0.8,
    fontFamily: "System",
  },
  footer: {
    position: "absolute",
    alignItems: "center",
  },
  footerText: {
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "System",
    marginBottom: 8,
  },
  footerLine: {
    width: 50,
    height: 2,
    borderRadius: 1,
    opacity: 0.3,
  },
});

export default SplashScreen;
