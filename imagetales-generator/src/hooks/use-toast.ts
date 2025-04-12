
import { toast as sonnerToast, type ToastT } from "sonner";

// Define the type for our toast function parameters
type ToastProps = {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  duration?: number;
};

// Create our toast function wrapper
function toast({
  title = "",
  description,
  action,
  position = 'bottom-right',
  duration = 5000,
}: ToastProps) {
  return sonnerToast(title, {
    description,
    action,
    position,
    duration,
  });
}

// Create a custom hook that wraps sonner's functionality
export function useToast() {
  return {
    toast,
    // Add a dummy toasts array to satisfy the interface
    toasts: [],
  };
}

// Export the toast function
export { toast };
