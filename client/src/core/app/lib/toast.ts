import hotToast from "react-hot-toast";

export const toast = Object.assign(
  (message: string) => hotToast(message),
  {
    success: (message: string) => hotToast.success(message),
    error: (message: string) => hotToast.error(message),
    message: (message: string) => hotToast(message),
    dismiss: hotToast.dismiss,
  },
);
