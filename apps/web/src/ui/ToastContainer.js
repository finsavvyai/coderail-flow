import { jsx as _jsx } from "react/jsx-runtime";
import { Toaster } from 'react-hot-toast';
export function ToastContainer() {
    return (_jsx(Toaster, { position: "top-right", toastOptions: {
            duration: 5000,
            className: 'toast-custom',
            success: {
                duration: 3000,
                iconTheme: {
                    primary: 'var(--success)',
                    secondary: 'var(--text)',
                },
            },
            error: {
                duration: 5000,
                iconTheme: {
                    primary: 'var(--error)',
                    secondary: 'var(--text)',
                },
            },
            loading: {
                iconTheme: {
                    primary: 'var(--accent)',
                    secondary: 'var(--text)',
                },
            },
        } }));
}
