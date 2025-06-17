import React from 'react';
import { useToast } from '../../hooks/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg max-w-sm ${
            toast.variant === 'destructive'
              ? 'bg-red-600 text-white'
              : toast.variant === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-900 border'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{toast.title}</div>
              {toast.description && (
                <div className="text-sm opacity-90">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-2 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}