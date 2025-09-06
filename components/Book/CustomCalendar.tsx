import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

// Types
interface CalendarDate {
  date: Date;
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

interface RentalPeriod {
  startDate: string;
  endDate: string;
  rentalType: "daily" | "weekly" | "monthly";
  duration: number;
}

interface CustomCalendarProps {
  onDateSelect?: (date: CalendarDate) => void;
  onPeriodSelect?: (period: RentalPeriod) => void;
  minDate?: Date;
  maxDate?: Date;
  selectedDate?: string;
  rentalType?: "daily" | "weekly" | "monthly";
  duration?: number;
  showRentalOptions?: boolean;
  visible?: boolean;
  onClose?: () => void;
}

// Constants
const MONTHS = {
  ar: [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

const DAYS = {
  ar: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const RENTAL_TYPES = {
  ar: { daily: "يومي", weekly: "أسبوعي", monthly: "شهري" },
  en: { daily: "Daily", weekly: "Weekly", monthly: "Monthly" },
};

const DURATION_LABELS = {
  ar: {
    weekly: { 1: "أسبوع واحد", 2: "أسبوعين", 3: "3 أسابيع" },
    monthly: { 1: "شهر واحد", 2: "شهرين" },
  },
  en: {
    weekly: { 1: "1 Week", 2: "2 Weeks", 3: "3 Weeks" },
    monthly: { 1: "1 Month", 2: "2 Months" },
  },
};

// Custom Hooks
const useCalendarLogic = (
  selectedDate?: string,
  rentalType: "daily" | "weekly" | "monthly" = "daily",
  duration: number = 1,
  onPeriodSelect?: (period: RentalPeriod) => void
) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    selectedDate || null
  );
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(
    null
  );
  const [localRentalType, setLocalRentalType] = useState(rentalType);
  const [localDuration, setLocalDuration] = useState(duration);

  // Calculate end date when parameters change
  useEffect(() => {
    if (selectedStartDate && localRentalType && localDuration) {
      const start = new Date(selectedStartDate);
      let endDate: Date;

      switch (localRentalType) {
        case "daily":
          endDate = new Date(start);
          break;
        case "weekly":
          endDate = new Date(start);
          endDate.setDate(start.getDate() + localDuration * 7);
          break;
        case "monthly":
          endDate = new Date(start);
          endDate.setMonth(start.getMonth() + localDuration);
          break;
        default:
          endDate = new Date(start);
      }

      const endDateString = endDate.toISOString().split("T")[0];
      setCalculatedEndDate(endDateString);

      onPeriodSelect?.({
        startDate: selectedStartDate,
        endDate: endDateString,
        rentalType: localRentalType,
        duration: localDuration,
      });
    }
  }, [selectedStartDate, localRentalType, localDuration, onPeriodSelect]);

  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
  }, []);

  return {
    currentMonth,
    selectedStartDate,
    calculatedEndDate,
    localRentalType,
    localDuration,
    setSelectedStartDate,
    setLocalRentalType,
    setLocalDuration,
    navigateMonth,
  };
};

const useCalendarHelpers = (
  minDate: Date,
  maxDate?: Date,
  selectedStartDate?: string | null,
  calculatedEndDate?: string | null
) => {
  const formatDate = useCallback((date: Date): CalendarDate => {
    const dateString = date.toISOString().split("T")[0];
    return {
      date,
      dateString,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      timestamp: date.getTime(),
    };
  }, []);

  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;

      return false;
    },
    [minDate, maxDate]
  );

  const isDateInRange = useCallback(
    (date: Date): boolean => {
      if (!selectedStartDate || !calculatedEndDate) return false;
      const start = new Date(selectedStartDate);
      const end = new Date(calculatedEndDate);
      return date >= start && date <= end;
    },
    [selectedStartDate, calculatedEndDate]
  );

  const isStartDate = useCallback(
    (date: Date): boolean => {
      if (!selectedStartDate) return false;
      return date.toISOString().split("T")[0] === selectedStartDate;
    },
    [selectedStartDate]
  );

  const isEndDate = useCallback(
    (date: Date): boolean => {
      if (!calculatedEndDate) return false;
      return date.toISOString().split("T")[0] === calculatedEndDate;
    },
    [calculatedEndDate]
  );

  const isToday = useCallback((date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const generateCalendarDays = useCallback((currentMonth: Date) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);

    while (days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, []);

  return {
    formatDate,
    isDateDisabled,
    isDateInRange,
    isStartDate,
    isEndDate,
    isToday,
    generateCalendarDays,
  };
};

// Components
const CalendarHeader: React.FC<{
  currentMonth: Date;
  onNavigate: (direction: "prev" | "next") => void;
  isRTL: boolean;
  currentLanguage: "ar" | "en";
  styles: any;
  colors: any;
  responsive: any;
}> = ({
  currentMonth,
  onNavigate,
  isRTL,
  currentLanguage,
  styles,
  colors,
  responsive,
}) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.navButton}
      onPress={() => onNavigate(isRTL ? "next" : "prev")}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isRTL ? "chevron-forward" : "chevron-back"}
        size={responsive.getResponsiveValue(24, 26, 28, 30, 32)}
        color={colors.text}
      />
    </TouchableOpacity>

    <Text style={styles.monthYearText}>
      {MONTHS[currentLanguage][currentMonth.getMonth()]}{" "}
      {currentMonth.getFullYear()}
    </Text>

    <TouchableOpacity
      style={styles.navButton}
      onPress={() => onNavigate(isRTL ? "prev" : "next")}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isRTL ? "chevron-back" : "chevron-forward"}
        size={responsive.getResponsiveValue(24, 26, 28, 30, 32)}
        color={colors.text}
      />
    </TouchableOpacity>
  </View>
);

const RentalOptions: React.FC<{
  showRentalOptions: boolean;
  localRentalType: "daily" | "weekly" | "monthly";
  localDuration: number;
  onRentalTypeChange: (type: "daily" | "weekly" | "monthly") => void;
  onDurationChange: (duration: number) => void;
  isRTL: boolean;
  currentLanguage: "ar" | "en";
  styles: any;
  t: any;
}> = ({
  showRentalOptions,
  localRentalType,
  localDuration,
  onRentalTypeChange,
  onDurationChange,
  isRTL,
  currentLanguage,
  styles,
  t,
}) => {
  if (!showRentalOptions) return null;

  return (
    <View style={styles.rentalOptionsContainer}>
      <Text style={styles.sectionTitle}>{t.rentalType}</Text>
      <View style={styles.optionRow}>
        {(["daily", "weekly", "monthly"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.optionButton,
              localRentalType === type && styles.optionButtonSelected,
            ]}
            onPress={() => onRentalTypeChange(type)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionButtonText,
                localRentalType === type && styles.optionButtonTextSelected,
              ]}
            >
              {RENTAL_TYPES[currentLanguage][type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {localRentalType !== "daily" && (
        <>
          <Text style={styles.sectionTitle}>{t.duration}</Text>
          <View style={styles.optionRow}>
            {(localRentalType === "weekly" ? [1, 2, 3] : [1, 2]).map(
              (duration) => {
                const getDurationLabel = () => {
                  if (localRentalType === "weekly") {
                    return DURATION_LABELS[currentLanguage].weekly[
                      duration as 1 | 2 | 3
                    ];
                  } else {
                    return DURATION_LABELS[currentLanguage].monthly[
                      duration as 1 | 2
                    ];
                  }
                };

                return (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.optionButton,
                      localDuration === duration && styles.optionButtonSelected,
                    ]}
                    onPress={() => onDurationChange(duration)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        localDuration === duration &&
                          styles.optionButtonTextSelected,
                      ]}
                    >
                      {getDurationLabel()}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </>
      )}
    </View>
  );
};

const DaysHeader: React.FC<{
  isRTL: boolean;
  currentLanguage: "ar" | "en";
  styles: any;
}> = ({ isRTL, currentLanguage, styles }) => (
  <View style={styles.daysHeader}>
    {DAYS[currentLanguage].map((day, index) => (
      <View key={index} style={styles.dayHeaderCell}>
        <Text style={styles.dayHeaderText}>{day}</Text>
      </View>
    ))}
  </View>
);

const CalendarGrid: React.FC<{
  days: Date[];
  currentMonth: Date;
  onDatePress: (date: Date) => void;
  helpers: any;
  isRTL: boolean;
  styles: any;
}> = ({ days, currentMonth, onDatePress, helpers, isRTL, styles }) => {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getDayStyles = useCallback(
    (date: Date) => {
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const disabled = helpers.isDateDisabled(date);
      const inRange = helpers.isDateInRange(date);
      const isStart = helpers.isStartDate(date);
      const isEnd = helpers.isEndDate(date);
      const todayDate = helpers.isToday(date);

      if (disabled)
        return {
          container: styles.dayCellDisabled,
          text: styles.dayTextDisabled,
        };
      if (isStart || isEnd)
        return {
          container: styles.dayCellSelected,
          text: styles.dayTextSelected,
        };
      if (inRange)
        return { container: styles.dayCellInRange, text: styles.dayText };
      if (todayDate && isCurrentMonth)
        return { container: styles.dayCellToday, text: styles.dayTextToday };
      if (!isCurrentMonth)
        return {
          container: styles.dayCellOutside,
          text: styles.dayTextOutside,
        };

      return { container: styles.dayCell, text: styles.dayText };
    },
    [currentMonth, helpers, styles]
  );

  return (
    <View style={styles.calendarGrid}>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((date, dayIndex) => {
            const disabled = helpers.isDateDisabled(date);
            const dayStyles = getDayStyles(date);

            return (
              <TouchableOpacity
                key={`${weekIndex}-${dayIndex}`}
                style={dayStyles.container}
                onPress={() => onDatePress(date)}
                disabled={disabled}
                activeOpacity={0.7}
              >
                <Text style={dayStyles.text}>{date.getDate()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

// Main Component
const CustomCalendar: React.FC<CustomCalendarProps> = ({
  onDateSelect,
  onPeriodSelect,
  minDate = new Date(),
  maxDate,
  selectedDate,
  rentalType = "daily",
  duration = 1,
  showRentalOptions = false,
  visible = true,
  onClose,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const {
    currentMonth,
    selectedStartDate,
    calculatedEndDate,
    localRentalType,
    localDuration,
    setSelectedStartDate,
    setLocalRentalType,
    setLocalDuration,
    navigateMonth,
  } = useCalendarLogic(selectedDate, rentalType, duration, onPeriodSelect);

  const helpers = useCalendarHelpers(
    minDate,
    maxDate,
    selectedStartDate,
    calculatedEndDate
  );

  const t = useMemo(
    () => ({
      selectDate: currentLanguage === "ar" ? "اختر التاريخ" : "Select Date",
      close: currentLanguage === "ar" ? "إغلاق" : "Close",
      rentalType: currentLanguage === "ar" ? "نوع الإيجار:" : "Rental Type:",
      duration: currentLanguage === "ar" ? "المدة:" : "Duration:",
    }),
    [currentLanguage]
  );

  const days = useMemo(
    () => helpers.generateCalendarDays(currentMonth),
    [currentMonth, helpers]
  );

  const handleDatePress = useCallback(
    (date: Date) => {
      if (helpers.isDateDisabled(date)) return;

      const formattedDate = helpers.formatDate(date);
      setSelectedStartDate(formattedDate.dateString);
      onDateSelect?.(formattedDate);
    },
    [helpers, setSelectedStartDate, onDateSelect]
  );

  const styles = StyleSheet.create({
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      borderTopRightRadius: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      margin: 0,
      maxHeight: "90%",
      width: "100%",
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.border,
    },
    modalHeader: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: responsive.spacing.lg,
      paddingVertical: responsive.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      borderTopLeftRadius: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      borderTopRightRadius: responsive.getResponsiveValue(24, 28, 32, 36, 40),
    },
    modalTitle: {
      fontSize: responsive.typography.h4,
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.text,
      fontWeight: "600",
    },
    closeButton: {
      fontSize: responsive.typography.body,
      color: colors.primary,
      fontFamily: fonts.Medium || fonts.Regular,
      fontWeight: "500",
      paddingHorizontal: responsive.spacing.sm,
      paddingVertical: responsive.spacing.xs,
    },
    modalSpacer: {
      width: responsive.getResponsiveValue(60, 70, 80, 90, 100),
    },
    container: {
      backgroundColor: colors.surface,
      flex: 1,
    },
    content: {
      padding: responsive.spacing.lg,
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: responsive.spacing.xl,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getBorderRadius("large"),
      paddingVertical: responsive.spacing.md,
      paddingHorizontal: responsive.spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    navButton: {
      width: responsive.getResponsiveValue(48, 52, 56, 60, 64),
      height: responsive.getResponsiveValue(48, 52, 56, 60, 64),
      borderRadius: responsive.getResponsiveValue(24, 26, 28, 30, 32),
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    monthYearText: {
      fontSize: responsive.typography.h3,
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.text,
      textAlign: "center",
      fontWeight: "600",
      minWidth: responsive.getResponsiveValue(160, 180, 200, 220, 240),
    },
    rentalOptionsContainer: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getBorderRadius("large"),
      padding: responsive.spacing.lg,
      marginBottom: responsive.spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: responsive.typography.body,
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.text,
      marginBottom: responsive.spacing.md,
      textAlign: isRTL ? "right" : "left",
      fontWeight: "600",
    },
    optionRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      flexWrap: "wrap",
      gap: responsive.spacing.sm,
      marginBottom: responsive.spacing.md,
    },
    optionButton: {
      paddingHorizontal: responsive.spacing.lg,
      paddingVertical: responsive.spacing.sm,
      borderRadius: responsive.getBorderRadius("large"),
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.background,
      minWidth: responsive.getResponsiveValue(90, 100, 110, 120, 130),
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionButtonText: {
      fontSize: responsive.typography.caption,
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: "center",
      fontWeight: "500",
    },
    optionButtonTextSelected: {
      color: colors.textInverse,
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      fontWeight: "600",
    },
    daysHeader: {
      flexDirection: isRTL ? "row-reverse" : "row",
      marginBottom: responsive.spacing.md,
      paddingHorizontal: responsive.spacing.sm,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getBorderRadius("medium"),
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayHeaderCell: {
      flex: 1,
      alignItems: "center",
      paddingVertical: responsive.spacing.md,
    },
    dayHeaderText: {
      fontSize: responsive.typography.caption,
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
      fontWeight: "600",
    },
    calendarGrid: {
      backgroundColor: colors.background,
      borderRadius: responsive.getBorderRadius("large"),
      padding: responsive.spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    weekRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      margin: responsive.getResponsiveValue(4, 5, 6, 7, 8),
      borderRadius: responsive.getBorderRadius("medium"),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "transparent",
    },
    dayCellToday: {
      flex: 1,
      aspectRatio: 1,
      margin: responsive.getResponsiveValue(4, 5, 6, 7, 8),
      borderRadius: responsive.getBorderRadius("medium"),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    dayCellSelected: {
      flex: 1,
      aspectRatio: 1,
      margin: responsive.getResponsiveValue(4, 5, 6, 7, 8),
      borderRadius: responsive.getBorderRadius("medium"),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    dayCellInRange: {
      flex: 1,
      aspectRatio: 1,
      margin: responsive.getResponsiveValue(4, 5, 6, 7, 8),
      borderRadius: responsive.getBorderRadius("medium"),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.primary,
      opacity: 0.6,
    },
    dayCellDisabled: {
      flex: 1,
      aspectRatio: 1,
      margin: responsive.getResponsiveValue(4, 5, 6, 7, 8),
      borderRadius: responsive.getBorderRadius("medium"),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "transparent",
      opacity: 0.3,
    },
    dayCellOutside: {
      flex: 1,
      aspectRatio: 1,
      margin: responsive.getResponsiveValue(4, 5, 6, 7, 8),
      borderRadius: responsive.getBorderRadius("medium"),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "transparent",
      opacity: 0.4,
    },
    dayText: {
      fontSize: responsive.typography.body,
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: "center",
      fontWeight: "500",
    },
    dayTextToday: {
      fontSize: responsive.typography.body,
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.primary,
      textAlign: "center",
      fontWeight: "700",
    },
    dayTextSelected: {
      fontSize: responsive.typography.body,
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.textInverse,
      textAlign: "center",
      fontWeight: "700",
    },
    dayTextDisabled: {
      fontSize: responsive.typography.body,
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.textMuted,
      textAlign: "center",
      fontWeight: "500",
    },
    dayTextOutside: {
      fontSize: responsive.typography.body,
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.textMuted,
      textAlign: "center",
      fontWeight: "500",
    },
    scrollView: {
      maxHeight: responsive.getResponsiveValue(450, 500, 550, 600, 650),
    },
  });

  const content = (
    <View style={styles.container}>
      <View style={styles.content}>
        <CalendarHeader
          currentMonth={currentMonth}
          onNavigate={navigateMonth}
          isRTL={isRTL}
          currentLanguage={currentLanguage}
          styles={styles}
          colors={colors}
          responsive={responsive}
        />
        <RentalOptions
          showRentalOptions={showRentalOptions}
          localRentalType={localRentalType}
          localDuration={localDuration}
          onRentalTypeChange={setLocalRentalType}
          onDurationChange={setLocalDuration}
          isRTL={isRTL}
          currentLanguage={currentLanguage}
          styles={styles}
          t={t}
        />
        <DaysHeader
          isRTL={isRTL}
          currentLanguage={currentLanguage}
          styles={styles}
        />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <CalendarGrid
            days={days}
            currentMonth={currentMonth}
            onDatePress={handleDatePress}
            helpers={helpers}
            isRTL={isRTL}
            styles={styles}
          />
        </ScrollView>
      </View>
    </View>
  );

  if (visible && onClose) {
    return (
      <Modal
        isVisible={visible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={300}
        animationOutTiming={250}
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={250}
        backdropOpacity={0.6}
        backdropColor="black"
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        propagateSwipe={true}
        swipeDirection={["down"]}
        swipeThreshold={100}
        onSwipeComplete={onClose}
        style={{
          justifyContent: "flex-end",
          margin: 0,
        }}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            {isRTL ? (
              <>
                <View style={styles.modalSpacer} />
                <Text style={styles.modalTitle}>{t.selectDate}</Text>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <Text style={styles.closeButton}>{t.close}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <Text style={styles.closeButton}>{t.close}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{t.selectDate}</Text>
                <View style={styles.modalSpacer} />
              </>
            )}
          </View>
          {content}
        </View>
      </Modal>
    );
  }

  return content;
};

export default CustomCalendar;
