import { Badge } from "@/components/ui/Badge2";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  statusConfig: any;
  onBack: () => void;
}

export default function Header({ statusConfig, onBack }: HeaderProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { currentLanguage, isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      paddingTop:
        responsive.safeAreaTop +
        responsive.getResponsiveValue(12, 16, 20, 24, 28),
      paddingBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      alignItems: "center",
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
    },
    backButton: {
      width: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      height: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      <Badge variant={statusConfig.variant} size="lg">
        {statusConfig.label[currentLanguage]}
      </Badge>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons
          name={isRTL ? "chevron-forward" : "chevron-back"}
          size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
          color={colors.text}
        />
      </TouchableOpacity>
    </View>
  );
}
