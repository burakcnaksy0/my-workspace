import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const noop: ToastApi = {
  success: () => {},
  error: () => {},
  info: () => {},
};

const ToastContext = createContext<ToastApi>(noop);

/**
 * Toast sağlayıcısı olmadan da (ör. birim testlerde) patlamaması için
 * provider bulunmazsa sessiz no-op döner.
 */
export function useToast(): ToastApi {
  return useContext(ToastContext);
}

const TOAST_DURATION_MS = 5000;

const KIND_STYLES: Record<ToastKind, { box: string; icon: React.ReactNode }> = {
  success: {
    box: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  },
  error: {
    box: 'bg-red-950/90 border-red-500/40 text-red-200',
    icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
  },
  info: {
    box: 'bg-sky-950/90 border-sky-500/40 text-sky-200',
    icon: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
    timers.current.push(setTimeout(() => dismiss(id), TOAST_DURATION_MS));
  }, [dismiss]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const api: ToastApi = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Viewport: ekranın sağ altı, tıklamaları yutmaz */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none" aria-live="polite">
        {toasts.map((t) => {
          const style = KIND_STYLES[t.kind];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto max-w-sm flex items-start gap-2 px-3.5 py-2.5 rounded-xl border shadow-2xl backdrop-blur text-xs leading-relaxed animate-fade-in ${style.box}`}
            >
              {style.icon}
              <span className="flex-1 break-words">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="opacity-60 hover:opacity-100 shrink-0 mt-0.5"
                aria-label="Bildirimi kapat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
