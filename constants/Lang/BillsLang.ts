export const getTranslations = (language: "en" | "ar", page: string) => {
  const translations: any = {
    bookingPage: {
      en: {
        bookingDetails: "Booking Details",
        selectRentalPeriod: "Select Rental Period",
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
        startDate: "Start Date",
        endDate: "End Date",
        selectStartDate: "Select Start Date",
        selectEndDate: "Select End Date",
        totalDays: "Total Days",
        totalPrice: "Total Price",
        confirmBooking: "Confirm Booking",
        invalidBooking: "Invalid Booking",
        invalidBookingMessage: "Please select valid dates for booking.",
        bookingConfirmed: "Booking Confirmed",
        bookingSuccessMessage: "Your booking was successful. Total cost is $",
        errorTitle: "Error",
        errorMessage:
          "An error occurred while creating your booking. Please try again.",
      },
      ar: {
        bookingDetails: "تفاصيل الحجز",
        selectRentalPeriod: "اختار مدة الإيجار",
        daily: "يومي",
        weekly: "أسبوعي",
        monthly: "شهري",
        startDate: "تاريخ البداية",
        endDate: "تاريخ النهاية",
        selectStartDate: "حدد تاريخ البداية",
        selectEndDate: "حدد تاريخ النهاية",
        totalDays: "عدد الأيام الكلّي",
        totalPrice: "السعر الكلّي",
        confirmBooking: "أكد الحجز",
        invalidBooking: "الحجز مو صالح",
        invalidBookingMessage: "اختار تواريخ صحيحة عشان تقدر تحجز.",
        bookingConfirmed: "الحجز تأكد",
        bookingSuccessMessage: "حجزك تم بنجاح. التكلفة الكلّية هي $",
        errorTitle: "فيه مشكلة",
        errorMessage: "صار خطأ وإحنا نسوي الحجز. جرّب مرة ثانية.",
      },
    },
  };

  return translations[page]?.[language] || {};
};

export const bookingPage = {
  en: {
    bookingDetails: "Booking Details",
    selectRentalPeriod: "Select Rental Period",
    startDate: "Start Date",
    endDate: "End Date",
    selectStartDate: "Select Start Date",
    selectEndDate: "Select End Date",
    totalDays: "Total Days",
    totalPrice: "Total Price",
    confirmBooking: "Confirm Booking",
    invalidBooking: "Invalid booking",
    invalidBookingMessage: "Please select valid dates for your booking.",
    bookingConfirmed: "Booking confirmed",
    bookingSuccessMessage:
      "Your rental has been booked successfully! Total price: $",
  },
  ar: {
    bookingDetails: "تفاصيل الحجز",
    selectRentalPeriod: "اختار مدة الإيجار",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    selectStartDate: "اختر تاريخ البداية",
    selectEndDate: "اختر تاريخ النهاية",
    totalDays: "عدد الأيام الكلّي",
    totalPrice: "السعر الكلّي",
    confirmBooking: "أكد الحجز",
    invalidBooking: "الحجز مو صالح",
    invalidBookingMessage: "اختار تواريخ صحيحة عشان تقدر تحجز.",
    bookingConfirmed: "الحجز تأكد",
    bookingSuccessMessage: "تم الحجز بنجاح! السعر الكلّي: $",
  },
};
