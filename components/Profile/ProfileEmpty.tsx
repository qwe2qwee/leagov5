import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileEmptyProps {
  noDataText: string;
}

const ProfileEmpty: React.FC<ProfileEmptyProps> = ({ noDataText }) => {
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
        <Ionicons
          name="person-circle-outline"
          size={responsive.getResponsiveValue(80, 90, 100, 110, 120)}
          color={colors.textMuted}
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
          {noDataText}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ProfileEmpty;
