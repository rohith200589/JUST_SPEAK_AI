import React, { createContext, useContext, useCallback, useState } from 'react';

const ToasterContext = createContext(null);

let nextId = 1;

export function useToaster() {
  return useContext(ToasterContext);
}

export default function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((text, type = 'info', { duration = 4000, persistent = false } = {}) => {
    const id = nextId++;
    const toast = { id, text, type, persistent };
    setToasts((t) => [...t, toast]);

    if (!persistent) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const updateToast = useCallback((id, patch) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToasterContext.Provider value={{ showToast, updateToast, removeToast }}>
      {children}

      {/* Toast container - Compact & Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2 max-w-[300px] w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto p-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] border text-xs font-semibold break-words backdrop-blur-xl transition-all duration-500 animate-in slide-in-from-right-full ${t.type === 'success'
              ? 'bg-emerald-600/90 border-emerald-500/50 text-white'
              : t.type === 'error'
                ? 'bg-rose-600/90 border-rose-500/50 text-white'
                : 'bg-blue-700/90 border-blue-400/40 text-white'
              } ${t.persistent && t.text.includes('Waking Up') ? 'animate-toast-pulse' : ''}`}
          >
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                {t.type === 'info' && <span className="text-sm">⚡</span>}
                {t.type === 'success' && <span className="text-sm">✅</span>}
                {t.type === 'error' && <span className="text-lg">⚠️</span>}
                <span className="leading-tight whitespace-pre-line">{t.text}</span>
              </div>
              <button
                aria-label="Dismiss"
                className="opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/10 shrink-0"
                onClick={() => removeToast(t.id)}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}
