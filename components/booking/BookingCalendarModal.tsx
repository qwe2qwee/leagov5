import CustomCalendar from "@/components/Book/CustomCalendar";
import React from "react";

type RentalType = "daily" | "weekly" | "monthly";

interface CalendarDate {
  date: Date;
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

interface BookingCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: CalendarDate) => void;
  minDate: Date;
  rentalType: RentalType;
  duration: number;
}

export default function BookingCalendarModal({
  visible,
  onClose,
  onDateSelect,
  minDate,
  rentalType,
  duration,
}: BookingCalendarModalProps) {
  // Only render when visible is true
  if (!visible) {
    return null;
  }

  return (
    <CustomCalendar
      visible={visible}
      onClose={onClose}
      onDateSelect={onDateSelect}
      minDate={minDate}
      rentalType={rentalType}
      duration={duration}
      showRentalOptions={false}
    />
  );
}
