import OTPComponent from "@/components/Auth/OTPComponent";
import { useAuth } from "@/hooks/supabaseHooks/auth/context";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OTPScreen = () => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { getFontSize, getSpacing } = responsive;
  const fonts = useFontFamily();
  const { push, replace } = useSafeNavigate();
  const { currentLanguage } = useLanguageStore();

  const params = useLocalSearchParams();
  const identifier = params.identifier as string;
  const method = params.method as "email" | "phone";
  const type = params.type as "signup" | "signin";

  const insets = useSafeAreaInsets();

  const { verifyOTP, resendOTP } = useAuth();

  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!identifier || !method || !type) {
      Alert.alert("Error", "Invalid OTP page parameters", [
        { text: "Go Back", onPress: () => push("/(auth)/sign-up") },
      ]);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [identifier, method, type, push]);

  // Animation for success state
  const animateSuccess = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const handleOTPVerification = useCallback(
    async (otp: string) => {
      if (!otp || otp.length !== 6) {
        Alert.alert(
          currentLanguage === "ar" ? "خطأ" : "Error",
          currentLanguage === "ar"
            ? "الرجاء إدخال رمز مكون من 6 أرقام"
            : "Please enter a valid 6-digit code"
        );
        return;
      }

      setVerificationState("verifying");

      // Fade in loading animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      try {
        const otpType = method === "phone" ? "sms" : "email";
        const result = await verifyOTP(identifier, otp, otpType, type);

        if (result.error) {
          console.error("❌ OTP verification failed:", result.error);
          setVerificationState("error");

          // Fade out loading and show error
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            Alert.alert(
              currentLanguage === "ar" ? "فشل التحقق" : "Verification Failed",
              result.error ||
                (currentLanguage === "ar"
                  ? "فشل التحقق من الرقم. الرجاء المحاولة مجددا."
                  : "Failed to verify phone number. Please try again.")
            );
            setVerificationState("idle");
          });
          return;
        }

        // Success animation
        setVerificationState("success");
        animateSuccess();

        // ✅ Check for shouldNavigateToHome
        if (result.data?.shouldNavigateToHome) {
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Show success briefly then navigate to home
          timeoutRef.current = setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              replace("/(tabs)");
              setVerificationState("idle");
            });
          }, 800);
          return;
        }

        // ✅ Manual verification required
        if (result.data?.manual_signin_required) {
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Fade out and show success message
          timeoutRef.current = setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              Alert.alert(
                currentLanguage === "ar" ? "تم التحقق" : "Verified",
                result.data.message ||
                  (currentLanguage === "ar"
                    ? "تم التحقق من الرقم بنجاح. الرجاء تسجيل الدخول."
                    : "Phone verified successfully. Please sign in."),
                [
                  {
                    text: currentLanguage === "ar" ? "تسجيل الدخول" : "Sign In",
                    onPress: () => replace("/(auth)/sign-in"),
                  },
                ]
              );
              setVerificationState("idle");
            });
          }, 1000);
          return;
        }

        // ✅ Verification successful
        if (result.data?.verified) {
          if (type === "signup") {
            // Clear any existing timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            // Show success message briefly then navigate
            timeoutRef.current = setTimeout(() => {
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                Alert.alert(
                  currentLanguage === "ar" ? "تم بنجاح!" : "Success!",
                  currentLanguage === "ar"
                    ? "تم إنشاء الحساب بنجاح!"
                    : "Account created successfully!",
                  [
                    {
                      text: currentLanguage === "ar" ? "متابعة" : "Continue",
                      onPress: () => replace("/(tabs)"),
                    },
                  ]
                );
                setVerificationState("idle");
              });
            }, 1000);
          } else {
            // Clear any existing timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            // Direct navigation for signin
            timeoutRef.current = setTimeout(() => {
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                replace("/(tabs)");
                setVerificationState("idle");
              });
            }, 800);
          }
        } else {
          setVerificationState("idle");
        }
      } catch (error) {
        console.error("❌ OTP verification error:", error);
        setVerificationState("error");

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          Alert.alert(
            currentLanguage === "ar" ? "خطأ" : "Error",
            currentLanguage === "ar"
              ? "حدث خطأ أثناء التحقق. الرجاء المحاولة مرة أخرى."
              : "An error occurred during verification. Please try again."
          );
          setVerificationState("idle");
        });
      }
    },
    [
      identifier,
      method,
      type,
      verifyOTP,
      replace,
      currentLanguage,
      fadeAnim,
      animateSuccess,
    ]
  );

  const handleResendOTP = useCallback(async () => {
    try {
      const result = await resendOTP(identifier, method);

      if (result.error) {
        console.error("❌ Resend OTP failed:", result.error);
        Alert.alert(
          currentLanguage === "ar" ? "فشل الإرسال" : "Resend Failed",
          result.error
        );
        return;
      }

      const methodText = method === "email" ? "email" : "phone number";
      const arabicMethodText =
        method === "email" ? "البريد الإلكتروني" : "رقم الهاتف";

      Alert.alert(
        currentLanguage === "ar" ? "تم الإرسال" : "Code Sent",
        currentLanguage === "ar"
          ? `تم إرسال رمز التحقق إلى ${arabicMethodText}`
          : `Verification code has been sent to your ${methodText}`
      );
    } catch (error) {
      console.error("❌ Resend OTP error:", error);
      Alert.alert(
        currentLanguage === "ar" ? "خطأ" : "Error",
        currentLanguage === "ar"
          ? "فشل في إعادة إرسال الرمز"
          : "Failed to resend verification code"
      );
    }
  }, [identifier, method, resendOTP, currentLanguage]);

  const handleCloseModal = useCallback(() => {
    if (verificationState === "verifying") {
      // Prevent closing during verification
      return;
    }

    if (type === "signup") push("/(auth)/sign-up");
    else push("/(auth)/sign-in");
  }, [type, push, verificationState]);

  const getLoadingText = () => {
    switch (verificationState) {
      case "verifying":
        return currentLanguage === "ar" ? "جاري التحقق..." : "Verifying...";
      case "success":
        return currentLanguage === "ar" ? "تم بنجاح!" : "Success!";
      case "error":
        return currentLanguage === "ar" ? "خطأ" : "Error";
      default:
        return currentLanguage === "ar" ? "جاري التحميل..." : "Loading...";
    }
  };

  const getLoadingColor = () => {
    switch (verificationState) {
      case "success":
        return colors.success || "#10B981";
      case "error":
        return colors.error || "#EF4444";
      default:
        return colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top,
    },
    keyboardContainer: { flex: 1 },
    contentContainer: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: getSpacing(20),
    },
    headerContainer: {
      alignItems: "center",
      marginBottom: getSpacing(30),
    },
    title: {
      fontSize: getFontSize(24, 20, 28),
      fontFamily: fonts.Bold || "System",
      color: colors.text,
      textAlign: "center",
      marginBottom: getSpacing(8),
    },
    subtitle: {
      fontSize: getFontSize(16, 14, 18),
      fontFamily: fonts.Regular || "System",
      color: colors.textSecondary || colors.text,
      textAlign: "center",
      lineHeight: getFontSize(16, 14, 18) * 1.4,
    },
    otpContainer: {
      flex: 1,
      justifyContent: "center",
    },
    // Improved loading overlay - better positioning
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
    loadingContainer: {
      backgroundColor: colors.background,
      padding: getSpacing(20),
      borderRadius: 16,
      alignItems: "center",
      minWidth: 120,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border || "rgba(0,0,0,0.1)",
    },
    loadingText: {
      fontSize: getFontSize(14, 12, 16),
      fontFamily: fonts.Medium || "System",
      color: colors.text,
      marginTop: getSpacing(8),
      textAlign: "center",
    },
    // Success/Error indicator
    statusIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginBottom: getSpacing(8),
    },
    // Disable interaction overlay
    disabledOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "transparent",
      zIndex: 998,
    },
  });

  const formatContact = (identifier: string, method: "email" | "phone") => {
    if (method === "phone")
      return identifier.replace(/(\+966)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    return identifier;
  };

  const getTitle = () =>
    currentLanguage === "ar"
      ? type === "signup"
        ? "تأكيد الحساب"
        : "تأكيد الهوية"
      : type === "signup"
      ? "Verify Account"
      : "Verify Identity";

  const getSubtitle = () => {
    const contact = formatContact(identifier, method);
    if (currentLanguage === "ar") {
      const arabicMethod =
        method === "email" ? "البريد الإلكتروني" : "رقم الهاتف";
      return `تم إرسال رمز التحقق إلى ${arabicMethod}\n${contact}`;
    }
    const methodText = method === "email" ? "email" : "phone number";
    return `Verification code sent to your ${methodText}\n${contact}`;
  };

  // Loading state for invalid parameters
  if (!identifier || !method || !type) {
    return (
      <View style={styles.container}>
        <View style={[styles.contentContainer, { justifyContent: "center" }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {currentLanguage === "ar" ? "جاري التحميل..." : "Loading..."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: verificationState === "verifying" ? 0.7 : 1,
            },
          ]}
        >
          <View style={styles.otpContainer}>
            <OTPComponent
              onVerifyOTP={handleOTPVerification}
              onResendOTP={handleResendOTP}
              closeModal={handleCloseModal}
              otpLength={6}
              emailORPhoneNumber={identifier}
              language={currentLanguage}
              // Only pass disabled if OTPComponent supports it
              {...(verificationState === "verifying" && { disabled: true })}
            />
          </View>
        </Animated.View>

        {/* Prevent interactions during verification */}
        {verificationState === "verifying" && (
          <View style={styles.disabledOverlay} pointerEvents="none" />
        )}

        {/* Improved loading indicator */}
        {verificationState !== "idle" && (
          <Animated.View
            style={[styles.loadingOverlay, { opacity: fadeAnim }]}
            pointerEvents="none"
          >
            <View style={styles.loadingContainer}>
              {verificationState === "success" && (
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getLoadingColor() },
                  ]}
                />
              )}

              {verificationState !== "success" && (
                <ActivityIndicator size="large" color={getLoadingColor()} />
              )}

              <Text style={[styles.loadingText, { color: getLoadingColor() }]}>
                {getLoadingText()}
              </Text>
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default OTPScreen;
