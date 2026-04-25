'use client';

import { useEffect, useState } from 'react';

type ToastState = {
  message: string;
  type: 'info' | 'success';
  visible: boolean;
};

const initialToast: ToastState = { message: '', type: 'info', visible: false };

export function ToastHost() {
  const [toast, setToast] = useState<ToastState>(initialToast);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type?: 'info' | 'success' }>;
      const payload = customEvent.detail;
      setToast({ message: payload.message, type: payload.type || 'info', visible: true });
      window.clearTimeout((window as Window & { __toastTimer?: number }).__toastTimer);
      (window as Window & { __toastTimer?: number }).__toastTimer = window.setTimeout(() => {
        setToast((current) => ({ ...current, visible: false }));
      }, 3500);
    };

    window.addEventListener('umurava:toast', handler);
    return () => window.removeEventListener('umurava:toast', handler);
  }, []);

  return <div className={`toast ${toast.type} ${toast.visible ? 'show' : ''}`}>{toast.message}</div>;
}
