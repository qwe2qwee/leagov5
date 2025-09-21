import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Hooks
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";

import useLanguageStore, { Language } from "@/store/useLanguageStore";

// Components
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Separator } from "@/components/ui/Separator";
import { useToast } from "@/store/useToastStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";

interface LanguageOption {
  code: Language;
  nameAr: string;
  nameEn: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  {
    code: "ar",
    nameAr: "العربية",
    nameEn: "Arabic",
    flag: "🇸🇦",
  },
  {
    code: "en",
    nameAr: "الإنجليزية",
    nameEn: "English",
    flag: "🇺🇸",
  },
];

interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
  label: string;
  flag: string;
  disabled?: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  onPress,
  label,
  flag,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    container: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      // Better phone-focused vertical padding
      paddingVertical: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      // More efficient horizontal padding for phone screens
      paddingHorizontal: responsive.getResponsiveValue(2, 4, 6, 8, 10),
      opacity: disabled ? 0.5 : 1,
    },
    leftContent: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      flex: 1,
    },
    flag: {
      // Better constrained flag size for phones
      fontSize: responsive.getFontSize(18, 16, 22),
      marginRight: isRTL
        ? 0
        : responsive.getResponsiveValue(10, 12, 14, 16, 18),
      marginLeft: isRTL ? responsive.getResponsiveValue(10, 12, 14, 16, 18) : 0,
    },
    label: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
    },
    radioContainer: {
      // Optimized radio button size for phone touch targets
      width: responsive.getResponsiveValue(18, 20, 22, 24, 26),
      height: responsive.getResponsiveValue(18, 20, 22, 24, 26),
      borderRadius: responsive.getResponsiveValue(9, 10, 11, 12, 13),
      borderWidth: 2,
      borderColor: selected ? colors.primary : colors.border,
      backgroundColor: selected ? colors.primary : "transparent",
      justifyContent: "center",
      alignItems: "center",
    },
    radioInner: {
      // Better proportioned inner circle
      width: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      height: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      borderRadius: responsive.getResponsiveValue(3, 4, 5, 6, 7),
      backgroundColor: colors.textInverse,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Text style={styles.flag}>{flag}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.radioContainer}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

export default function LanguageSelectionScreen() {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, setLanguage, isRTL } = useLanguageStore();
  const { showSuccess } = useToast();
  const { back } = useSafeNavigate();

  // Local state for pending selection
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(currentLanguage);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // Localization
  const t = {
    title: currentLanguage === "ar" ? "اختيار اللغة" : "Language Selection",
    subtitle:
      currentLanguage === "ar"
        ? "اختر اللغة المفضلة للتطبيق"
        : "Choose your preferred app language",
    backTitle: currentLanguage === "ar" ? "العودة" : "Back",
    apply: currentLanguage === "ar" ? "تطبيق" : "Apply",
    applying: currentLanguage === "ar" ? "جاري التطبيق..." : "Applying...",
    languageChanged:
      currentLanguage === "ar"
        ? "تم تغيير اللغة بنجاح"
        : "Language changed successfully",
    restartNote:
      currentLanguage === "ar"
        ? "قد تحتاج لإعادة تشغيل التطبيق لتطبيق جميع التغييرات"
        : "You may need to restart the app to apply all changes",
  };

  const handleLanguageSelect = (language: Language): void => {
    setSelectedLanguage(language);
  };

  const handleApplyLanguage = async (): Promise<void> => {
    if (selectedLanguage === currentLanguage) {
      back();
      return;
    }

    setIsApplying(true);

    try {
      // Simulate a brief delay for user feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLanguage(selectedLanguage);
      showSuccess(t.languageChanged);

      // Navigate back after a brief moment
      setTimeout(() => {
        back();
      }, 800);
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setIsApplying(false);
    }
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
    },
    backText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
      // Optimized text spacing
      marginHorizontal: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    titleContainer: {
      alignItems: "center",
      // Better title container margin
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    title: {
      fontSize: responsive.getFontSize(24, 22, 28),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      textAlign: "center",
      // Reduced title bottom margin
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    subtitle: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: responsive.getFontSize(14, 13, 16) * 1.5,
    },
    languageCard: {
      // Better card margin for phone layouts
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
    },
    noteContainer: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      // Optimized note container padding
      padding: responsive.getResponsiveValue(10, 12, 16, 18, 20),
      marginBottom: responsive.getResponsiveValue(18, 20, 24, 26, 28),
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "flex-start",
    },
    noteIcon: {
      // Better icon spacing
      marginRight: isRTL ? 0 : responsive.getResponsiveValue(6, 8, 10, 12, 14),
      marginLeft: isRTL ? responsive.getResponsiveValue(6, 8, 10, 12, 14) : 0,
      marginTop: responsive.getResponsiveValue(1, 2, 3, 4, 5),
    },
    noteText: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      lineHeight: responsive.getFontSize(12, 11, 14) * 1.4,
      flex: 1,
    },
    bottomSpacing: {
      height: responsive.safeAreaBottom + responsive.getTabBarHeight(true) + 16,
    },
  });

  const hasChanges = selectedLanguage !== currentLanguage;

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
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {/* Language Options */}
        <Card type="default" style={styles.languageCard}>
          <Card.Content>
            {languageOptions.map((option, index) => (
              <React.Fragment key={option.code}>
                <RadioButton
                  selected={selectedLanguage === option.code}
                  onPress={() => handleLanguageSelect(option.code)}
                  label={
                    currentLanguage === "ar" ? option.nameAr : option.nameEn
                  }
                  flag={option.flag}
                  disabled={isApplying}
                />
                {index < languageOptions.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>

        {/* Info Note */}
        {hasChanges && (
          <View style={styles.noteContainer}>
            <Ionicons
              name="information-circle-outline"
              // Better constrained info icon size
              size={responsive.getResponsiveValue(14, 16, 18, 20, 22)}
              color={colors.textSecondary}
              style={styles.noteIcon}
            />
            <Text style={styles.noteText}>{t.restartNote}</Text>
          </View>
        )}

        {/* Apply Button */}
        <CustomButton
          title={isApplying ? t.applying : t.apply}
          bgVariant={hasChanges ? "primary" : "secondary"}
          onPress={handleApplyLanguage}
          loading={isApplying}
          disabled={isApplying}
          IconLeft={() =>
            !isApplying && (
              <Ionicons
                name="checkmark-outline"
                // Optimized button icon size
                size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                color={hasChanges ? colors.textInverse : colors.text}
              />
            )
          }
        />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </View>
    </View>
  );
}

// Basic usage examples:

// Example 1: Navigation from profile menu
// <ProfileMenuItem
//   icon="language-outline"
//   titleAr="اللغة"
//   titleEn="Language"
//   route="/screens/Language"
//   onPress={() => router.push('/screens/Language')}
// />

// Example 2: Settings menu navigation
// <TouchableOpacity onPress={() => router.push('/settings/language')}>
//   <View style={styles.settingsItem}>
//     <Ionicons name="language-outline" size={24} color={colors.primary} />
//     <Text>Language Settings</Text>
//     <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
//   </View>
// </TouchableOpacity>

// Example 3: First-time onboarding step
// <CustomButton
//   title="Choose Your Language"
//   bgVariant="primary"
//   onPress={() => router.push('/onboarding/language')}
//   IconLeft={() => <Ionicons name="globe-outline" size={20} />}
// />
