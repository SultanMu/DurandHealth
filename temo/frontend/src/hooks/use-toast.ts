import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface Toast extends ToastProps {
  id: string;
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    const id = (++toastCount).toString();
    const newToast: Toast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    
    return { id };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    setToasts(prev => toastId ? prev.filter(t => t.id !== toastId) : []);
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}