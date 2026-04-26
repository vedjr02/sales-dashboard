'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function toastStyles(type: ToastType) {
  if (type === 'success') {
    return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100';
  }
  if (type === 'error') {
    return 'border-rose-400/40 bg-rose-500/10 text-rose-100';
  }
  return 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100';
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(92vw,420px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            data-testid="app-toast"
            className={`pointer-events-auto rounded-xl border px-3 py-2 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur ${toastStyles(toast.type)}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
