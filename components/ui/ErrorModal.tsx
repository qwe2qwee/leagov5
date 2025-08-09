import { translationModalReset } from "@/constants/Lang/AuthLangs";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

interface ErrorModalProps {
  isVisible: boolean; // Control the visibility of the modal
  message: string; // Error message to display
  isSecuss?: boolean; // Indicates success or error state
  onClose: () => void; // Callback to close the modal
  language?: "ar" | "en" | "fr"; // Language setting, defaults to Arabic
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isVisible,
  message,
  isSecuss,
  onClose,
}) => {
  const { currentLanguage } = useLanguageStore();
  const { colors } = useTheme();
  const { isSmallScreen } = useResponsive();
  const fonts = useFontFamily();

  const t = translationModalReset[currentLanguage];

  const styles = StyleSheet.create({
    modalContainer: {
      backgroundColor: colors.surface || colors.background || "#ffffff",
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.text || "#000000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    titleError: {
      fontSize: isSmallScreen ? 16 : 18,
      fontFamily: fonts.Bold || "System",
      color: colors.error || "#DC3545",
      marginBottom: 10,
      textAlign: "center",
    },
    titleSuccess: {
      fontSize: isSmallScreen ? 16 : 18,
      fontFamily: fonts.Bold || "System",
      color: colors.success || "#28A745",
      marginBottom: 10,
      textAlign: "center",
    },
    message: {
      fontSize: isSmallScreen ? 14 : 16,
      fontFamily: fonts.SemiBold || "System",
      color: colors.text || "#333333",
      textAlign: "center",
      marginBottom: 20,
      lineHeight: isSmallScreen ? 20 : 24,
    },
    button: {
      backgroundColor: colors.primary || "#FF5C39",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 100,
      alignItems: "center",
    },
    buttonText: {
      color: colors.textInverse || "#ffffff",
      fontSize: isSmallScreen ? 14 : 16,
      fontFamily: fonts.Bold || "System",
    },
  });

  return (
    <Modal
      isVisible={isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver
    >
      <View style={styles.modalContainer}>
        <Text style={isSecuss ? styles.titleSuccess : styles.titleError}>
          {isSecuss ? t.successTitle : t.errorTitle}
        </Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>{t.buttonText}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ErrorModal;
