import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileLoadingProps {
  loadingText: string;
}

const ProfileLoading: React.FC<ProfileLoadingProps> = ({ loadingText }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "top"]}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          paddingHorizontal: responsive.getResponsiveValue(20, 24, 28, 32, 36),
        }}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{
            marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
          }}
        />
        <Text
          style={{
            fontSize: responsive.getFontSize(16, 15, 18),
            fontFamily: fonts.Medium || fonts.Regular,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          {loadingText}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ProfileLoading;
