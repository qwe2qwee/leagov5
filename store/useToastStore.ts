// ToastManager.ts
import { ToastConfig } from "@/types/toast";
import { create } from "zustand";

interface ToastState {
  toasts: ToastConfig[];
  addToast: (config: Omit<ToastConfig, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  updateToast: (id: string, updates: Partial<ToastConfig>) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (config) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastConfig = { ...config, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((toast) =>
        toast.id === id ? { ...toast, ...updates } : toast
      ),
    }));
  },
}));

// Hook للاستخدام السهل
export const useToast = () => {
  const { addToast, removeToast, clearAll } = useToastStore();

  const showSuccess = (message: string, options?: Partial<ToastConfig>) =>
    addToast({ message, type: "success", ...options });

  const showError = (message: string, options?: Partial<ToastConfig>) =>
    addToast({ message, type: "error", ...options });

  const showInfo = (message: string, options?: Partial<ToastConfig>) =>
    addToast({ message, type: "info", ...options });

  const showWarning = (message: string, options?: Partial<ToastConfig>) =>
    addToast({ message, type: "warning", ...options });

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    addToast,
    removeToast,
    clearAll,
  };
};
