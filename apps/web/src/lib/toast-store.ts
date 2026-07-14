export type ToastVariant = 'default' | 'destructive';

export interface ToastItem {
  id: string;
  title?: string;
  description: string;
  variant: ToastVariant;
}

type ToastInput = Omit<ToastItem, 'id'>;

const TOAST_DURATION = 5000;

let toasts: ToastItem[] = [];
let listeners: Array<(toasts: ToastItem[]) => void> = [];

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

export function subscribe(listener: (toasts: ToastItem[]) => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getToasts(): ToastItem[] {
  return toasts;
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(input: ToastInput): void {
  const id = crypto.randomUUID();
  toasts = [...toasts, { ...input, id }];
  emit();
  if (input.variant !== 'destructive') {
    setTimeout(() => dismissToast(id), TOAST_DURATION);
  }
}
