import { useCallback, useState } from "react";

let idCounter = 0;

export default function useToasts() {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => dismissToast(id), 3200);
    },
    [dismissToast]
  );

  return { toasts, pushToast, dismissToast };
}
