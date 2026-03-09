import toast from 'react-hot-toast';

export const toastUtils = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message, { duration: 5000 }),
  loading: (message: string) => toast.loading(message),
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => toast.promise(promise, messages),
};
