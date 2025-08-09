import { useFontFamily } from "@/hooks/useFontFamily";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, toggleLanguage } = useLanguageStore();
  const { colors } = useTheme();
  const fontFamily = useFontFamily();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    languageText: {
      fontSize: 16,
      color: colors.text,
      fontFamily: fontFamily.Medium,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.languageText}>
        {currentLanguage === "en" ? "English" : "العربية"}
      </Text>
      <Switch
        value={currentLanguage === "ar"}
        onValueChange={toggleLanguage}
        trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.backgroundTertiary}
      />
    </View>
  );
};
