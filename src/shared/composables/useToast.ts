import { toast, type ToastOptions } from "vue3-toastify";
import useStore from "@src/shared/store/store";

export type ToastType = "success" | "error" | "warning" | "info";

export interface UseToastOptions {
  autoClose?: number;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

export function useToast() {
  const store = useStore();

  const getToastPosition = (position?: UseToastOptions["position"]) => {
    const positionMap = {
      "top-left": toast.POSITION.TOP_LEFT,
      "top-center": toast.POSITION.TOP_CENTER,
      "top-right": toast.POSITION.TOP_RIGHT,
      "bottom-left": toast.POSITION.BOTTOM_LEFT,
      "bottom-center": toast.POSITION.BOTTOM_CENTER,
      "bottom-right": toast.POSITION.BOTTOM_RIGHT,
    };
    return positionMap[position || "bottom-right"];
  };

  const showToast = (
    message: string,
    type: ToastType = "info",
    options: UseToastOptions = {},
  ) => {
    const defaultOptions: ToastOptions = {
      autoClose: options.autoClose || 2000,
      type,
      position: getToastPosition(options.position),
      theme: store.settings.darkMode ? "dark" : "light",
    };

    toast(message, defaultOptions);
  };

  const toastSuccess = (message: string, options?: UseToastOptions) => {
    showToast(message, "success", options);
  };

  const toastError = (message: string, options?: UseToastOptions) => {
    showToast(message, "error", options);
  };

  const toastWarning = (message: string, options?: UseToastOptions) => {
    showToast(message, "warning", options);
  };

  const toastInfo = (message: string, options?: UseToastOptions) => {
    showToast(message, "info", options);
  };

  return {
    toast: showToast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
  };
}
