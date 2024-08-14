import { AxiosError } from "axios";
import toast from "react-hot-toast";
import exportFromJSON, { ExportType } from "export-from-json";

export function getTimeOfDay(): number {
  const currentHour = new Date().getHours();

  if (currentHour >= 6 && currentHour < 12) {
    return 0; // Morning
  } else if (currentHour >= 12 && currentHour < 18) {
    return 1; // Afternoon
  } else {
    return 2; // Evening
  }
}

export const popToast = (message: string, type: number) => {
  const words = message.split(" ");
  const duration = Math.max(4, words.length * 1);

  toast(message, {
    duration: duration * 1000, // Convert to milliseconds
    position: "top-center",

    // Custom Icon
    icon: type === 0 ? "ℹ️" : type === 1 ? "✅" : type === 2 ? "❌" : undefined,

    // Aria
    ariaProps: {
      role: "status",
      "aria-live": "polite",
    },
  });
};

export const popErrorToast = (error: any) => {
  try {
    popToast(((error as AxiosError).response?.data as any).message, 2);
  } catch {
    popToast("An unexpected error occured!\nPlease try again later.", 2);
  }
};

export const exportData = (
  data: any,
  fileName: string,
  exportType: ExportType
) => {
  exportFromJSON({ data, fileName, exportType });
};
