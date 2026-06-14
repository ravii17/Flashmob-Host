'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (msg: string) => addToast(msg, 'success'),
      error: (msg: string) => addToast(msg, 'error'),
      info: (msg: string) => addToast(msg, 'info'),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-2xl shadow-xl border text-sm animate-slide-up transition-all bg-white ${
              t.type === 'success'
                ? 'border-emerald-100 text-emerald-800'
                : t.type === 'error'
                ? 'border-rose-100 text-rose-800'
                : 'border-blue-100 text-blue-800'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="mt-0.5 shrink-0">
                {t.type === 'success' && <CheckCircle size={18} className="text-emerald-500" />}
                {t.type === 'error' && <AlertCircle size={18} className="text-rose-500" />}
                {t.type === 'info' && <Info size={18} className="text-blue-500" />}
              </span>
              <span className="font-medium text-slate-700 leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
