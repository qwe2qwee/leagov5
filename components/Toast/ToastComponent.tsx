// ToastComponent.tsx
import { useFontFamily } from "@/hooks/useFontFamily";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { ToastConfig } from "@/types/toast";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastComponentProps extends ToastConfig {
  visible: boolean;
  onHide: (id: string) => void;
}

export const ToastComponent = React.memo<ToastComponentProps>(
  ({
    id,
    message,
    type,
    visible,
    duration = 3000,
    position = "top",
    action,
    persistent = false,
    onHide,
  }) => {
    const insets = useSafeAreaInsets();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const slideAnim = useRef(
      new Animated.Value(position === "top" ? -200 : 200)
    ).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const { currentLanguage, isRTL } = useLanguageStore();
    const { colors } = useTheme();
    const fonts = useFontFamily();

    // Memoized toast styles based on type and theme
    const toastStyles = useMemo(() => {
      switch (type) {
        case "success":
          return {
            backgroundColor: colors.success,
            borderColor: colors.success,
            icon: "✓",
            iconColor: colors.textInverse,
            textColor: colors.textInverse,
          };
        case "error":
          return {
            backgroundColor: colors.error,
            borderColor: colors.error,
            icon: "✕",
            iconColor: colors.textInverse,
            textColor: colors.textInverse,
          };
        case "info":
          return {
            backgroundColor: colors.info,
            borderColor: colors.info,
            icon: "ℹ",
            iconColor: colors.textInverse,
            textColor: colors.textInverse,
          };
        case "warning":
          return {
            backgroundColor: colors.warning,
            borderColor: colors.warning,
            icon: "⚠",
            iconColor: colors.text,
            textColor: colors.text,
          };
        default:
          return {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            icon: "ℹ",
            iconColor: colors.text,
            textColor: colors.text,
          };
      }
    }, [type, colors, position]);

    // Memoized container styles
    const containerStyles = useMemo(() => {
      const isTop = position === "top";

      return StyleSheet.create({
        container: {
          position: "absolute",
          [isTop ? "top" : "bottom"]: isTop
            ? insets.top + 12
            : insets.bottom + 12,
          left: 16,
          right: 16,
          zIndex: 1000,
          elevation: 1000,
        },
        toastBody: {
          backgroundColor: toastStyles.backgroundColor,
          borderWidth: 1,
          borderColor: toastStyles.borderColor,
          paddingHorizontal: 16,
          paddingVertical: action ? 12 : 14,
          borderRadius: 12,
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "flex-start",
          minHeight: action ? 72 : 56,
        },
        content: {
          flex: 1,
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "flex-start",
        },
        iconContainer: {
          marginRight: isRTL ? 0 : 12,
          marginLeft: isRTL ? 12 : 0,
          marginTop: 2,
          width: 20,
          height: 20,
          alignItems: "center",
          justifyContent: "center",
        },
        icon: {
          color: toastStyles.iconColor,
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "center",
        },
        textContainer: {
          flex: 1,
          alignItems: isRTL ? "flex-end" : "flex-start",
        },
        message: {
          color: toastStyles.textColor,
          fontSize: 15,
          fontWeight: "500",
          lineHeight: 20,
          textAlign: isRTL ? "right" : "left",
          fontFamily:
            currentLanguage === "ar"
              ? fonts.Medium || fonts.Regular || "Zain-Regular"
              : fonts.Medium || fonts.Regular || "Montserrat-Medium",
          marginBottom: action ? 8 : 0,
        },
        actionContainer: {
          flexDirection: isRTL ? "row-reverse" : "row",
          justifyContent: isRTL ? "flex-start" : "flex-end",
          marginTop: 4,
        },
        actionButton: {
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: toastStyles.textColor,
        },
        actionText: {
          color: toastStyles.textColor,
          fontSize: 13,
          fontWeight: "600",
          textAlign: "center",
          fontFamily:
            currentLanguage === "ar"
              ? fonts.SemiBold || fonts.Bold || "Zain-Bold"
              : fonts.SemiBold || fonts.Bold || "Montserrat-SemiBold",
        },
        closeButton: {
          padding: 4,
          marginLeft: isRTL ? 0 : 8,
          marginRight: isRTL ? 8 : 0,
          marginTop: -2,
        },
        closeIcon: {
          color: toastStyles.textColor,
          fontSize: 16,
          fontWeight: "bold",
          opacity: 0.8,
        },
      });
    }, [insets, toastStyles, isRTL, action, position, fonts, currentLanguage]);

    // Animation handlers
    const showToast = useCallback(() => {
      const initialValue = position === "top" ? -200 : 200;
      slideAnim.setValue(initialValue);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, [slideAnim, opacityAnim, position]);

    const hideToast = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const targetValue = position === "top" ? -200 : 200;

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: targetValue,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide(id);
      });
    }, [slideAnim, opacityAnim, position, onHide, id]);

    // Handle action press
    const handleActionPress = useCallback(() => {
      action?.onPress();
      if (!persistent) {
        hideToast();
      }
    }, [action, persistent, hideToast]);

    // Effect for visibility changes
    useEffect(() => {
      if (visible) {
        showToast();

        // Set auto-hide timer only if not persistent
        if (!persistent && duration > 0) {
          timerRef.current = setTimeout(() => {
            hideToast();
          }, duration);
        }
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [visible, duration, persistent, showToast, hideToast]);

    if (!visible) {
      return null;
    }

    return (
      <Animated.View
        style={[
          containerStyles.container,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={persistent ? undefined : hideToast}
          style={containerStyles.toastBody}
          accessibilityRole="alert"
          accessibilityLabel={`${type} notification: ${message}`}
          accessible={true}
          disabled={persistent}
        >
          <View style={containerStyles.content}>
            <View style={containerStyles.iconContainer}>
              <Text style={containerStyles.icon}>{toastStyles.icon}</Text>
            </View>

            <View style={containerStyles.textContainer}>
              <Text
                style={containerStyles.message}
                numberOfLines={action ? 2 : 3}
              >
                {message}
              </Text>

              {action && (
                <View style={containerStyles.actionContainer}>
                  <TouchableOpacity
                    style={containerStyles.actionButton}
                    onPress={handleActionPress}
                    activeOpacity={0.7}
                  >
                    <Text style={containerStyles.actionText}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {persistent && (
              <TouchableOpacity
                style={containerStyles.closeButton}
                onPress={hideToast}
                activeOpacity={0.7}
                accessibilityLabel="Close notification"
              >
                <Text style={containerStyles.closeIcon}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

ToastComponent.displayName = "ToastComponent";
