// File: components/Auth/signUp/SignUpHeader.tsx
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Components
import LeagoMark from "@/components/Auth/LeagoMark";

// Constants
import { icons, images } from "@/constants";
import { translationsignUp } from "@/constants/Lang/AuthLangs";

// Hooks
import { useSignUpContext } from "@/hooks/SignupHooks/useSignUpContext";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";

// Context

type Language = "ar" | "en";

const SignUpHeader = () => {
  const { colors } = useTheme();
  const { isSmallScreen } = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage: language, isRTL } = useLanguageStore();
  const { isKeyboardVisible } = useSignUpContext();
  const { replace } = useSafeNavigate();

  const t = translationsignUp[language as Language];

  const styles = StyleSheet.create({
    headerContainer: {
      position: "relative",
      width: "100%",
      height: isKeyboardVisible && Platform.OS === "android" ? 150 : 250,
      overflow: "hidden",
    },
    headerContainerKeyboard: {
      height: isSmallScreen ? 120 : 150,
    },
    headerImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    backButton: {
      position: "absolute",
      top: Platform.OS === "ios" ? 56 : 40,
      ...(isRTL ? { left: 32 } : { right: 32 }),
      zIndex: 50,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      borderRadius: 20,
      padding: 8,
    },
    backIcon: {
      width: 32,
      height: 32,
      ...(isRTL && { transform: [{ scaleX: -1 }] }),
    },
    headerTitle: {
      fontSize: isSmallScreen ? 16 : 18,
      fontFamily: fonts.SemiBold || "System",
      position: "absolute",
      bottom: 28,
      ...(isRTL ? { right: 20 } : { left: 20 }),
      color: "#ffffff",
      textAlign: isRTL ? "right" : "left",
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    headerSubtitle: {
      fontSize: isSmallScreen ? 12 : 14,
      fontFamily: fonts.SemiBold || "System",
      position: "absolute",
      bottom: 8,
      ...(isRTL ? { right: 20 } : { left: 20 }),
      color: colors.textInverse || "#ffffff",
      textAlign: isRTL ? "right" : "left",
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
  });

  return (
    <View
      style={[
        styles.headerContainer,
        isKeyboardVisible && styles.headerContainerKeyboard,
      ]}
    >
      <Image source={images.signUpCar} style={styles.headerImage} />
      <LeagoMark />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => replace("/(tabs)")}
        activeOpacity={0.7}
      >
        <Image source={icons.backHome} style={styles.backIcon} />
      </TouchableOpacity>

      {!isKeyboardVisible && (
        <>
          <Text style={styles.headerTitle}>{t.signUp}</Text>
        </>
      )}
    </View>
  );
};

export default SignUpHeader;
