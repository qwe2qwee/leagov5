import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BranchInfoCardProps {
  branch: any;
}

const BranchInfoCard: React.FC<BranchInfoCardProps> = ({ branch }) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { showWarning } = useToast();

  const t = {
    title: currentLanguage === "ar" ? "معلومات الفرع" : "Branch Information",
    phoneNotAvailable:
      currentLanguage === "ar"
        ? "رقم الهاتف غير متوفر"
        : "Phone number not available",
  };

  const handleCall = () => {
    if (branch?.phone) {
      Linking.openURL(`tel:${branch.phone}`);
    } else {
      showWarning(t.phoneNotAvailable);
    }
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    header: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
    title: {
      fontSize: responsive.getFontSize(16, 18, 20),
      fontFamily: fonts.Bold,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
    },
    branchName: {
      fontSize: responsive.getFontSize(18, 20, 22),
      fontFamily: fonts.Bold,
      color: colors.primary,
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      textAlign: isRTL ? "right" : "left",
    },
    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "flex-start",
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
    iconContainer: {
      width: responsive.getResponsiveValue(32, 36, 40, 44, 48),
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    contentContainer: {
      flex: 1,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    text: {
      fontSize: responsive.getFontSize(14, 15, 16),
      fontFamily: fonts.Medium,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      lineHeight: responsive.getFontSize(20, 22, 24),
    },
    callButton: {
      backgroundColor: colors.success + "15",
      paddingHorizontal: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginTop: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      alignSelf: isRTL ? "flex-end" : "flex-start",
    },
    callText: {
      fontSize: responsive.getFontSize(13, 14, 15),
      fontFamily: fonts.SemiBold,
      color: colors.success,
      marginHorizontal: 6,
    },
  });

  if (!branch) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
      </View>

      <Text style={styles.branchName}>
        {isRTL ? branch.name_ar : branch.name_en}
      </Text>

      {/* Location */}
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="location-outline"
            size={20}
            color={colors.textSecondary}
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.text}>
            {isRTL ? branch.location_ar : branch.location_en}
          </Text>
        </View>
      </View>

      {/* Working Hours */}
      {branch.working_hours && (
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="time-outline"
              size={20}
              color={colors.textSecondary}
            />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.text}>{branch.working_hours}</Text>
          </View>
        </View>
      )}

      {/* Phone */}
      {branch.phone && (
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="call-outline"
              size={20}
              color={colors.textSecondary}
            />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.text}>{branch.phone}</Text>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Ionicons name="call" size={16} color={colors.success} />
              <Text style={styles.callText}>{branch.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default BranchInfoCard;
