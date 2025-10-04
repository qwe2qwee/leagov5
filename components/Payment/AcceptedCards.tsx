import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text, View } from "react-native";

export default function AcceptedCards() {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title: currentLanguage === "ar" ? "البطاقات المقبولة:" : "Accepted Cards:",
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    title: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.textSecondary,
      marginBottom: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      textAlign: isRTL ? "right" : "left",
    },
    logos: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "flex-start",
      gap: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    logo: {
      borderWidth: 1,
      borderColor: colors.primary,
      paddingHorizontal: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      paddingVertical: responsive.getResponsiveValue(5, 6, 8, 10, 12),
      borderRadius: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    logoText: {
      fontSize: responsive.getFontSize(11, 10, 13),
      fontFamily: fonts.Bold || fonts.SemiBold,
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <Card type="default">
        <Card.Content>
          <Text style={styles.title}>{t.title}</Text>
          <View style={styles.logos}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>مدى</Text>
            </View>
            <View style={styles.logo}>
              <Text style={styles.logoText}>VISA</Text>
            </View>
            <View style={styles.logo}>
              <Text style={styles.logoText}>Mastercard</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}
