declare module 'react-toastify' {
  import { ReactNode } from 'react';

  export interface ToastOptions {
    position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
    autoClose?: number | false;
    hideProgressBar?: boolean;
    closeOnClick?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
    progress?: number;
    theme?: 'light' | 'dark' | 'colored';
  }

  export interface ToastContainerProps extends ToastOptions {
    newestOnTop?: boolean;
    closeButton?: boolean | ReactNode;
    transition?: any;
    rtl?: boolean;
    pauseOnFocusLoss?: boolean;
    enableMultiContainer?: boolean;
    limit?: number;
    containerId?: string | number;
  }

  export const ToastContainer: React.FC<ToastContainerProps>;

  export const toast: {
    (message: string, options?: ToastOptions): string | number;
    success(message: string, options?: ToastOptions): string | number;
    error(message: string, options?: ToastOptions): string | number;
    info(message: string, options?: ToastOptions): string | number;
    warning(message: string, options?: ToastOptions): string | number;
    dark(message: string, options?: ToastOptions): string | number;
    warn(message: string, options?: ToastOptions): string | number;
    clear(): void;
    dismiss(toastId?: string | number): void;
    isActive(toastId: string | number): boolean;
    update(toastId: string | number, options?: ToastOptions): void;
    done(toastId: string | number): void;
    onChange(callback: (toast: any) => void): void;
    configure(config: ToastOptions): void;
  };
} 