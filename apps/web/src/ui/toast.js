import toast from 'react-hot-toast';
export const toastUtils = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message, { duration: 5000 }),
    loading: (message) => toast.loading(message),
    promise: (promise, messages) => toast.promise(promise, messages),
};
