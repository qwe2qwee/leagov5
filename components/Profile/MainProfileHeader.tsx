import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Profile } from "@/types/supabase";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MainProfileHeaderProps {
  user: User | null;
  profile: Profile | null;
  onSignInPress: () => void;
  onEditProfilePress: () => void;
}

const MainProfileHeader: React.FC<MainProfileHeaderProps> = ({
  user,
  profile,
  onSignInPress,
  onEditProfilePress,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const insets = useSafeAreaInsets();

  const t = {
    guest: currentLanguage === "ar" ? "زائر" : "Guest",
    welcome: currentLanguage === "ar" ? "مرحباً بك" : "Welcome",
    signIn: currentLanguage === "ar" ? "تسجيل الدخول / إنشاء حساب" : "Sign In / Sign Up",
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      paddingTop: insets.top + responsive.getResponsiveValue(20, 24, 28, 32, 36),
      paddingBottom: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      paddingHorizontal: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      borderBottomLeftRadius: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      borderBottomRightRadius: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
    },
    content: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
    },
    infoContainer: {
      flex: 1,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    welcomeText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    nameText: {
      fontSize: responsive.getFontSize(24, 22, 28),
      fontFamily: fonts.Bold,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    actionButton: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingVertical: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingHorizontal: responsive.getResponsiveValue(12, 16, 18, 20, 22),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginTop: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    actionButtonText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Medium,
      color: colors.textInverse,
      marginHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.welcomeText}>{t.welcome}</Text>
          <Text style={styles.nameText} numberOfLines={1}>
            {user && profile?.full_name ? profile.full_name : t.guest}
          </Text>

          {/* Action Button - Only for Guests */}
          {!user && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSignInPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name="log-in-outline"
                size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                color={colors.textInverse}
              />
              <Text style={styles.actionButtonText}>{t.signIn}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default MainProfileHeader;
