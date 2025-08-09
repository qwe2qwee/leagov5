// components/Toast/ToastContainer.tsx
import { ToastComponent } from "@/components/Toast/ToastComponent";
import { useToastStore } from "@/store/useToastStore";
import React from "react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          {...toast}
          visible={true}
          onHide={removeToast}
        />
      ))}
    </>
  );
};
