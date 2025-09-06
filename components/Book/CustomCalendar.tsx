import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

// Bilingual month names
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

// Bilingual day abbreviations
const DAYS = {
  ar: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

// Rental type labels
const RENTAL_TYPES = {
  ar: {
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
  },
  en: {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  },
};

// Duration labels
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

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    selectedDate || null
  );
  const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(
    null
  );
  const [localRentalType, setLocalRentalType] = useState(rentalType);
  const [localDuration, setLocalDuration] = useState(duration);

  // Get localized strings
  const t = {
    selectDate: currentLanguage === "ar" ? "اختر التاريخ" : "Select Date",
    close: currentLanguage === "ar" ? "إغلاق" : "Close",
    rentalType: currentLanguage === "ar" ? "نوع الإيجار:" : "Rental Type:",
    duration: currentLanguage === "ar" ? "المدة:" : "Duration:",
    today: currentLanguage === "ar" ? "اليوم" : "Today",
  };

  // Calculate end date based on rental type and duration
  useEffect(() => {
    if (selectedStartDate && localRentalType && localDuration) {
      const start = new Date(selectedStartDate);
      let endDate: Date;

      if (localRentalType === "daily") {
        endDate = new Date(start);
      } else if (localRentalType === "weekly") {
        endDate = new Date(start);
        endDate.setDate(start.getDate() + localDuration * 7);
      } else if (localRentalType === "monthly") {
        endDate = new Date(start);
        endDate.setMonth(start.getMonth() + localDuration);
      } else {
        endDate = new Date(start);
      }

      const endDateString = endDate.toISOString().split("T")[0];
      setCalculatedEndDate(endDateString);

      if (onPeriodSelect) {
        onPeriodSelect({
          startDate: selectedStartDate,
          endDate: endDateString,
          rentalType: localRentalType,
          duration: localDuration,
        });
      }
    }
  }, [selectedStartDate, localRentalType, localDuration, onPeriodSelect]);

  const formatDate = (date: Date): CalendarDate => {
    const dateString = date.toISOString().split("T")[0];
    return {
      date,
      dateString,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      timestamp: date.getTime(),
    };
  };

  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;

    return false;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!selectedStartDate || !calculatedEndDate) return false;
    const start = new Date(selectedStartDate);
    const end = new Date(calculatedEndDate);
    return date >= start && date <= end;
  };

  const isStartDate = (date: Date): boolean => {
    if (!selectedStartDate) return false;
    return date.toISOString().split("T")[0] === selectedStartDate;
  };

  const isEndDate = (date: Date): boolean => {
    if (!calculatedEndDate) return false;
    return date.toISOString().split("T")[0] === calculatedEndDate;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);

    while (days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const handleDatePress = (date: Date) => {
    if (isDateDisabled(date)) return;

    const formattedDate = formatDate(date);
    setSelectedStartDate(formattedDate.dateString);

    if (onDateSelect) {
      onDateSelect(formattedDate);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const styles = StyleSheet.create({
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      margin: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      maxHeight: "85%",
      width: Math.min(
        responsive.width * 0.95,
        responsive.getResponsiveValue(350, 380, 420, 460, 500)
      ),
    },
    modalHeader: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: responsive.getFontSize(18, 17, 21),
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.text,
    },
    closeButton: {
      fontSize: responsive.getFontSize(16, 15, 18),
      color: colors.primary,
      fontFamily: fonts.Medium || fonts.Regular,
    },
    modalSpacer: {
      width: responsive.getResponsiveValue(40, 50, 60, 70, 80),
    },

    // Main container
    container: {
      backgroundColor: colors.surface,
    },
    content: {
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },

    // Header with month navigation
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
    },
    navButton: {
      width: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      height: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      borderRadius: responsive.getResponsiveValue(20, 22, 24, 26, 28),
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    monthYearText: {
      fontSize: responsive.getFontSize(20, 19, 23),
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
      color: colors.text,
      textAlign: "center",
    },

    // Rental options section
    rentalOptionsContainer: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      padding: responsive.getResponsiveValue(16, 18, 20, 22, 24),
      marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
    },
    sectionTitle: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      textAlign: isRTL ? "right" : "left",
    },
    optionRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      flexWrap: "wrap",
      gap: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      marginBottom: responsive.getResponsiveValue(12, 14, 16, 18, 20),
    },
    optionButton: {
      paddingHorizontal: responsive.getResponsiveValue(16, 18, 20, 22, 24),
      paddingVertical: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      borderRadius: responsive.getResponsiveValue(20, 22, 24, 26, 28),
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
      minWidth: responsive.getResponsiveValue(70, 80, 90, 100, 110),
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionButtonText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: "center",
    },
    optionButtonTextSelected: {
      color: colors.textInverse,
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
    },

    // Days header
    daysHeader: {
      flexDirection: isRTL ? "row-reverse" : "row",
      marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingHorizontal: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    dayHeaderCell: {
      flex: 1,
      alignItems: "center",
      paddingVertical: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    dayHeaderText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
    },

    // Calendar grid
    calendarGrid: {
      backgroundColor: colors.background,
      borderRadius: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      padding: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    weekRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      margin: responsive.getResponsiveValue(2, 3, 4, 5, 6),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },

    // Day cell states
    dayCellToday: {
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    dayCellSelected: {
      backgroundColor: colors.primary,
    },
    dayCellInRange: {
      backgroundColor: `${colors.primary}15`,
    },
    dayCellDisabled: {
      opacity: 0.3,
    },
    dayCellOutside: {
      opacity: 0.4,
    },

    // Day text styles
    dayText: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: "center",
    },
    dayTextToday: {
      color: colors.primary,
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
    },
    dayTextSelected: {
      color: colors.textInverse,
      fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
    },
    dayTextDisabled: {
      color: colors.textMuted,
    },
    dayTextOutside: {
      color: colors.textMuted,
    },

    // Scroll view
    scrollView: {
      maxHeight: responsive.getResponsiveValue(400, 450, 500, 550, 600),
    },
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigateMonth(isRTL ? "next" : "prev")}
      >
        <Ionicons
          name={isRTL ? "chevron-forward" : "chevron-back"}
          size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
          color={colors.text}
        />
      </TouchableOpacity>

      <Text style={styles.monthYearText}>
        {MONTHS[currentLanguage][currentMonth.getMonth()]}{" "}
        {currentMonth.getFullYear()}
      </Text>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigateMonth(isRTL ? "prev" : "next")}
      >
        <Ionicons
          name={isRTL ? "chevron-back" : "chevron-forward"}
          size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
          color={colors.text}
        />
      </TouchableOpacity>
    </View>
  );

  const renderRentalOptions = () => {
    if (!showRentalOptions) return null;

    return (
      <View style={styles.rentalOptionsContainer}>
        <Text style={styles.sectionTitle}>{t.rentalType}</Text>
        <View style={styles.optionRow}>
          {(["daily", "weekly", "monthly"] as const).map((type) => {
            const isSelected = localRentalType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => setLocalRentalType(type)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    isSelected && styles.optionButtonTextSelected,
                  ]}
                >
                  {RENTAL_TYPES[currentLanguage][type]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {localRentalType !== "daily" && (
          <>
            <Text style={styles.sectionTitle}>{t.duration}</Text>
            <View style={styles.optionRow}>
              {localRentalType === "weekly"
                ? [1, 2, 3].map((weeks) => {
                    const isSelected = localDuration === weeks;
                    return (
                      <TouchableOpacity
                        key={weeks}
                        style={[
                          styles.optionButton,
                          isSelected && styles.optionButtonSelected,
                        ]}
                        onPress={() => setLocalDuration(weeks)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            isSelected && styles.optionButtonTextSelected,
                          ]}
                        >
                          {
                            DURATION_LABELS[currentLanguage].weekly[
                              weeks as keyof typeof DURATION_LABELS.en.weekly
                            ]
                          }
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                : [1, 2].map((months) => {
                    const isSelected = localDuration === months;
                    return (
                      <TouchableOpacity
                        key={months}
                        style={[
                          styles.optionButton,
                          isSelected && styles.optionButtonSelected,
                        ]}
                        onPress={() => setLocalDuration(months)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            isSelected && styles.optionButtonTextSelected,
                          ]}
                        >
                          {
                            DURATION_LABELS[currentLanguage].monthly[
                              months as keyof typeof DURATION_LABELS.en.monthly
                            ]
                          }
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
            </View>
          </>
        )}
      </View>
    );
  };

  const renderDaysHeader = () => (
    <View style={styles.daysHeader}>
      {DAYS[currentLanguage].map((day, index) => (
        <View key={index} style={styles.dayHeaderCell}>
          <Text style={styles.dayHeaderText}>{day}</Text>
        </View>
      ))}
    </View>
  );

  const renderCalendarGrid = () => {
    const days = generateCalendarDays();
    const weeks: Date[][] = [];

    // Group days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((date, dayIndex) => {
              const isCurrentMonth =
                date.getMonth() === currentMonth.getMonth();
              const disabled = isDateDisabled(date);
              const inRange = isDateInRange(date);
              const isStart = isStartDate(date);
              const isEnd = isEndDate(date);
              const todayDate = isToday(date);

              let cellStyle = [styles.dayCell];
              let textStyle = [styles.dayText];

              // Apply styles based on date state
              if (disabled) {
                cellStyle.push(styles.dayCellDisabled as any);
                textStyle.push(styles.dayTextDisabled as any);
              } else if (isStart || isEnd) {
                cellStyle.push(styles.dayCellSelected as any);
                textStyle.push(styles.dayTextSelected as any);
              } else if (inRange) {
                cellStyle.push(styles.dayCellInRange as any);
              } else if (todayDate && isCurrentMonth) {
                cellStyle.push(styles.dayCellToday as any);
                textStyle.push(styles.dayTextToday as any);
              }

              if (!isCurrentMonth) {
                cellStyle.push(styles.dayCellOutside as any);
                textStyle.push(styles.dayTextOutside as any);
              }

              return (
                <TouchableOpacity
                  key={`${weekIndex}-${dayIndex}`}
                  style={cellStyle}
                  onPress={() => handleDatePress(date)}
                  disabled={disabled}
                  activeOpacity={0.7}
                >
                  <Text style={textStyle}>{date.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderHeader()}
        {renderRentalOptions()}
        {renderDaysHeader()}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderCalendarGrid()}
        </ScrollView>
      </View>
    </View>
  );

  if (visible && onClose) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {isRTL ? (
                <>
                  <View style={styles.modalSpacer} />
                  <Text style={styles.modalTitle}>{t.selectDate}</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeButton}>{t.close}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeButton}>{t.close}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t.selectDate}</Text>
                  <View style={styles.modalSpacer} />
                </>
              )}
            </View>
            {content}
          </View>
        </View>
      </Modal>
    );
  }

  return content;
};

export default CustomCalendar;
