import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

interface WebViewModalProps {
  visible: boolean;
  url: string;
  onClose: () => void;
  onNavigationStateChange: (navState: any) => void;
}

export default function WebViewModal({
  visible,
  url,
  onClose,
  onNavigationStateChange,
}: WebViewModalProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title:
      currentLanguage === "ar" ? "إتمام التحقق من الدفع" : "Verifying Payment",
    close: currentLanguage === "ar" ? "إغلاق" : "Close",
    checking:
      currentLanguage === "ar"
        ? "جاري التحقق من الدفع..."
        : "Checking payment...",
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primary,
      paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      paddingTop:
        responsive.safeAreaTop +
        responsive.getResponsiveValue(12, 16, 20, 24, 28),
      paddingBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    title: {
      fontSize: responsive.getFontSize(18, 17, 20),
      fontFamily: fonts.Bold || fonts.SemiBold,
      color: colors.textInverse,
      flex: 1,
      textAlign: "center",
    },
    closeButton: {
      padding: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    closeButtonText: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.SemiBold,
      color: colors.textInverse,
    },
    webView: {
      flex: 1,
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium,
      color: colors.text,
      marginTop: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{t.close}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t.title}</Text>
          <View style={{ width: 60 }} />
        </View>

        {url ? (
          <WebView
            source={{ uri: url }}
            style={styles.webView}
            onNavigationStateChange={onNavigationStateChange}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t.checking}</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t.checking}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}
