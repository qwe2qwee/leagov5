import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Hooks
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";

import useLanguageStore from "@/store/useLanguageStore";

// Components
import { Card } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { useToast } from "@/store/useToastStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";

type ContactType = "whatsapp" | "email";

interface ContactOption {
  type: ContactType;
  icon: string;
  titleAr: string;
  titleEn: string;
  value: string;
  subject?: string;
  body?: string;
}

const contactOptions: ContactOption[] = [
  {
    type: "whatsapp",
    icon: "logo-whatsapp",
    titleAr: "محادثة واتساب",
    titleEn: "WhatsApp Chat",
    value: "+966544463389",
  },
  {
    type: "email",
    icon: "mail-outline",
    titleAr: "البريد الإلكتروني",
    titleEn: "Email",
    value: "info@leago.org",
    subject: "خدمة العملاء Customer Service",
    body: "اكتب رسالتك هنا Write your Message here",
  },
];

// LEAGO Logo Component - Optimized for phone screens
const LeagoLogo: React.FC = () => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();

  const logoStyles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      // Better constrained logo size for phones
      width: responsive.getResponsiveValue(60, 70, 80, 90, 100),
      height: responsive.getResponsiveValue(60, 70, 80, 90, 100),
      borderRadius: responsive.getResponsiveValue(30, 35, 40, 45, 50),
      backgroundColor: colors.primary,
    },
    text: {
      // Optimized logo text size
      fontSize: responsive.getFontSize(16, 14, 20),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.textInverse,
      letterSpacing: 1,
    },
  });

  return (
    <View style={logoStyles.container}>
      <Text style={logoStyles.text}>LEAGO</Text>
    </View>
  );
};

// Contact Option Component - Optimized sizing
interface ContactOptionItemProps {
  option: ContactOption;
  onPress: (option: ContactOption) => void;
}

const ContactOptionItem: React.FC<ContactOptionItemProps> = ({
  option,
  onPress,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    container: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      // Better phone-focused vertical padding
      paddingVertical: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      // More efficient horizontal padding for phone screens
      paddingHorizontal: responsive.getResponsiveValue(2, 4, 6, 8, 10),
    },
    iconContainer: {
      // Optimized icon container size for phones
      width: responsive.getResponsiveValue(36, 40, 44, 48, 52),
      height: responsive.getResponsiveValue(36, 40, 44, 48, 52),
      borderRadius: responsive.getResponsiveValue(18, 20, 22, 24, 26),
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      // Better spacing for phone layouts
      marginRight: isRTL
        ? 0
        : responsive.getResponsiveValue(12, 14, 16, 18, 20),
      marginLeft: isRTL ? responsive.getResponsiveValue(12, 14, 16, 18, 20) : 0,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
    },
    subtitle: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      marginTop: responsive.getResponsiveValue(2, 3, 4, 5, 6),
    },
    chevron: {
      // Optimized chevron spacing
      marginLeft: isRTL ? 0 : responsive.getResponsiveValue(6, 8, 10, 12, 14),
      marginRight: isRTL ? responsive.getResponsiveValue(6, 8, 10, 12, 14) : 0,
    },
  });

  const getIconColor = (): string => {
    if (option.type === "whatsapp") return "#25D366";
    if (option.type === "email") return colors.primary;
    return colors.textSecondary;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(option)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={option.icon as any}
          // Better constrained icon size for phones
          size={responsive.getResponsiveValue(18, 20, 22, 24, 26)}
          color={getIconColor()}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {currentLanguage === "ar" ? option.titleAr : option.titleEn}
        </Text>
        <Text style={styles.subtitle}>{option.value}</Text>
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

export default function ContactUsScreen() {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { showSuccess, showError } = useToast();
  const { back, push } = useSafeNavigate();

  // Localization
  const t = {
    title: currentLanguage === "ar" ? "تواصل معنا" : "Contact Us",
    backTitle: currentLanguage === "ar" ? "العودة" : "Back",
    termsConditions:
      currentLanguage === "ar" ? "الشروط والأحكام" : "Terms & Conditions",
    companyInfo:
      currentLanguage === "ar" ? "معلومات الشركة" : "Company Information",
    companyName:
      currentLanguage === "ar" ? "شركة ليجو للتأجير" : "LEAGO Rental Company",
    companyAddress:
      currentLanguage === "ar"
        ? "جدة، المملكة العربية السعودية"
        : "Jeddah, Saudi Arabia",
    contactSuccess:
      currentLanguage === "ar"
        ? "تم فتح التطبيق بنجاح"
        : "App opened successfully",
    contactError:
      currentLanguage === "ar"
        ? "تأكد من تثبيت التطبيق على جهازك"
        : "Make sure the app is installed on your device",
    whatsappError:
      currentLanguage === "ar"
        ? "تأكد من تثبيت واتساب على جهازك"
        : "Make sure WhatsApp is installed on your device",
    emailError:
      currentLanguage === "ar"
        ? "تأكد من وجود تطبيق البريد الإلكتروني"
        : "Make sure you have an email app installed",
  };

  const handleContactPress = async (option: ContactOption): Promise<void> => {
    try {
      let url: string;

      if (option.type === "whatsapp") {
        url = `whatsapp://send?phone=${option.value}`;
      } else if (option.type === "email") {
        url = `mailto:${option.value}?subject=${encodeURIComponent(
          option.subject || ""
        )}&body=${encodeURIComponent(option.body || "")}`;
      } else {
        return;
      }

      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
        showSuccess(t.contactSuccess);
      } else {
        const errorMessage =
          option.type === "whatsapp" ? t.whatsappError : t.emailError;
        showError(errorMessage);
      }
    } catch (error) {
      console.error(`Error opening ${option.type}:`, error);
      showError(t.contactError);
    }
  };

  const handleTermsPress = (): void => {
    push("/screens/TermsAndConditions");
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
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      // Optimized header margin for better space usage
      marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
    },
    backButton: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      // Better button padding for phone touch targets
      paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      paddingHorizontal: responsive.getResponsiveValue(10, 12, 16, 18, 20),
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    backText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
      // Optimized text spacing
      marginHorizontal: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    title: {
      fontSize: responsive.getFontSize(18, 17, 20),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      textAlign: "center",
    },
    logoContainer: {
      alignItems: "center",
      // Better logo container margin for phone space efficiency
      marginBottom: responsive.getResponsiveValue(24, 28, 32, 36, 40),
    },
    logoBorder: {
      borderWidth: 2,
      borderColor: colors.primary,
      // Adjusted border radius to match smaller logo
      borderRadius: responsive.getResponsiveValue(35, 40, 45, 50, 55),
      // Optimized border padding
      padding: responsive.getResponsiveValue(12, 16, 18, 20, 22),
    },
    contactCard: {
      // Better card margin for phone layouts
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    termsButton: {
      alignItems: "center",
      // Optimized terms button padding
      paddingVertical: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    termsText: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.primary,
      textAlign: "center",
    },
    companySection: {
      // Better section spacing
      marginTop: responsive.getResponsiveValue(14, 16, 20, 22, 24),
    },
    sectionTitle: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      // Optimized section title margin
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
    companyInfo: {
      // Better company info padding
      paddingVertical: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      paddingHorizontal: responsive.getResponsiveValue(2, 4, 6, 8, 10),
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    companyText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      lineHeight: responsive.getFontSize(14, 13, 16) * 1.5,
      // Better text spacing
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    bottomSpacing: {
      height: responsive.safeAreaBottom + responsive.getTabBarHeight(true) + 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => back()}>
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              // Optimized back icon size
              size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
              color={colors.text}
            />
            <Text style={styles.backText}>{t.backTitle}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t.title}</Text>

          {/* Spacer for centering */}
          <View
            style={{
              // Adjusted spacer width to match smaller back button
              width: responsive.getResponsiveValue(70, 80, 90, 100, 110),
            }}
          />
        </View>

        {/* LEAGO Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBorder}>
            <LeagoLogo />
          </View>
        </View>

        {/* Contact Options */}
        <Card type="default" style={styles.contactCard}>
          <Card.Content>
            {contactOptions.map((option, index) => (
              <React.Fragment key={option.type}>
                <ContactOptionItem
                  option={option}
                  onPress={handleContactPress}
                />
                {index < contactOptions.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>

        {/* Terms and Conditions Link */}
        <TouchableOpacity
          style={styles.termsButton}
          onPress={handleTermsPress}
          activeOpacity={0.7}
        >
          <Text style={styles.termsText}>{t.termsConditions}</Text>
        </TouchableOpacity>

        {/* Company Information */}
        <View style={styles.companySection}>
          <Text style={styles.sectionTitle}>{t.companyInfo}</Text>
          <View style={styles.companyInfo}>
            <Text style={styles.companyText}>{t.companyName}</Text>
            <Text style={styles.companyText}>{t.companyAddress}</Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </View>
    </View>
  );
}

// Basic usage examples:

// Example 1: Navigation from help section
// <ProfileMenuItem
//   icon="help-circle-outline"
//   titleAr="المساعدة"
//   titleEn="Help & Support"
//   route="/screens/ContactUs"
//   onPress={() => router.push('/screens/ContactUs')}
// />

// Example 2: Emergency support access
// <TouchableOpacity onPress={() => router.push('/contact-us')}>
//   <View style={styles.emergencyContact}>
//     <Ionicons name="call-outline" size={24} color={colors.primary} />
//     <Text>Need Help?</Text>
//     <Text style={styles.subtitle}>Contact Support</Text>
//   </View>
// </TouchableOpacity>

// Example 3: Settings menu contact option
// <CustomButton
//   title="Contact Support"
//   bgVariant="outline"
//   onPress={() => router.push('/support/contact')}
//   IconLeft={() => <Ionicons name="chatbubble-outline" size={20} />}
// />
