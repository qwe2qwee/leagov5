import SignInForm from "@/components/Auth/SignIn/SignInForm";
import SignInHeader from "@/components/Auth/SignIn/SignInHeader";
import SignInModals from "@/components/Auth/SignIn/SignInModals";
// استيراد الفورم المنفصل
import {
  SignInProvider,
  useSignInContext,
} from "@/hooks/SingInHooks/useSignInContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Get screen dimensions for responsive design
const { height: screenHeight } = Dimensions.get("window");

// ------------------------------------
// 📱 SignIn Screen Content Component
// ------------------------------------

const SignInScreenContent = () => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { isVerySmallScreen, height, getResponsiveValue } = responsive;

  const {
    scrollViewRef,
    isKeyboardVisible,
    keyboardHeight,
    loading,
    signInMethod,
  } = useSignInContext();

  const styles = StyleSheet.create({
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      backgroundColor: colors.background || "#ffffff",
    },
    scrollContentContainer: {
      flexGrow: 1,
      paddingBottom: isKeyboardVisible
        ? keyboardHeight + 20
        : getResponsiveValue(16, 20, 24, 28, 32),
      // Add extra padding for password method since it has more content
      minHeight:
        signInMethod === "password"
          ? screenHeight + (isVerySmallScreen ? 30 : 50)
          : screenHeight,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background || "#ffffff",
      minHeight: screenHeight,
    },
    contentWrapper: {
      flex: 1,
      position: "relative",
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          // Enable scroll when keyboard is visible for better UX
          scrollEnabled={true}
        >
          <View style={styles.container}>
            <View style={styles.contentWrapper}>
              {/* Header Section */}
              <SignInHeader />

              {/* Form Section */}
              <SignInForm />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Modals - Outside ScrollView for better performance */}
      <SignInModals />
    </KeyboardAvoidingView>
  );
};

// ------------------------------------
// 🎨 Enhanced Version with Loading State
// ------------------------------------

const SignInScreenContentWithLoading = () => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { isVerySmallScreen, getResponsiveValue } = responsive;

  const {
    scrollViewRef,
    isKeyboardVisible,
    keyboardHeight,
    loading,
    signInMethod,
  } = useSignInContext();

  const styles = StyleSheet.create({
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      backgroundColor: colors.background || "#ffffff",
    },
    scrollContentContainer: {
      flexGrow: 1,
      paddingBottom: isKeyboardVisible
        ? keyboardHeight + 20
        : getResponsiveValue(16, 20, 24, 28, 32),
      minHeight:
        signInMethod === "password"
          ? screenHeight + (isVerySmallScreen ? 30 : 50)
          : screenHeight,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background || "#ffffff",
      minHeight: screenHeight,
    },
    contentWrapper: {
      flex: 1,
      position: "relative",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    loadingContainer: {
      backgroundColor: colors.background || "#ffffff",
      padding: getResponsiveValue(16, 20, 24, 28, 32),
      borderRadius: getResponsiveValue(8, 10, 12, 14, 16),
      alignItems: "center",
      minWidth: getResponsiveValue(120, 140, 160, 180, 200),
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    loadingText: {
      color: colors.text || "#000000",
      fontSize: getResponsiveValue(12, 14, 16, 18, 20),
      fontWeight: "500",
      textAlign: "center",
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={true}
        >
          <View style={styles.container}>
            <View style={styles.contentWrapper}>
              {/* Header Section */}
              <SignInHeader />

              {/* Form Section */}
              <SignInForm />

              {/* Loading Overlay */}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingContainer}>
                    {/* يمكنك إضافة spinner هنا */}
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Modals */}
      <SignInModals />
    </KeyboardAvoidingView>
  );
};

// ------------------------------------
// 🎯 Main SignIn Screen Component
// ------------------------------------

const SignInScreen = () => {
  return (
    <SignInProvider>
      <SignInScreenContent />
    </SignInProvider>
  );
};

// ------------------------------------
// 🎨 Enhanced Version Export
// ------------------------------------

export const SignInScreenEnhanced = () => {
  return (
    <SignInProvider>
      <SignInScreenContentWithLoading />
    </SignInProvider>
  );
};

// ------------------------------------
// 📤 Alternative Export Patterns
// ------------------------------------

// If you need individual components exported
export { SignInForm, SignInScreenContent };

// If you need the provider separate
export const SignInScreenWithProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => (
  <SignInProvider>
    <SignInScreenContent />
    {children}
  </SignInProvider>
);

// Provider wrapper for standalone form usage
export const SignInFormWithProvider = () => (
  <SignInProvider>
    <SignInForm />
  </SignInProvider>
);

// ------------------------------------
// 🚀 Main Export
// ------------------------------------

export default SignInScreen;
