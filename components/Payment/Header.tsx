import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, Text, View } from "react-native";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      paddingTop:
        responsive.safeAreaTop +
        responsive.getResponsiveValue(12, 16, 20, 24, 28),
      paddingBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      alignItems: "center",
    },
    title: {
      fontSize: responsive.getFontSize(20, 18, 24),
      fontFamily: fonts.Bold || fonts.SemiBold,
      color: colors.textInverse,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
