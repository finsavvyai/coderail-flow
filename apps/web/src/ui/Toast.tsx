import { useState, useEffect } from 'react';
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

const icons = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  info: <Info size={16} />,
  warning: <AlertTriangle size={16} />,
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-base toast-${toast.type}`}>
          <span aria-hidden="true" className={`toast-icon toast-icon-${toast.type}`}>
            {icons[toast.type]}
          </span>
          <span className="toast-message" role="status">
            {toast.message}
          </span>
          <button
            onClick={() => {
              currentToasts = currentToasts.filter((t) => t.id !== toast.id);
              toastListeners.forEach((fn) => fn(currentToasts));
            }}
            aria-label="Dismiss notification"
            className="toast-dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
