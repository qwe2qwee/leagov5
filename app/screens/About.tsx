// screens/About.tsx
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
import { useSafeNavigate } from "@/utils/useSafeNavigate";

// About sections data
interface AboutSection {
  iconName: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
}

const aboutSections: AboutSection[] = [
  {
    iconName: "business-outline",
    titleAr: "من نحن",
    titleEn: "Who We Are",
    contentAr:
      "ليجو هي شركة رائدة في مجال تأجير السيارات في المملكة العربية السعودية، مملوكة لشركة السحابة الأرجوانية. نقدم خدمات تأجير سيارات عالية الجودة مع أسطول متنوع من السيارات الحديثة.",
    contentEn:
      "LEAGO is a leading car rental company in Saudi Arabia, owned by Purple Cloud Company. We provide high-quality car rental services with a diverse fleet of modern vehicles.",
  },
  {
    iconName: "flag-outline",
    titleAr: "رؤيتنا",
    titleEn: "Our Vision",
    contentAr:
      "أن نكون الخيار الأول لتأجير السيارات في المملكة من خلال تقديم خدمة استثنائية وتجربة سلسة لعملائنا.",
    contentEn:
      "To be the first choice for car rental in the Kingdom by providing exceptional service and a seamless experience for our customers.",
  },
  {
    iconName: "sparkles-outline",
    titleAr: "قيمنا",
    titleEn: "Our Values",
    contentAr:
      "الجودة، الشفافية، الاحترافية، والالتزام برضا العملاء هي القيم الأساسية التي نعمل بها في ليجو.",
    contentEn:
      "Quality, transparency, professionalism, and commitment to customer satisfaction are the core values we work with at LEAGO.",
  },
  {
    iconName: "shield-checkmark-outline",
    titleAr: "الأمان والثقة",
    titleEn: "Safety & Trust",
    contentAr:
      "جميع سياراتنا مؤمنة بالكامل وتخضع لفحوصات دورية لضمان سلامتك وراحتك أثناء القيادة.",
    contentEn:
      "All our vehicles are fully insured and undergo regular inspections to ensure your safety and comfort while driving.",
  },
];

// Statistics data
interface Statistic {
  iconName: string;
  valueAr: string;
  valueEn: string;
  labelAr: string;
  labelEn: string;
}

const statistics: Statistic[] = [
  {
    iconName: "car-sport-outline",
    valueAr: "٢٠٠+",
    valueEn: "200+",
    labelAr: "سيارة متاحة",
    labelEn: "Available Cars",
  },
  {
    iconName: "people-outline",
    valueAr: "١٠,٠٠٠+",
    valueEn: "10,000+",
    labelAr: "عميل راضٍ",
    labelEn: "Happy Customers",
  },
  {
    iconName: "location-outline",
    valueAr: "١٥+",
    valueEn: "15+",
    labelAr: "مدينة نخدمها",
    labelEn: "Cities Served",
  },
  {
    iconName: "star-outline",
    valueAr: "٤.٨",
    valueEn: "4.8",
    labelAr: "تقييم العملاء",
    labelEn: "Customer Rating",
  },
];

// LEAGO Logo Component
const LeagoLogo: React.FC = () => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();

  const logoStyles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      width: responsive.getResponsiveValue(80, 90, 100, 110, 120),
      height: responsive.getResponsiveValue(80, 90, 100, 110, 120),
      borderRadius: responsive.getResponsiveValue(40, 45, 50, 55, 60),
      backgroundColor: colors.primary,
    },
    text: {
      fontSize: responsive.getFontSize(20, 18, 24),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.textInverse,
      letterSpacing: 2,
    },
  });

  return (
    <View style={logoStyles.container}>
      <Text style={logoStyles.text}>LEAGO</Text>
    </View>
  );
};

// About Section Item Component
interface AboutSectionItemProps {
  section: AboutSection;
  isLast?: boolean;
}

const AboutSectionItem: React.FC<AboutSectionItemProps> = ({
  section,
  isLast = false,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    container: {
      flexDirection: isRTL ? "row-reverse" : "row",
      paddingVertical: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      paddingHorizontal: responsive.getResponsiveValue(2, 4, 6, 8, 10),
    },
    iconContainer: {
      width: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      height: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      borderRadius: responsive.getResponsiveValue(20, 22, 24, 26, 28),
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
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
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      lineHeight: Math.round(responsive.getFontSize(16, 15, 18) * 1.3),
    },
    content: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      lineHeight: Math.round(responsive.getFontSize(14, 13, 16) * 1.5),
    },
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={section.iconName as any}
            size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
            color={colors.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {currentLanguage === "ar" ? section.titleAr : section.titleEn}
          </Text>
          <Text style={styles.content}>
            {currentLanguage === "ar" ? section.contentAr : section.contentEn}
          </Text>
        </View>
      </View>
      {!isLast && <Separator />}
    </>
  );
};

// Statistic Item Component
interface StatisticItemProps {
  stat: Statistic;
}

const StatisticItem: React.FC<StatisticItemProps> = ({ stat }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getBorderRadius("medium"),
      padding: responsive.getResponsiveValue(12, 16, 20, 22, 24),
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: responsive.getResponsiveValue(44, 48, 52, 56, 60),
      height: responsive.getResponsiveValue(44, 48, 52, 56, 60),
      borderRadius: responsive.getResponsiveValue(22, 24, 26, 28, 30),
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    value: {
      fontSize: responsive.getFontSize(24, 22, 28),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.primary,
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      lineHeight: Math.round(responsive.getFontSize(24, 22, 28) * 1.2),
    },
    label: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: Math.round(responsive.getFontSize(13, 12, 15) * 1.3),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={stat.iconName as any}
          size={responsive.getResponsiveValue(22, 24, 26, 28, 30)}
          color={colors.primary}
        />
      </View>
      <Text style={styles.value}>
        {currentLanguage === "ar" ? stat.valueAr : stat.valueEn}
      </Text>
      <Text style={styles.label}>
        {currentLanguage === "ar" ? stat.labelAr : stat.labelEn}
      </Text>
    </View>
  );
};

export default function AboutScreen() {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { back } = useSafeNavigate();

  // Localization
  const t = {
    title: currentLanguage === "ar" ? "عن ليجو" : "About LEAGO",
    backTitle: currentLanguage === "ar" ? "العودة" : "Back",
    statisticsTitle: currentLanguage === "ar" ? "إحصائياتنا" : "Our Statistics",
    companyInfo:
      currentLanguage === "ar" ? "معلومات الشركة" : "Company Information",
    parentCompany:
      currentLanguage === "ar" ? "الشركة المالكة" : "Parent Company",
    parentCompanyName:
      currentLanguage === "ar"
        ? "شركة السحابة الأرجوانية"
        : "Purple Cloud Company",
    established: currentLanguage === "ar" ? "تأسست في" : "Established in",
    year: currentLanguage === "ar" ? "٢٠٢٠" : "2020",
    headquarters: currentLanguage === "ar" ? "المقر الرئيسي" : "Headquarters",
    location:
      currentLanguage === "ar"
        ? "جدة، المملكة العربية السعودية"
        : "Jeddah, Saudi Arabia",
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: responsive.getResponsiveValue(14, 16, 18, 20, 22),
      paddingTop:
        responsive.safeAreaTop +
        responsive.getResponsiveValue(12, 16, 18, 20, 22),
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
    },
    backButton: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      paddingHorizontal: responsive.getResponsiveValue(10, 12, 16, 18, 20),
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    backText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
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
      marginBottom: responsive.getResponsiveValue(24, 28, 32, 36, 40),
    },
    logoBorder: {
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: responsive.getResponsiveValue(45, 50, 55, 60, 65),
      padding: responsive.getResponsiveValue(12, 16, 18, 20, 22),
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
    companyName: {
      fontSize: responsive.getFontSize(20, 19, 23),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      textAlign: "center",
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    tagline: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: responsive.getFontSize(18, 17, 20),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
    aboutCard: {
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    statisticsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    infoCard: {
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    infoRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      paddingVertical: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      paddingHorizontal: responsive.getResponsiveValue(2, 4, 6, 8, 10),
    },
    infoLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
    },
    infoValue: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "left" : "right",
    },
    bottomSpacing: {
      height: responsive.safeAreaBottom + responsive.getTabBarHeight(true) + 16,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => back()}>
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
              color={colors.text}
            />
            <Text style={styles.backText}>{t.backTitle}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t.title}</Text>

          <View
            style={{
              width: responsive.getResponsiveValue(70, 80, 90, 100, 110),
            }}
          />
        </View>

        {/* LEAGO Logo & Name */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBorder}>
            <LeagoLogo />
          </View>
          <Text style={styles.companyName}>
            {currentLanguage === "ar" ? "شركة ليجو" : "LEAGO Company"}
          </Text>
          <Text style={styles.tagline}>
            {currentLanguage === "ar"
              ? "رفيقك في كل رحلة"
              : "Your Companion on Every Journey"}
          </Text>
        </View>

        {/* About Sections */}
        <Card type="default" style={styles.aboutCard}>
          <Card.Content>
            {aboutSections.map((section, index) => (
              <AboutSectionItem
                key={section.iconName}
                section={section}
                isLast={index === aboutSections.length - 1}
              />
            ))}
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Text style={styles.sectionTitle}>{t.statisticsTitle}</Text>
        <View style={styles.statisticsContainer}>
          {statistics.map((stat) => (
            <StatisticItem key={stat.iconName} stat={stat} />
          ))}
        </View>

        {/* Company Information */}
        <Text style={styles.sectionTitle}>{t.companyInfo}</Text>
        <Card type="default" style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.parentCompany}</Text>
              <Text style={styles.infoValue}>{t.parentCompanyName}</Text>
            </View>
            <Separator />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.established}</Text>
              <Text style={styles.infoValue}>{t.year}</Text>
            </View>
            <Separator />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.headquarters}</Text>
              <Text style={styles.infoValue}>{t.location}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}
