import { Separator } from "@/components/ui/Separator";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text, TextStyle, View } from "react-native";

interface InfoRowProps {
  label: string;
  value: string | number;
  showSeparator?: boolean;
  valueStyle?: TextStyle;
}

export default function InfoRow({
  label,
  value,
  showSeparator = true,
  valueStyle,
}: InfoRowProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: responsive.getResponsiveValue(10, 12, 14, 16, 18),
    },
    label: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
    },
    value: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.SemiBold || fonts.Medium,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      maxWidth: "65%",
    },
  });

  return (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, valueStyle]}>{value}</Text>
      </View>
      {showSeparator && <Separator />}
    </>
  );
}
