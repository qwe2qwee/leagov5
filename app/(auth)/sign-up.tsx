import SignUpForm from "@/components/Auth/SignUp/SignUpForm";
import SignUpHeader from "@/components/Auth/SignUp/SignUpHeader";
import SignUpModals from "@/components/Auth/SignUp/SignUpModals";
import {
  SignUpProvider,
  useSignUpContext,
} from "@/hooks/SignupHooks/useSignUpContext";
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
// 📱 SignUp Screen Content Component
// ------------------------------------

const SignUpScreenContent = () => {
  const { colors } = useTheme();
  const { scrollViewRef, isKeyboardVisible, keyboardHeight, loading } =
    useSignUpContext();

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
      paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 20,
      minHeight: screenHeight,
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
          scrollEnabled={true}
        >
          <View style={styles.container}>
            <View style={styles.contentWrapper}>
              {/* Header Section */}
              <SignUpHeader />

              {/* Form Section */}
              <SignUpForm />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Modals - Outside ScrollView for better performance */}
      <SignUpModals />
    </KeyboardAvoidingView>
  );
};

// ------------------------------------
// 🎨 Enhanced Version with Loading State
// ------------------------------------

export const SignUpScreenEnhanced = () => {
  return (
    <SignUpProvider>
      <SignUpScreenContentWithLoading />
    </SignUpProvider>
  );
};

const SignUpScreenContentWithLoading = () => {
  const { colors } = useTheme();
  const { scrollViewRef, isKeyboardVisible, keyboardHeight, loading } =
    useSignUpContext();

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
      paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 20,
      minHeight: screenHeight,
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
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
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
              <SignUpHeader />

              {/* Form Section */}
              <SignUpForm />

              {/* Loading Overlay */}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingContainer}>
                    {/* يمكنك إضافة spinner هنا */}
                    <Text style={{ color: colors.text }}>Loading...</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Modals */}
      <SignUpModals />
    </KeyboardAvoidingView>
  );
};

// ------------------------------------
// 🎯 Main SignUp Screen Component
// ------------------------------------

const SignUpScreen = () => {
  return (
    <SignUpProvider>
      <SignUpScreenContent />
    </SignUpProvider>
  );
};

// ------------------------------------
// 📤 Alternative Export Patterns
// ------------------------------------

// If you need individual components exported
export { SignUpScreenContent };

// If you need the provider separate
export const SignUpScreenWithProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => (
  <SignUpProvider>
    <SignUpScreenContent />
    {children}
  </SignUpProvider>
);

// ------------------------------------
// 🚀 Main Export
// ------------------------------------

export default SignUpScreen;
