import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text, View } from "react-native";

export default function SecurityInfo() {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage } = useLanguageStore();

  const t = {
    securityInfo:
      currentLanguage === "ar"
        ? "بيانات بطاقتك محمية بالكامل"
        : "Your card data is protected",
    noServerPass:
      currentLanguage === "ar"
        ? "بياناتك لا تمر عبر خوادمنا"
        : "Your data doesn't pass through our servers",
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      padding: responsive.getResponsiveValue(14, 16, 20, 22, 24),
      backgroundColor: colors.success + "15",
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      borderWidth: 1,
      borderColor: colors.success,
    },
    text: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Regular,
      color: colors.success,
      textAlign: "center",
      lineHeight: responsive.getFontSize(12, 11, 14) * 1.5,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t.securityInfo}</Text>
      <Text style={[styles.text, { marginTop: 5 }]}>{t.noServerPass}</Text>
    </View>
  );
}
