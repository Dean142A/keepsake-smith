'use client';

import React, { useState, useCallback, createContext, useContext, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        if (next.length > 3) {
          const oldest = next[0];
          dismiss(oldest.id);
          return next.slice(1);
        }
        return next;
      });
      const timer = setTimeout(() => dismiss(id), 3500);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const icons = {
    success: <CheckCircle2 size={16} className="text-accent flex-shrink-0" />,
    error: <AlertCircle size={16} className="text-red-500 flex-shrink-0" />,
    info: <Info size={16} className="text-blue-500 flex-shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-800 rounded-xl shadow-lg min-w-[280px] max-w-[380px] transition-all duration-200 ${
              t.exiting ? 'opacity-0 translate-x-4' : 'animate-slide-up'
            }`}
          >
            {icons[t.type] || icons.success}
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex-1">
              {t.message}
            </span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 ml-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
