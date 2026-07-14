'use client';

import { useEffect, useState } from 'react';
import { dismissToast, getToasts, subscribe, toast, type ToastItem } from '../lib/toast-store';

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(getToasts());

  useEffect(() => subscribe(setToasts), []);

  return { toasts, dismiss: dismissToast };
}

export { toast };
