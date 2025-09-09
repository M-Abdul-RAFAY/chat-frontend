import { toast, ToastOptions } from "react-toastify";

// Check if toasters should be shown based on environment variable
const shouldShowToasters = () => {
  return process.env.NEXT_PUBLIC_SHOW_TOASTERS === "on";
};

// Custom toast functions that respect the environment variable
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    if (shouldShowToasters()) {
      toast.success(message, options);
    }
  },

  error: (message: string, options?: ToastOptions) => {
    if (shouldShowToasters()) {
      toast.error(message, options);
    }
  },

  info: (message: string, options?: ToastOptions) => {
    if (shouldShowToasters()) {
      toast.info(message, options);
    }
  },

  warning: (message: string, options?: ToastOptions) => {
    if (shouldShowToasters()) {
      toast.warning(message, options);
    }
  },

  default: (message: string, options?: ToastOptions) => {
    if (shouldShowToasters()) {
      toast(message, options);
    }
  },
};

// Export the original toast for direct access if needed
export { toast };
