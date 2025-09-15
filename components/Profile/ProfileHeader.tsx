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
        flexDirection: isRTL ? "row-reverse" : "row",
        alignItems: "center",
        paddingTop: insets.top,
        paddingHorizontal: responsive.getResponsiveValue(20, 24, 28, 32, 36),
        paddingBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: responsive.getResponsiveValue(8, 10, 12, 14, 16),
          paddingHorizontal: responsive.getResponsiveValue(12, 14, 16, 18, 20),
          borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
          backgroundColor: colors.backgroundSecondary,
          marginRight: isRTL
            ? 0
            : responsive.getResponsiveValue(16, 20, 24, 28, 32),
          marginLeft: isRTL
            ? responsive.getResponsiveValue(16, 20, 24, 28, 32)
            : 0,
        }}
      >
        <Ionicons
          name={isRTL ? "chevron-forward" : "chevron-back"}
          size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
          color={colors.text}
        />
        <Text
          style={{
            fontSize: responsive.getFontSize(15, 14, 17),
            fontFamily: fonts.Medium || fonts.Regular,
            color: colors.text,
            marginHorizontal: responsive.getResponsiveValue(8, 10, 12, 14, 16),
          }}
        >
          {backText}
        </Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: responsive.getFontSize(22, 20, 26),
            fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
            justifyContent: "center",
            alignItems: "center",
            color: colors.text,
            textAlign: isRTL ? "right" : "left",
            marginBottom: responsive.getResponsiveValue(2, 4, 6, 8, 10),
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

export default ProfileHeader;
