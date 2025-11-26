import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProfileHeaderProps {
  onBack: () => void;
  title: string;
  subtitle: string;
  backText: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onBack,
  title,
  subtitle,
  backText,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + responsive.spacing.sm,
        paddingBottom: responsive.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: colors.background,
        paddingHorizontal: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      }}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          alignSelf: isRTL ? "flex-end" : "flex-start",
          paddingVertical: responsive.getResponsiveValue(8, 10, 12, 14, 16),
          paddingHorizontal: responsive.getResponsiveValue(12, 14, 16, 18, 20),
          borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
          backgroundColor: colors.backgroundSecondary,
          marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isRTL ? "chevron-forward" : "chevron-back"}
          size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
          color={colors.primary}
        />
        <Text
          style={{
            fontSize: responsive.getFontSize(15, 14, 17),
            fontFamily: fonts.Medium || fonts.Regular,
            color: colors.primary,
            marginHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
          }}
        >
          {backText}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default ProfileHeader;