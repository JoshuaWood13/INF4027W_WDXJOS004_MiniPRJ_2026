import { toast } from "sonner";

/** Shows a success toast at the bottom-center of the screen for 2 seconds */
export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 2000,
    position: "bottom-center",
  });
}
