import hotToast from "react-hot-toast";
import { playToastSound } from "./toast-sound";

export const toast = Object.assign(
  (message: string) => {
    playToastSound("info");
    return hotToast(message);
  },
  {
    success: (message: string) => {
      playToastSound("success");
      return hotToast.success(message);
    },
    successDetail: (title: string, description?: string) => {
      playToastSound("success");
      return hotToast.success(description ? `${title} - ${description}` : title, {
        duration: 3200,
      });
    },
    error: (message: string) => {
      playToastSound("error");
      return hotToast.error(message);
    },
    message: (message: string) => {
      playToastSound("info");
      return hotToast(message);
    },
    dismiss: hotToast.dismiss,
  },
);
