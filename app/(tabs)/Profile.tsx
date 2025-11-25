import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

// Hooks
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";

import useLanguageStore from "@/store/useLanguageStore";

// Components
import MainProfileHeader from "@/components/Profile/MainProfileHeader";
import CustomButton from "@/components/ui/CustomButton";
import { Separator } from "@/components/ui/Separator";
import { useAuth } from "@/hooks/supabaseHooks/auth/context";
import { useToast } from "@/store/useToastStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";

// Profile menu item interface
interface ProfileMenuItem {
  icon: string;
  titleAr: string;
  titleEn: string;
  route: string;
  requiresAuth?: boolean;
}

// Profile sections configuration
const profileSections = {
  account: {
    ar: [
      {
        icon: "person-outline",
        titleAr: "المعلومات الشخصية",
        titleEn: "Personal Information",
        route: "/screens/ProfileEdit",
        requiresAuth: true,
      },
      {
        icon: "calendar-outline",
        titleAr: "حجوزاتي",
        titleEn: "My Bookings",
        route: "/Bills",
        requiresAuth: true,
      },
      {
        icon: "document-text-outline",
        titleAr: "الوثائق",
        titleEn: "Documents",
        route: "/screens/DocumentsUploadScreen",
        requiresAuth: true,
      },
      {
        icon: "location-outline",
        titleAr: "الموقع",
        titleEn: "Location",
        route: "/screens/Location",
        requiresAuth: false,
      },
    ],
    en: [
      {
        icon: "person-outline",
        titleAr: "المعلومات الشخصية",
        titleEn: "Personal Information",
        route: "/screens/ProfileEdit",
        requiresAuth: true,
      },
      {
        icon: "document-text-outline",
        titleAr: "الوثائق",
        titleEn: "Documents",
        route: "/screens/DocumentsUploadScreen",
        requiresAuth: true,
      },
      {
        icon: "location-outline",
        titleAr: "الموقع",
        titleEn: "Location",
        route: "/screens/Location",
        requiresAuth: false,
      },
    ],
  },
  general: {
    ar: [
      {
        icon: "language-outline",
        titleAr: "اللغة",
        titleEn: "Language",
        route: "/screens/Language",
        requiresAuth: false,
      },
      {
        icon: "help-circle-outline",
        titleAr: "المساعدة",
        titleEn: "Help & Support",
        route: "/screens/Help",
        requiresAuth: false,
      },
      {
        icon: "information-circle-outline",
        titleAr: "حول التطبيق",
        titleEn: "About App",
        route: "/screens/About",
        requiresAuth: false,
      },
      {
        icon: "document-text-outline",
        titleAr: "الحقوق والشروط",
        titleEn: "Terms and Conditions",
        route: "/screens/TermsAndConditions",
        requiresAuth: false,
      },
    ],
    en: [
      {
        icon: "language-outline",
        titleAr: "اللغة",
        titleEn: "Language",
        route: "/screens/Language",
        requiresAuth: false,
      },
      {
        icon: "help-circle-outline",
        titleAr: "المساعدة",
        titleEn: "Help & Support",
        route: "/screens/Help",
        requiresAuth: false,
      },
      {
        icon: "information-circle-outline",
        titleAr: "حول التطبيق",
        titleEn: "About App",
        route: "/screens/About",
        requiresAuth: false,
      },
      {
        icon: "document-text-outline",
        titleAr: "الحقوق والشروط",
        titleEn: "Terms and Conditions",
        route: "/screens/TermsAndConditions",
        requiresAuth: false,
      },
    ],
  },
};

// Profile menu item component
interface ProfileMenuItemProps {
  item: ProfileMenuItem;
  onPress: (route: string) => void;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ item, onPress }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    menuItem: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      paddingVertical: responsive.getResponsiveValue(14, 16, 18, 20, 22),
      paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      backgroundColor: colors.surface,
    },
    iconContainer: {
      width: responsive.getResponsiveValue(32, 36, 40, 44, 48),
      height: responsive.getResponsiveValue(32, 36, 40, 44, 48),
      borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: isRTL ? 0 : responsive.getResponsiveValue(12, 16, 18, 20, 22),
      marginLeft: isRTL ? responsive.getResponsiveValue(12, 16, 18, 20, 22) : 0,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
    },
    chevron: {
      marginLeft: isRTL ? 0 : responsive.getResponsiveValue(6, 8, 10, 12, 14),
      marginRight: isRTL ? responsive.getResponsiveValue(6, 8, 10, 12, 14) : 0,
    },
  });

  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => onPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.icon as any}
          size={responsive.getResponsiveValue(18, 20, 22, 24, 26)}
          color={colors.primary}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {currentLanguage === "ar" ? item.titleAr : item.titleEn}
        </Text>
      </View>

      <Ionicons
        name={isRTL ? "chevron-back" : "chevron-forward"}
        size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
        color={colors.textSecondary}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { showSuccess, showError } = useToast();
  const { push, replace } = useSafeNavigate();

  // Local state
  const [isLogoutModalVisible, setIsLogoutModalVisible] =
    useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Localization
  const t = {
    account: currentLanguage === "ar" ? "الحساب" : "Account",
    general: currentLanguage === "ar" ? "عام" : "General",
    signOut: currentLanguage === "ar" ? "تسجيل الخروج" : "Sign Out",
    logoutQuestion:
      currentLanguage === "ar"
        ? "هل أنت متأكد من تسجيل الخروج؟"
        : "Are you sure you want to sign out?",
    yes: currentLanguage === "ar" ? "نعم" : "Yes",
    cancel: currentLanguage === "ar" ? "إلغاء" : "Cancel",
    signingOut:
      currentLanguage === "ar" ? "جاري تسجيل الخروج..." : "Signing out...",
    signedOut:
      currentLanguage === "ar"
        ? "تم تسجيل الخروج بنجاح"
        : "Successfully signed out",
    signOutError:
      currentLanguage === "ar"
        ? "حدث خطأ في تسجيل الخروج"
        : "Error signing out",
  };

  const handleMenuItemPress = (route: any): void => {
    if (route.startsWith("/auth/")) {
      replace(route);
    } else {
      push(route);
    }
  };

  const handleSignOutPress = (): void => {
    setIsLogoutModalVisible(true);
  };

  const handleSignOut = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      const result = await signOut();
      if (result.error) {
        showError(result.error);
      } else {
        showSuccess(t.signedOut);
        setIsLogoutModalVisible(false);
        replace("/(auth)/sign-in");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      showError(t.signOutError);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    sectionContainer: {
      marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
    },
    sectionTitle: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingHorizontal: responsive.getResponsiveValue(20, 24, 28, 32, 36),
    },
    menuList: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.borderLight,
    },
    signOutButton: {
      marginHorizontal: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      marginTop: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      marginBottom: responsive.getResponsiveValue(30, 36, 40, 44, 48),
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      margin: 0,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(14, 16, 18, 20, 22),
      padding: responsive.getResponsiveValue(20, 24, 26, 28, 30),
      marginHorizontal: responsive.getResponsiveValue(16, 20, 22, 24, 26),
      maxWidth: responsive.getResponsiveValue(280, 300, 320, 340, 360),
      width: "100%",
    },
    modalTitle: {
      fontSize: responsive.getFontSize(17, 16, 19),
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: "center",
      marginBottom: responsive.getResponsiveValue(18, 20, 22, 24, 26),
      lineHeight: responsive.getFontSize(17, 16, 19) * 1.4,
    },
    modalButtons: {
      gap: responsive.getResponsiveValue(10, 12, 14, 16, 18),
    },
    cancelButton: {
      alignItems: "center",
      paddingVertical: responsive.getResponsiveValue(10, 12, 14, 16, 18),
    },
    cancelText: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.primary,
    },
    bottomSpacing: {
      height: responsive.safeAreaBottom + responsive.getTabBarHeight(true) + 20,
    },
  });

  const accountSections = profileSections.account[currentLanguage];
  const generalSections = profileSections.general[currentLanguage];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Header */}
        <MainProfileHeader
          user={user}
          profile={profile}
          onSignInPress={() => replace("/(auth)/sign-in")}
          onEditProfilePress={() => push("/screens/ProfileEdit")}
        />

        {/* Account Section - Only if logged in */}
        {user && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t.account}</Text>
            <View style={styles.menuList}>
              {accountSections.map((item, index) => (
                <React.Fragment key={item.route}>
                  <ProfileMenuItem item={item} onPress={handleMenuItemPress} />
                  {index < accountSections.length - 1 && (
                    <Separator style={{ marginLeft: 68 }} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* General Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t.general}</Text>
          <View style={styles.menuList}>
            {generalSections
              .filter((item) => (user ? true : !item.requiresAuth))
              .map((item, index, filteredArray) => (
                <React.Fragment key={item.route}>
                  <ProfileMenuItem item={item} onPress={handleMenuItemPress} />
                  {index < filteredArray.length - 1 && (
                    <Separator style={{ marginLeft: 68 }} />
                  )}
                </React.Fragment>
              ))}
          </View>
        </View>

        {/* Sign Out Button */}
        {user && (
          <View style={styles.signOutButton}>
            <CustomButton
              title={t.signOut}
              bgVariant="outline"
              textStyle={{ color: colors.error }}
              onPress={handleSignOutPress}
              IconLeft={() => (
                <Ionicons
                  name="log-out-outline"
                  size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                  color={colors.error}
                />
              )}
            />
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        isVisible={isLogoutModalVisible}
        onBackdropPress={() => !isLoggingOut && setIsLogoutModalVisible(false)}
        onBackButtonPress={() =>
          !isLoggingOut && setIsLogoutModalVisible(false)
        }
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.5}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t.logoutQuestion}</Text>

          <View style={styles.modalButtons}>
            <CustomButton
              title={isLoggingOut ? t.signingOut : t.yes}
              bgVariant="primary"
              onPress={handleSignOut}
              loading={isLoggingOut}
              disabled={isLoggingOut}
              IconLeft={() =>
                !isLoggingOut && (
                  <Ionicons
                    name="log-out-outline"
                    size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                    color={colors.textInverse}
                  />
                )
              }
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsLogoutModalVisible(false)}
              disabled={isLoggingOut}
            >
              <Text
                style={[styles.cancelText, { opacity: isLoggingOut ? 0.5 : 1 }]}
              >
                {t.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Basic usage examples:

// Example 1: Navigation to profile screen from tab bar
// <Tab.Screen
//   name="profile"
//   component={ProfileScreen}
//   options={{
//     tabBarLabel: 'Profile',
//     tabBarIcon: ({ color, size }) => (
//       <Ionicons name="person-outline" size={size} color={color} />
//     ),
//   }}
// />

// Example 2: Navigation from settings menu
// <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
//   <View style={styles.menuItem}>
//     <Ionicons name="person-outline" size={24} color={colors.primary} />
//     <Text>My Profile</Text>
//     <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
//   </View>
// </TouchableOpacity>

// Example 3: Direct router push for authenticated users
// const handleViewProfile = () => {
//   if (user) {
//     router.push('/profile');
//   } else {
//     router.push('/(auth)/sign-in');
//   }
// };
