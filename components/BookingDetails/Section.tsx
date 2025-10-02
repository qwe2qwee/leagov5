import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    title: {
      fontSize: responsive.getFontSize(17, 16, 20),
      fontFamily: fonts.Bold || fonts.SemiBold,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(10, 12, 16, 18, 20),
      textAlign: isRTL ? "right" : "left",
    },
  });

  return (
    <View style={styles.container}>
      <Card type="default">
        <Card.Content>
          <Text style={styles.title}>{title}</Text>
          {children}
        </Card.Content>
      </Card>
    </View>
  );
}
