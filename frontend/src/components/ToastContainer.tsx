import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage, ToastType } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} style={{ color: '#7cc47c' }} />,
  error: <XCircle size={18} style={{ color: '#e87c7c' }} />,
  info: <Info size={18} style={{ color: '#9b8ec4' }} />,
  warning: <AlertTriangle size={18} style={{ color: '#e8c47c' }} />,
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast"
          style={{
            borderLeft: `4px solid ${
              toast.type === 'success' ? '#7cc47c' :
              toast.type === 'error' ? '#e87c7c' :
              toast.type === 'warning' ? '#e8c47c' :
              'var(--lavender)'
            }`,
          }}
        >
          {icons[toast.type]}
          <span style={{ fontSize: '0.875rem', flex: 1, color: 'var(--brown)', fontWeight: 500 }}>
            {toast.message}
          </span>
          <button
            onClick={() => onRemove(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--warm-gray)' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
