import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let toastId = 0;
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let currentToasts: Toast[] = [];

export function showToast(message: string, type: Toast['type'] = 'info') {
  const toast: Toast = { id: ++toastId, message, type };
  currentToasts = [...currentToasts, toast];
  toastListeners.forEach((fn) => fn(currentToasts));

  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== toast.id);
    toastListeners.forEach((fn) => fn(currentToasts));
  }, 4000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  const colors = {
    success: { bg: '#22c55e', icon: <CheckCircle size={16} /> },
    error: { bg: '#ef4444', icon: <XCircle size={16} /> },
    info: { bg: '#3b82f6', icon: <Info size={16} /> },
    warning: { bg: '#f59e0b', icon: <AlertTriangle size={16} /> },
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1100,
      }}
    >
      {toasts.map((toast) => {
        const color = colors[toast.type];
        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              background: '#1a1a1a',
              borderRadius: 8,
              borderLeft: `4px solid ${color.bg}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              animation: 'slideIn 0.3s ease',
              minWidth: 250,
            }}
          >
            <span aria-hidden="true" style={{ color: color.bg, display: 'flex', alignItems: 'center' }}>{color.icon}</span>
            <span style={{ flex: 1, fontSize: 13 }} role="status">{toast.message}</span>
            <button
              onClick={() => {
                currentToasts = currentToasts.filter((t) => t.id !== toast.id);
                toastListeners.forEach((fn) => fn(currentToasts));
              }}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                color: '#ccc',
                cursor: 'pointer',
                padding: 14,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
