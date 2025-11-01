import { Select } from "@/components/ui/Select";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RentalType = "daily" | "weekly" | "monthly";

interface BookingFormData {
  startDate: string;
  endDate: string;
  rentalType: RentalType;
  duration: number;
}

interface Prices {
  daily: number;
  weekly: number;
  monthly: number;
}

interface BookingFormProps {
  formData: BookingFormData;
  onFormDataChange: (data: Partial<BookingFormData>) => void;
  onOpenCalendar: () => void;
  availableRentalTypes: { value: string; label: string }[];
  texts: {
    rentalType: string;
    duration: string;
    rentalDate: string;
    startDate: string;
    selectRentalType: string;
    selectWeeks: string;
    selectMonths: string;
    tapToSelectDate: string;
    totalPrice: string;
  };
  prices: Prices;
}

export default function BookingForm({
  formData,
  onFormDataChange,
  onOpenCalendar,
  availableRentalTypes,
  texts,
  prices,
}: BookingFormProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  // Duration options based on rental type
  const getDurationOptions = useCallback(() => {
    if (formData.rentalType === "weekly") {
      return [
        {
          value: "1",
          label: currentLanguage === "ar" ? "أسبوع واحد" : "1 Week",
        },
        { value: "2", label: currentLanguage === "ar" ? "أسبوعين" : "2 Weeks" },
        {
          value: "3",
          label: currentLanguage === "ar" ? "3 أسابيع" : "3 Weeks",
        },
      ];
    } else if (formData.rentalType === "monthly") {
      return [
        {
          value: "1",
          label: currentLanguage === "ar" ? "شهر واحد" : "1 Month",
        },
        { value: "2", label: currentLanguage === "ar" ? "شهرين" : "2 Months" },
      ];
    } else if (formData.rentalType === "daily") {
      return Array.from({ length: 30 }, (_, i) => ({
        value: (i + 1).toString(),
        label:
          currentLanguage === "ar"
            ? `${i + 1} ${i + 1 === 1 ? "يوم" : "أيام"}`
            : `${i + 1} Day${i + 1 > 1 ? "s" : ""}`,
      }));
    }
    return [];
  }, [formData.rentalType, currentLanguage]);

  // ⬅️ جديد: Map للحصول على label من value
  const rentalTypeLabels = useMemo(() => {
    const map: Record<string, string> = {};
    availableRentalTypes.forEach((type) => {
      map[type.value] = type.label;
    });
    return map;
  }, [availableRentalTypes]);

  // ⬅️ جديد: Map للحصول على duration label من value
  const durationLabels = useMemo(() => {
    const map: Record<string, string> = {};
    getDurationOptions().forEach((option) => {
      map[option.value] = option.label;
    });
    return map;
  }, [getDurationOptions]);

  // ⬅️ جديد: دالة للحصول على نص Rental Type
  const getRentalTypeLabel = useCallback(() => {
    if (!formData.rentalType) return texts.selectRentalType;
    return rentalTypeLabels[formData.rentalType] || formData.rentalType;
  }, [formData.rentalType, rentalTypeLabels, texts.selectRentalType]);

  // ⬅️ جديد: دالة للحصول على نص Duration
  const getDurationLabel = useCallback(() => {
    const durationStr = formData.duration.toString();
    if (!durationStr) {
      return formData.rentalType === "weekly"
        ? texts.selectWeeks
        : formData.rentalType === "monthly"
        ? texts.selectMonths
        : "اختر الأيام";
    }
    return durationLabels[durationStr] || durationStr;
  }, [
    formData.duration,
    formData.rentalType,
    durationLabels,
    texts.selectWeeks,
    texts.selectMonths,
  ]);

  // Format selected date for display
  const formatDisplayDate = useCallback(
    (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString("en-US", options);
    },
    [currentLanguage]
  );

  // Calculate total price
  const totalPrice = useMemo(() => {
    const duration = formData.duration || 0;
    let total = 0;

    switch (formData.rentalType) {
      case "daily":
        total = duration * prices.daily;
        break;
      case "weekly":
        total = duration * prices.weekly;
        break;
      case "monthly":
        total = duration * prices.monthly;
        break;
      default:
        total = 0;
    }

    return total;
  }, [formData.rentalType, formData.duration, prices]);

  const styles = StyleSheet.create({
    formSection: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    formLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.SemiBold || fonts.Regular,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      textAlign: isRTL ? "right" : "left",
    },
    dateButton: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: formData.startDate ? colors.primary : colors.border,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      padding: responsive.getResponsiveValue(14, 16, 18, 20, 22),
      minHeight: responsive.getInputHeight(),
    },
    dateButtonText: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Regular,
      color: formData.startDate ? colors.text : colors.textSecondary,
      flex: 1,
      textAlign: isRTL ? "right" : "left",
    },
    dateButtonPlaceholder: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Regular,
      color: colors.textMuted,
      flex: 1,
      textAlign: isRTL ? "right" : "left",
    },
    dateButtonIcon: {
      marginLeft: isRTL ? 0 : responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginRight: isRTL ? responsive.getResponsiveValue(8, 10, 12, 14, 16) : 0,
    },
    totalPriceContainer: {
      marginTop: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      padding: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    totalPriceText: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
      color: colors.primary,
      textAlign: isRTL ? "right" : "left",
    },
    // ⬅️ جديد: Style للـ custom trigger text
    triggerText: {
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Regular,
      flex: 1,
      textAlign: "right",
      lineHeight: Math.round(responsive.getFontSize(15, 14, 17) * 1.3),
    },
  });

  return (
    <View>
      {/* Rental Type */}
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>{texts.rentalType}</Text>
        <Select
          value={formData.rentalType}
          onValueChange={(value) =>
            onFormDataChange({ rentalType: value as RentalType, duration: 1 })
          }
        >
          {/* ⬅️ Custom Trigger مع النص الصحيح */}
          <Select.Trigger>
            <Text
              style={[
                styles.triggerText,
                {
                  color: formData.rentalType
                    ? colors.text
                    : colors.textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {getRentalTypeLabel()}
            </Text>
          </Select.Trigger>

          <Select.Content>
            {availableRentalTypes.map((type) => (
              <Select.Item key={type.value} value={type.value}>
                {type.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </View>

      {/* Duration */}
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>{texts.duration}</Text>
        <Select
          value={formData.duration.toString()}
          onValueChange={(value) =>
            onFormDataChange({ duration: parseInt(value) })
          }
        >
          {/* ⬅️ Custom Trigger مع النص الصحيح */}
          <Select.Trigger>
            <Text
              style={[
                styles.triggerText,
                {
                  color: formData.duration ? colors.text : colors.textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {getDurationLabel()}
            </Text>
          </Select.Trigger>

          <Select.Content>
            {getDurationOptions().map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </View>

      {/* Start Date */}
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>
          {formData.rentalType === "daily" ? texts.rentalDate : texts.startDate}
        </Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={onOpenCalendar}
          activeOpacity={0.7}
        >
          {formData.startDate ? (
            <Text style={styles.dateButtonText}>
              {formatDisplayDate(formData.startDate)}
            </Text>
          ) : (
            <Text style={styles.dateButtonPlaceholder}>
              {texts.tapToSelectDate}
            </Text>
          )}
          <View style={styles.dateButtonIcon}>
            <Ionicons
              name="calendar"
              size={responsive.getIconSize("small")}
              color={formData.startDate ? colors.primary : colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
