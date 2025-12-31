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

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-xs">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`p-3 rounded-md shadow-md text-sm font-medium break-words max-w-xs w-full ${
              t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-black'
            }`}
          >
            {t.text}
            {!t.persistent && (
              <button
                aria-label="Dismiss"
                className="ml-2 float-right opacity-80 hover:opacity-100"
                onClick={() => removeToast(t.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}
