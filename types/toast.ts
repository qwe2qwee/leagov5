// types/toast.ts
export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastConfig {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  position?: "top" | "bottom";
  action?: {
    label: string;
    onPress: () => void;
  };
  persistent?: boolean; // لا يختفي تلقائياً
}
