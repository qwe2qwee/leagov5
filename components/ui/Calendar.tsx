import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// Types
export interface CalendarProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | { from?: Date; to?: Date };
  onSelect?: (
    date: Date | Date[] | { from?: Date; to?: Date } | undefined
  ) => void;
  disabled?: (date: Date) => boolean;
  showOutsideDays?: boolean;
  style?: ViewStyle;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  fixedWeeks?: boolean;
}

// Utility functions
const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isDateInRange = (
  date: Date,
  range: { from?: Date; to?: Date }
): "start" | "end" | "middle" | null => {
  if (!range.from) return null;

  if (isSameDay(date, range.from)) return "start";
  if (range.to && isSameDay(date, range.to)) return "end";

  if (range.to && date > range.from && date < range.to) return "middle";

  return null;
};

const isDateSelected = (
  date: Date,
  selected: Date | Date[] | { from?: Date; to?: Date } | undefined
): boolean => {
  if (!selected) return false;

  if (selected instanceof Date) {
    return isSameDay(date, selected);
  }

  if (Array.isArray(selected)) {
    return selected.some((selectedDate) => isSameDay(date, selectedDate));
  }

  if (typeof selected === "object" && "from" in selected) {
    return isDateInRange(date, selected) !== null;
  }

  return false;
};

// Localized month and day names
const getMonthNames = (language: string) => {
  if (language === "ar") {
    return [
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
    ];
  }
  return [
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
  ];
};

const getDayNames = (language: string) => {
  if (language === "ar") {
    return ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
  }
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
};

const Calendar = React.forwardRef<View, CalendarProps>(
  (
    {
      mode = "single",
      selected,
      onSelect,
      disabled,
      showOutsideDays = true,
      style,
      weekStartsOn = 0,
      fixedWeeks = false,
    },
    ref
  ) => {
    const theme = useTheme();
    const responsive = useResponsive();
    const fonts = useFontFamily();
    const { currentLanguage: language, isRTL } = useLanguageStore();

    const [currentDate, setCurrentDate] = React.useState(new Date());
    const today = new Date();

    const MONTH_NAMES = getMonthNames(language);
    const DAY_NAMES = getDayNames(language);

    const handlePrevMonth = React.useCallback(() => {
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
      );
    }, []);

    const handleNextMonth = React.useCallback(() => {
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
      );
    }, []);

    const handleDateSelect = React.useCallback(
      (date: Date) => {
        if (disabled && disabled(date)) return;
        if (!onSelect) return;

        if (mode === "single") {
          onSelect(date);
        } else if (mode === "multiple") {
          const currentSelected = (selected as Date[]) || [];
          const isCurrentlySelected = currentSelected.some((d) =>
            isSameDay(d, date)
          );

          if (isCurrentlySelected) {
            onSelect(currentSelected.filter((d) => !isSameDay(d, date)));
          } else {
            onSelect([...currentSelected, date]);
          }
        } else if (mode === "range") {
          const currentRange = (selected as { from?: Date; to?: Date }) || {};

          if (!currentRange.from || (currentRange.from && currentRange.to)) {
            onSelect({ from: date, to: undefined });
          } else if (currentRange.from && !currentRange.to) {
            if (date < currentRange.from) {
              onSelect({ from: date, to: currentRange.from });
            } else {
              onSelect({ from: currentRange.from, to: date });
            }
          }
        }
      },
      [mode, selected, onSelect, disabled]
    );

    const renderCalendarDays = React.useCallback(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDayOfMonth = getFirstDayOfMonth(currentDate);

      const adjustedFirstDay = (firstDayOfMonth - weekStartsOn + 7) % 7;
      const days: React.ReactNode[] = [];

      // Previous month days
      if (showOutsideDays) {
        const prevMonth = new Date(year, month - 1, 1);
        const daysInPrevMonth = getDaysInMonth(prevMonth);

        for (let i = adjustedFirstDay - 1; i >= 0; i--) {
          const day = daysInPrevMonth - i;
          const date = new Date(year, month - 1, day);
          days.push(renderDay(date, true, `prev-${day}`));
        }
      } else {
        for (let i = 0; i < adjustedFirstDay; i++) {
          days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        days.push(renderDay(date, false, `current-${day}`));
      }

      // Next month days
      const totalCells = fixedWeeks
        ? 42
        : Math.ceil((adjustedFirstDay + daysInMonth) / 7) * 7;
      const remainingCells = totalCells - days.length;

      if (showOutsideDays) {
        for (let day = 1; day <= remainingCells; day++) {
          const date = new Date(year, month + 1, day);
          days.push(renderDay(date, true, `next-${day}`));
        }
      } else {
        for (let i = 0; i < remainingCells; i++) {
          days.push(<View key={`empty-next-${i}`} style={styles.dayCell} />);
        }
      }

      return days;
    }, [currentDate, weekStartsOn, showOutsideDays, fixedWeeks]);

    const renderDay = React.useCallback(
      (date: Date, isOutside: boolean, key: string) => {
        const isToday = isSameDay(date, today);
        const isSelected = isDateSelected(date, selected);
        const isDisabled = disabled ? disabled(date) : false;

        let rangePosition: "start" | "end" | "middle" | null = null;
        if (
          mode === "range" &&
          selected &&
          typeof selected === "object" &&
          "from" in selected
        ) {
          rangePosition = isDateInRange(date, selected);
        }

        const dayStyles: ViewStyle[] = [styles.dayCell];
        const textStyles: TextStyle[] = [styles.dayText];

        if (isToday && !isSelected) {
          dayStyles.push(styles.dayToday);
          textStyles.push(styles.dayTodayText);
        }

        if (isSelected) {
          dayStyles.push(styles.daySelected);
          textStyles.push(styles.daySelectedText);
        }

        if (rangePosition === "start" || rangePosition === "end") {
          dayStyles.push(styles.dayRangeEnd);
        } else if (rangePosition === "middle") {
          dayStyles.push(styles.dayRangeMiddle);
        }

        if (isOutside) {
          dayStyles.push(styles.dayOutside);
          textStyles.push(styles.dayOutsideText);
        }

        if (isDisabled) {
          dayStyles.push(styles.dayDisabled);
          textStyles.push(styles.dayDisabledText);
        }

        return (
          <TouchableOpacity
            key={key}
            style={dayStyles}
            onPress={() => handleDateSelect(date)}
            disabled={isDisabled}
            activeOpacity={0.7}
          >
            <Text style={textStyles}>{date.getDate()}</Text>
          </TouchableOpacity>
        );
      },
      [today, selected, mode, disabled, handleDateSelect]
    );

    const styles = StyleSheet.create({
      container: {
        backgroundColor: theme.colors.surface,
        borderRadius: responsive.getBorderRadius("medium"),
        padding: responsive.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      header: {
        flexDirection: isRTL ? "row-reverse" : "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: responsive.spacing.lg,
        paddingHorizontal: responsive.spacing.sm,
      },
      monthYear: {
        fontSize: responsive.typography.h3,
        fontFamily: fonts.SemiBold || fonts.Bold || fonts.Regular,
        color: theme.colors.text,
        textAlign: "center",
        flex: 1,
        writingDirection: language === "ar" ? "rtl" : "ltr",
      },
      navButton: {
        width: responsive.getResponsiveValue(44, 48, 52, 56),
        height: responsive.getResponsiveValue(44, 48, 52, 56),
        borderRadius: responsive.getBorderRadius("medium"),
        backgroundColor: theme.colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: "center",
        alignItems: "center",
      },
      weekHeader: {
        flexDirection: isRTL ? "row-reverse" : "row",
        marginBottom: responsive.spacing.md,
      },
      weekDay: {
        flex: 1,
        alignItems: "center",
        paddingVertical: responsive.spacing.sm,
      },
      weekDayText: {
        fontSize: responsive.typography.caption,
        fontFamily: fonts.Medium || fonts.Regular,
        color: theme.colors.textSecondary,
        textAlign: "center",
        writingDirection: language === "ar" ? "rtl" : "ltr",
      },
      calendar: {
        flexDirection: "row",
        flexWrap: "wrap",
      },
      dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: responsive.getBorderRadius("small"),
        marginVertical: 2,
        minHeight: responsive.getResponsiveValue(40, 44, 48, 52),
      },
      dayText: {
        fontSize: responsive.typography.body,
        fontFamily: fonts.Regular,
        color: theme.colors.text,
        textAlign: "center",
        writingDirection: language === "ar" ? "rtl" : "ltr",
      },
      dayToday: {
        backgroundColor: theme.colors.primary + "20",
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      dayTodayText: {
        color: theme.colors.primary,
        fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      },
      daySelected: {
        backgroundColor: theme.colors.primary,
      },
      daySelectedText: {
        color: theme.colors.textInverse,
        fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
      },
      dayRangeEnd: {
        backgroundColor: theme.colors.primary,
      },
      dayRangeMiddle: {
        backgroundColor: theme.colors.primary + "30",
      },
      dayOutside: {
        opacity: 0.4,
      },
      dayOutsideText: {
        color: theme.colors.textSecondary,
      },
      dayDisabled: {
        opacity: 0.3,
      },
      dayDisabledText: {
        color: theme.colors.textMuted,
      },
    });

    return (
      <View ref={ref} style={[styles.container, style]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={isRTL ? handleNextMonth : handlePrevMonth}
          >
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={responsive.getIconSize("medium")}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.monthYear}>
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={isRTL ? handlePrevMonth : handleNextMonth}
          >
            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={responsive.getIconSize("medium")}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Week days header */}
        <View style={styles.weekHeader}>
          {DAY_NAMES.map((day, index) => (
            <View key={index} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar days */}
        <View style={styles.calendar}>{renderCalendarDays()}</View>
      </View>
    );
  }
);

Calendar.displayName = "Calendar";

export { Calendar };
