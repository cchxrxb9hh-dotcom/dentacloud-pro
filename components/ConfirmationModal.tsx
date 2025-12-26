
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <AlertTriangle size={24} className="text-red-600" />,
      iconBg: 'bg-red-50',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-100',
    },
    warning: {
      icon: <AlertTriangle size={24} className="text-amber-600" />,
      iconBg: 'bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
    },
    info: {
      icon: <AlertTriangle size={24} className="text-blue-600" />,
      iconBg: 'bg-blue-50',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
    }
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white">
        <div className="p-8 pb-4 flex justify-end">
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-10 pb-10 text-center flex flex-col items-center">
          <div className={`w-16 h-16 ${style.iconBg} rounded-3xl flex items-center justify-center mb-6`}>
            {style.icon}
          </div>
          
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all order-2 sm:order-1"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-8 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl order-1 sm:order-2 ${style.button}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
