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
import { Card } from "@/components/ui/Card";
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
        route: "/screens/about",
        requiresAuth: false,
      },
      {
        icon: "information-circle-outline",
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
        route: "/screens/about",
        requiresAuth: false,
      },
      {
        icon: "information-circle-outline",
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
      // Better phone-focused vertical padding
      paddingVertical: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      // More efficient horizontal padding for phone screens
      paddingHorizontal: responsive.getResponsiveValue(12, 16, 18, 20, 22),
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      // Reduced bottom margin for better space efficiency
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      // Optimized icon container size for phones
      width: responsive.getResponsiveValue(36, 40, 42, 44, 46),
      height: responsive.getResponsiveValue(36, 40, 42, 44, 46),
      borderRadius: responsive.getResponsiveValue(18, 20, 21, 22, 23),
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      // Better spacing for phone layouts
      marginRight: isRTL
        ? 0
        : responsive.getResponsiveValue(10, 12, 14, 16, 18),
      marginLeft: isRTL ? responsive.getResponsiveValue(10, 12, 14, 16, 18) : 0,
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
      // Optimized chevron spacing
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
          // Better constrained icon size for phones
          size={responsive.getResponsiveValue(18, 20, 22, 24, 25)}
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
        // Optimized chevron size
        size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
        color={colors.textSecondary}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
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
    profile: currentLanguage === "ar" ? "الملف الشخصي" : "Profile",
    account: currentLanguage === "ar" ? "الحساب" : "Account",
    general: currentLanguage === "ar" ? "عام" : "General",
    signIn: currentLanguage === "ar" ? "تسجيل الدخول" : "Sign In",
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
    welcomeGuest: currentLanguage === "ar" ? "مرحباً زائر" : "Welcome Guest",
    signInToAccess:
      currentLanguage === "ar"
        ? "قم بتسجيل الدخول للوصول إلى جميع الميزات"
        : "Sign in to access all features",
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

  const handleSignInPress = (): void => {
    replace("/(auth)/sign-in");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      // More efficient horizontal padding for phone screens
      paddingHorizontal: responsive.getResponsiveValue(14, 16, 18, 20, 22),
      paddingTop:
        responsive.safeAreaTop +
        responsive.getResponsiveValue(12, 16, 18, 20, 22),
    },
    header: {
      // Optimized header margin for better space usage
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    title: {
      fontSize: responsive.getFontSize(24, 22, 28),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      // Reduced title bottom margin
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    sectionContainer: {
      // Better section spacing for phones
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    sectionTitle: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      // Optimized section title margin
      marginBottom: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      paddingHorizontal: responsive.getResponsiveValue(2, 4, 6, 8, 10),
    },
    signOutButton: {
      // Better button margins for phone layouts
      marginTop: responsive.getResponsiveValue(12, 16, 18, 20, 22),
      marginBottom: responsive.getResponsiveValue(16, 20, 22, 24, 26),
    },
    guestCard: {
      alignItems: "center",
      // Optimized guest card padding
      padding: responsive.getResponsiveValue(20, 24, 26, 28, 30),
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    guestTitle: {
      fontSize: responsive.getFontSize(18, 17, 20),
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: "center",
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    guestSubtitle: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
      // Better subtitle margin
      marginBottom: responsive.getResponsiveValue(16, 18, 20, 22, 24),
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      margin: 0,
    },
    card: {
      paddingVertical: responsive.getResponsiveValue(20, 24, 26, 28, 30),
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(14, 16, 18, 20, 22),
      // Better modal padding for phone screens
      padding: responsive.getResponsiveValue(20, 24, 26, 28, 30),
      marginHorizontal: responsive.getResponsiveValue(16, 20, 22, 24, 26),
      // Optimized modal width for phones
      maxWidth: responsive.getResponsiveValue(280, 300, 320, 340, 360),
      width: "100%",
    },
    modalTitle: {
      fontSize: responsive.getFontSize(17, 16, 19),
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: "center",
      // Better modal title margin
      marginBottom: responsive.getResponsiveValue(18, 20, 22, 24, 26),
      lineHeight: responsive.getFontSize(17, 16, 19) * 1.4,
    },
    modalButtons: {
      // Optimized button gap
      gap: responsive.getResponsiveValue(10, 12, 14, 16, 18),
    },
    cancelButton: {
      alignItems: "center",
      // Better cancel button padding
      paddingVertical: responsive.getResponsiveValue(10, 12, 14, 16, 18),
    },
    cancelText: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.primary,
    },
    bottomSpacing: {
      height: responsive.safeAreaBottom + responsive.getTabBarHeight(true) + 60,
    },
  });

  const accountSections = profileSections.account[currentLanguage];
  const generalSections = profileSections.general[currentLanguage];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {user ? (
          <>
            {/* Account Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{t.account}</Text>
              <Card type="default" style={styles.card}>
                <Card.Content>
                  {accountSections.map((item, index) => (
                    <React.Fragment key={item.route}>
                      <ProfileMenuItem
                        item={item}
                        onPress={handleMenuItemPress}
                      />
                      {index < accountSections.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </Card.Content>
              </Card>
            </View>

            {/* General Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{t.general}</Text>
              <Card type="default" style={styles.card}>
                <Card.Content>
                  {generalSections.map((item, index) => (
                    <React.Fragment key={item.route}>
                      <ProfileMenuItem
                        item={item}
                        onPress={handleMenuItemPress}
                      />
                      {index < generalSections.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </Card.Content>
              </Card>
            </View>

            {/* Sign Out Button */}
            <View style={styles.signOutButton}>
              <CustomButton
                title={t.signOut}
                bgVariant="outline"
                textVariant="primary"
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
          </>
        ) : (
          <>
            {/* Guest Card */}
            <Card type="default" style={styles.card}>
              <Ionicons
                name="person-circle-outline"
                // Better constrained guest icon size for phones
                size={responsive.getResponsiveValue(50, 60, 70, 80, 90)}
                color={colors.textSecondary}
              />
              <Text style={styles.guestTitle}>{t.welcomeGuest}</Text>
              <Text style={styles.guestSubtitle}>{t.signInToAccess}</Text>

              <CustomButton
                title={t.signIn}
                bgVariant="primary"
                onPress={handleSignInPress}
                IconLeft={() => (
                  <Ionicons
                    name="log-in-outline"
                    size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                    color={colors.textInverse}
                  />
                )}
              />
            </Card>

            {/* General Section for Guests */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{t.general}</Text>
              <Card type="default" style={styles.card}>
                <Card.Content>
                  {generalSections
                    .filter((item) => !item.requiresAuth)
                    .map((item, index, filteredArray) => (
                      <React.Fragment key={item.route}>
                        <ProfileMenuItem
                          item={item}
                          onPress={handleMenuItemPress}
                        />
                        {index < filteredArray.length - 1 && <Separator />}
                      </React.Fragment>
                    ))}
                </Card.Content>
              </Card>
            </View>
          </>
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
