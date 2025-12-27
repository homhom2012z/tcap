"use client";

import { useState, createContext, useContext, ReactNode, useRef } from "react";
import Toast, { ToastProps } from "@/components/ui/Toast";

interface ToastContextType {
  showToast: (message: string, type?: ToastProps["type"]) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastProps["type"] }>
  >([]);
  const toastCounter = useRef(0);

  const showToast = (message: string, type: ToastProps["type"] = "success") => {
    const id = `${Date.now()}-${toastCounter.current++}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-6 z-[200] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
