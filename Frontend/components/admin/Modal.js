// components/admin/Modal.js
import React from 'react';

export default function Modal({ isOpen, onClose, title, children, confirmText = "Confirm", onConfirm, type = "info" }) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600",
    info: "bg-primary text-on-primary hover:brightness-110",
    warning: "bg-yellow-500 text-black hover:bg-yellow-600"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      <div className="relative bg-surface border border-outline-variant rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-xl font-gothic text-on-surface tracking-wide">{title}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="px-8 py-8">
          {children}
        </div>
        <div className="px-8 py-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-outline-variant text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${typeStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
