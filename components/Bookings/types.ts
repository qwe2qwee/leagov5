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

export interface Booking {
  id: string;
  status: BookingStatus;
  start_date: string;
  end_date: string;
  final_amount: number;
  car?: {
    model?: {
      brand?: {
        name_ar: string;
        name_en: string;
      };
      name_ar: string;
      name_en: string;
      default_image_url?: string;
    };
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

// Status config for booking list screen (compact labels)
export const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  pending: {
    label: { ar: "قيد المراجعة", en: "Pending" },
    variant: "warning",
    icon: "time-outline",
  },
  confirmed: {
    label: { ar: "مؤكد - ادفع", en: "Pay Now" },
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
    variant: "secondary",
    icon: "alert-circle-outline",
  },
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
