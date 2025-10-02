// components/Bookings/CancelModal.tsx - IMPROVED VERSION
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CancelModalProps {
  visible: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CancelModal({
  visible,
  isLoading,
  onConfirm,
  onCancel,
}: CancelModalProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title: currentLanguage === "ar" ? "إلغاء الحجز" : "Cancel Booking",
    message:
      currentLanguage === "ar"
        ? "هل أنت متأكد من إلغاء هذا الحجز؟ لن تتمكن من التراجع عن هذا الإجراء."
        : "Are you sure you want to cancel this booking? This action cannot be undone.",
    no: currentLanguage === "ar" ? "لا، احتفظ بالحجز" : "No, Keep It",
    yesCancel:
      currentLanguage === "ar" ? "نعم، إلغاء الحجز" : "Yes, Cancel Booking",
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Modal overlay with proper backdrop
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          // Add safe padding for iOS notch
          paddingTop: responsive.safeAreaTop,
          paddingBottom: responsive.safeAreaBottom,
          paddingHorizontal: responsive.spacing.md,
        },

        // Modal content container
        modalContainer: {
          backgroundColor: colors.surface,
          borderRadius: responsive.getBorderRadius("large"),
          width: "100%",
          maxWidth: responsive.getResponsiveValue(320, 360, 400, 440, 480),
          // Better shadow for depth perception
          shadowColor: colors.text,
          shadowOffset: {
            width: 0,
            height: responsive.getResponsiveValue(4, 6, 8, 10, 12),
          },
          shadowOpacity: 0.25,
          shadowRadius: responsive.getResponsiveValue(8, 12, 16, 20, 24),
          elevation: 10,
          overflow: "hidden",
        },

        // Header with icon and close button
        header: {
          alignItems: "center",
          paddingTop: responsive.spacing.xl,
          paddingHorizontal: responsive.spacing.lg,
        },

        // Close button (X) in top corner
        closeButton: {
          position: "absolute",
          top: responsive.spacing.sm,
          right: isRTL ? undefined : responsive.spacing.sm,
          left: isRTL ? responsive.spacing.sm : undefined,
          width: responsive.getResponsiveValue(36, 40, 44, 48, 52),
          height: responsive.getResponsiveValue(36, 40, 44, 48, 52),
          borderRadius: responsive.getResponsiveValue(18, 20, 22, 24, 26),
          backgroundColor: colors.backgroundSecondary,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        },

        // Warning icon container
        iconContainer: {
          width: responsive.getResponsiveValue(60, 70, 80, 90, 100),
          height: responsive.getResponsiveValue(60, 70, 80, 90, 100),
          borderRadius: responsive.getResponsiveValue(30, 35, 40, 45, 50),
          backgroundColor: colors.error + "15", // 15% opacity
          justifyContent: "center",
          alignItems: "center",
          marginBottom: responsive.spacing.md,
        },

        // Content area
        content: {
          paddingHorizontal: responsive.spacing.lg,
          paddingBottom: responsive.spacing.md,
          alignItems: "center",
        },

        // Title text
        title: {
          fontSize: responsive.getFontSize(20, 19, 23),
          fontFamily: fonts.Bold || fonts.SemiBold,
          color: colors.text,
          textAlign: "center",
          marginBottom: responsive.spacing.sm,
          lineHeight: Math.round(responsive.getFontSize(20, 19, 23) * 1.3),
        },

        // Message text with better readability
        message: {
          fontSize: responsive.getFontSize(15, 14, 17),
          fontFamily: fonts.Regular,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: Math.round(responsive.getFontSize(15, 14, 17) * 1.5),
          marginBottom: responsive.spacing.lg,
        },

        // Action buttons container
        actions: {
          width: "100%",
          paddingHorizontal: responsive.spacing.lg,
          paddingBottom: responsive.spacing.lg,
          gap: responsive.spacing.sm,
        },

        // Individual button wrapper for full width
        buttonWrapper: {
          width: "100%",
        },

        // Button with proper touch target
        button: {
          minHeight: responsive.getResponsiveValue(48, 50, 52, 54, 56),
          width: "100%",
          borderRadius: responsive.getBorderRadius("medium"),
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: responsive.spacing.xs,
        },

        // Primary button (safe action)
        primaryButton: {
          backgroundColor: colors.primary,
        },

        // Danger outline button (destructive action)
        dangerButton: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: colors.error,
        },

        // Button text styles
        primaryButtonText: {
          fontSize: responsive.getFontSize(16, 15, 18),
          fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
          color: colors.textInverse,
          lineHeight: Math.round(responsive.getFontSize(16, 15, 18) * 1.2),
        },

        dangerButtonText: {
          fontSize: responsive.getFontSize(16, 15, 18),
          fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
          color: colors.error,
          lineHeight: Math.round(responsive.getFontSize(16, 15, 18) * 1.2),
        },

        // Disabled state
        buttonDisabled: {
          opacity: 0.5,
        },
      }),
    [colors, responsive, fonts, isRTL]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/* Backdrop - tappable to close */}
      <Pressable style={styles.overlay} onPress={onCancel}>
        {/* Modal content - prevent backdrop tap from closing */}
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <View>
            {/* Close X button - must be first for proper stacking */}
            <Pressable
              style={styles.closeButton}
              onPress={onCancel}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
                color={colors.textSecondary}
              />
            </Pressable>

            {/* Header content */}
            <View style={styles.header}>
              {/* Warning Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="warning-outline"
                  size={responsive.getResponsiveValue(32, 36, 40, 44, 48)}
                  color={colors.error}
                />
              </View>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.message}>{t.message}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Primary: Keep booking (safe action) */}
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={onCancel}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>{t.no}</Text>
              </TouchableOpacity>
            </View>

            {/* Destructive: Cancel booking */}
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.dangerButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={onConfirm}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.error} size="small" />
                ) : (
                  <Text style={styles.dangerButtonText}>{t.yesCancel}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
