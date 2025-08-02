import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  dismissible?: boolean;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  const add = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 4000,
      dismissible: true,
      ...toast
    };
    
    update(toasts => [...toasts, newToast]);
    return id;
  };

  const remove = (id: string) => {
    update(toasts => toasts.filter(toast => toast.id !== id));
  };

  const clear = () => {
    update(() => []);
  };

  return {
    subscribe,
    add,
    remove,
    clear,
    // Convenience methods
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
      return add({ type: 'success', message, ...options });
    },
    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
      return add({ type: 'error', message, ...options });
    },
    warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
      return add({ type: 'warning', message, ...options });
    },
    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
      return add({ type: 'info', message, ...options });
    }
  };
}

export const toasts = createToastStore();