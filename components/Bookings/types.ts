// types.ts
import type { BadgeVariant } from "@/components/ui/Badge2";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "payment_pending"
  | "active"
  | "completed"
  | "cancelled"
  | "expired";

export type RentalType = "daily" | "weekly" | "monthly" | "ownership";

// ✅ Booking interface كاملة
export interface Booking {
  id: string;
  customer_id: string;
  car_id: string;
  branch_id: string;
  rental_type: RentalType;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: BookingStatus;
  payment_reference?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  expires_at?: string; // ✅ مهم جداً للعداد
  created_at: string;
  updated_at: string;

  // Relations
  car?: {
    id: string;
    daily_price: number;
    weekly_price?: number;
    monthly_price?: number;
    seats: number;
    fuel_type: string;
    transmission: string;
    model?: {
      id: string;
      name_ar: string;
      name_en: string;
      year: number;
      default_image_url?: string;
      brand?: {
        id: string;
        name_ar: string;
        name_en: string;
        logo_url?: string;
      };
    };
    color?: {
      id: string;
      name_ar: string;
      name_en: string;
      hex_code?: string;
    };
  };

  branch?: {
    id: string;
    name_ar: string;
    name_en: string;
    location_ar?: string;
    location_en?: string;
    phone?: string;
    email?: string;
    working_hours?: string;
    latitude?: number;
    longitude?: number;
  };

  // Approver info (optional)
  approved_by_user?: {
    full_name: string;
    email: string;
  };
}

export interface TabItem {
  id: "all" | BookingStatus;
  label: string;
  count: number;
}

export interface StatusConfig {
  label: { ar: string; en: string };
  variant: BadgeVariant;
  icon: string;
}

// ✅ STATUS_CONFIG محدث - للقائمة (مختصر وواضح)
export const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  pending: {
    label: { ar: "في انتظار الموافقة", en: "Awaiting Approval" },
    variant: "warning",
    icon: "time-outline",
  },
  confirmed: {
    label: { ar: "جاهز للدفع", en: "Ready to Pay" },
    variant: "info",
    icon: "card-outline",
  },
  payment_pending: {
    label: { ar: "جاري الدفع", en: "Processing" },
    variant: "secondary",
    icon: "sync-outline",
  },
  active: {
    label: { ar: "نشط", en: "Active" },
    variant: "success",
    icon: "checkmark-circle-outline",
  },
  completed: {
    label: { ar: "مكتمل", en: "Completed" },
    variant: "outline",
    icon: "checkmark-done-outline",
  },
  cancelled: {
    label: { ar: "ملغي", en: "Cancelled" },
    variant: "destructive",
    icon: "close-circle-outline",
  },
  expired: {
    label: { ar: "منتهي", en: "Expired" },
    variant: "destructive",
    icon: "alert-circle-outline",
  },
};

// ✅ دوال مساعدة
export const getStatusDescription = (
  status: BookingStatus,
  language: "ar" | "en"
): string => {
  const descriptions: Record<BookingStatus, { ar: string; en: string }> = {
    pending: {
      ar: "حجزك قيد المراجعة من قبل الفرع. ستتلقى إشعاراً عند الموافقة",
      en: "Your booking is being reviewed. You'll be notified upon approval",
    },
    confirmed: {
      ar: "تمت الموافقة على حجزك. يرجى إتمام الدفع خلال 24 ساعة",
      en: "Your booking is approved. Please complete payment within 24 hours",
    },
    payment_pending: {
      ar: "جاري معالجة عملية الدفع. يرجى إتمام الخطوات المطلوبة",
      en: "Payment is being processed. Please complete the required steps",
    },
    active: {
      ar: "حجزك نشط حالياً. استمتع بتجربة التأجير",
      en: "Your booking is currently active. Enjoy your rental",
    },
    completed: {
      ar: "تم إكمال الحجز بنجاح. شكراً لاستخدامك خدماتنا",
      en: "Booking completed successfully. Thank you for using our service",
    },
    cancelled: {
      ar: "تم إلغاء هذا الحجز",
      en: "This booking has been cancelled",
    },
    expired: {
      ar: "انتهت صلاحية هذا الحجز لعدم إتمام الدفع في الوقت المحدد",
      en: "This booking expired due to payment not being completed in time",
    },
  };

  return descriptions[status][language];
};

export const canCancelBooking = (status: BookingStatus): boolean => {
  return ["pending", "confirmed", "payment_pending"].includes(status);
};

export const canPayBooking = (status: BookingStatus): boolean => {
  return status === "confirmed" || status === "payment_pending";
};

export const isActiveBooking = (status: BookingStatus): boolean => {
  return ["pending", "confirmed", "payment_pending", "active"].includes(status);
};

// Status config for booking details screen (detailed labels)
export const BOOKING_DETAILS_STATUS_CONFIG: Record<
  BookingStatus,
  Omit<StatusConfig, "icon">
> = {
  pending: {
    label: { ar: "في انتظار موافقة الفرع", en: "Awaiting Branch Approval" },
    variant: "warning",
  },
  confirmed: {
    label: { ar: "مؤكد - في انتظار الدفع", en: "Confirmed - Awaiting Payment" },
    variant: "info",
  },
  payment_pending: {
    label: { ar: "جاري معالجة الدفع", en: "Processing Payment" },
    variant: "secondary",
  },
  active: {
    label: { ar: "نشط - جاري التأجير", en: "Active - Ongoing Rental" },
    variant: "success",
  },
  completed: {
    label: { ar: "مكتمل", en: "Completed" },
    variant: "secondary",
  },
  cancelled: {
    label: { ar: "ملغي", en: "Cancelled" },
    variant: "destructive",
  },
  expired: {
    label: { ar: "منتهي الصلاحية", en: "Expired" },
    variant: "destructive",
  },
};
