import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
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
import { termsAndConditions } from "@/constants/termsAndConditions";
import { useSafeNavigate } from "@/utils/useSafeNavigate";

// Import your existing terms and conditions translations

interface TermsSection {
  titleKey: string;
  contentKey: string;
}

// Define the sections structure to match your existing data
const termsSections: TermsSection[] = [
  {
    titleKey: "mainTitle",
    contentKey: "discription",
  },
  {
    titleKey: "difinitionsTitle",
    contentKey: "difinitions",
  },
  {
    titleKey: "aboutUsTitle",
    contentKey: "aboutUs",
  },
  {
    titleKey: "amendmentsTermsAndConditionsTitle",
    contentKey: "amendmentsTermsAndConditions",
  },
  {
    titleKey: "registerAndClientResponsibilitiesTitle",
    contentKey: "registerAndClientResponsibilities",
  },
  {
    titleKey: "digitalWalletTitle",
    contentKey: "digitalWallet",
  },
  {
    titleKey: "userBehaviorRestrictionsTitle",
    contentKey: "userBehaviorRestrictions",
  },
  {
    titleKey: "userContentTitle",
    contentKey: "userContent",
  },
  {
    titleKey: "addtionalFeesAndRentalPaymentTitle",
    contentKey: "addtionalFeesAndRentalPayment",
  },
  {
    titleKey: "cancellationOfConfirmedBookingAndEarlyReturnsTitle",
    contentKey: "cancellationOfConfirmedBookingAndEarlyReturns",
  },
  {
    titleKey: "thirdPartyContentTitle",
    contentKey: "thirdPartyContent",
  },
  {
    titleKey: "intellectualPropertyTitle",
    contentKey: "intellectualProperty",
  },
  {
    titleKey: "emailsTitle",
    contentKey: "emails",
  },
  {
    titleKey: "terminatingContractTitle",
    contentKey: "terminatingContract",
  },
  {
    titleKey: "disclaimerOfWarrantiesTitle",
    contentKey: "disclaimerOfWarranties",
  },
  {
    titleKey: "insemnificationAndCompensationTitle",
    contentKey: "insemnificationAndCompensation",
  },
  {
    titleKey: "miscellaneousProvisionsTitle",
    contentKey: "miscellaneousProvisions",
  },
];

// Terms Section Component - Optimized for phone screens
interface TermsSectionProps {
  title: string;
  content: string;
  isLast?: boolean;
}

const TermsSectionComponent: React.FC<TermsSectionProps> = ({
  title,
  content,
  isLast = false,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    container: {
      // Better phone-focused vertical padding
      paddingVertical: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      // More efficient horizontal padding for phone screens
      paddingHorizontal: responsive.getResponsiveValue(2, 4, 6, 8, 10),
    },
    title: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      // Optimized title bottom margin
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      lineHeight: responsive.getFontSize(16, 15, 18) * 1.3,
    },
    content: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      lineHeight: responsive.getFontSize(14, 13, 16) * 1.6,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
      {!isLast && (
        <Separator
          style={{
            // Better separator margin for phone layouts
            marginTop: responsive.getResponsiveValue(12, 14, 16, 18, 20),
          }}
        />
      )}
    </View>
  );
};

export default function TermsAndConditionsScreen() {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { back } = useSafeNavigate();

  // Use your existing translation system exactly as before
  const translator = termsAndConditions[currentLanguage];

  // Localization for UI elements
  const t = {
    backTitle: currentLanguage === "ar" ? "العودة" : "Back",
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
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    backButton: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      // Better button padding for phone touch targets
      paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      paddingHorizontal: responsive.getResponsiveValue(10, 12, 16, 18, 20),
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
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
      flex: 1,
      // Better title horizontal margin
      marginHorizontal: responsive.getResponsiveValue(12, 16, 18, 20, 22),
    },
    scrollContainer: {
      flex: 1,
    },
    cardContent: {
      // Optimized card content padding
      paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
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

          <Text style={styles.title}>{translator.title}</Text>

          {/* Spacer for centering */}
          <View
            style={{
              // Adjusted spacer width to match smaller back button
              width: responsive.getResponsiveValue(70, 80, 90, 100, 110),
            }}
          />
        </View>

        {/* Terms Content */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Card type="default">
            <Card.Content style={styles.cardContent}>
              {termsSections.map((section, index) => {
                const title = translator[
                  section.titleKey as keyof typeof translator
                ] as string;
                const content = translator[
                  section.contentKey as keyof typeof translator
                ] as string;

                return (
                  <TermsSectionComponent
                    key={section.titleKey}
                    title={title}
                    content={content}
                    isLast={index === termsSections.length - 1}
                  />
                );
              })}
            </Card.Content>
          </Card>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </View>
  );
}

// Basic usage examples:

// Example 1: Navigation from profile settings
// <ProfileMenuItem
//   icon="document-text-outline"
//   titleAr="الحقوق والشروط"
//   titleEn="Terms and Conditions"
//   route="/screens/TermsAndConditions"
//   onPress={() => router.push('/screens/TermsAndConditions')}
// />

// Example 2: Legal compliance link during registration
// <TouchableOpacity onPress={() => router.push('/auth/terms')}>
//   <Text style={styles.legalLink}>
//     By signing up, you agree to our Terms & Conditions
//   </Text>
// </TouchableOpacity>

// Example 3: Footer link in settings or about section
// <CustomButton
//   title="Terms & Conditions"
//   bgVariant="outline"
//   onPress={() => router.push('/legal/terms')}
//   IconLeft={() => <Ionicons name="document-text-outline" size={20} />}
// />
