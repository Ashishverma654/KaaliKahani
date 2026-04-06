// components/admin/Modal.js
import React from 'react';

export default function Modal({ isOpen, onClose, title, children, confirmText = "Confirm", onConfirm, type = "info", maxWidth = "max-w-md", fullPage = false }) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600",
    info: "bg-primary text-on-primary hover:brightness-110",
    warning: "bg-yellow-500 text-black hover:bg-yellow-600"
  };

  if (fullPage) {
     return (
       <div className="fixed inset-0 z-[200] bg-surface flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-hidden">
          <div className="px-12 py-8 border-b border-outline-variant bg-black/20 backdrop-blur-xl flex justify-between items-center shrink-0">
             <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">High-Authority Protocol</span>
                <h3 className="text-3xl font-gothic text-white tracking-widest leading-none">{title}</h3>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-full border border-white/10 hover:border-primary/40 flex items-center justify-center text-on-surface-variant hover:text-white transition-all bg-white/5">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[url('/assets/admin_bg.jpg')] bg-fixed bg-cover">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl -z-10"></div>
             <div className="max-w-[1400px] mx-auto p-12">
                {children}
             </div>
          </div>

          <div className="px-12 py-8 border-t border-outline-variant bg-black/40 backdrop-blur-xl flex justify-end items-center gap-6 shrink-0">
             <button 
               onClick={onClose}
               className="px-10 py-4 rounded-2xl border border-white/10 text-[11px] font-black uppercase tracking-[0.3em] text-on-surface-variant hover:bg-white/5 hover:text-white transition-all"
             >
               Abort Synchronization
             </button>
             <button 
               onClick={onConfirm}
               className={`px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all ${typeStyles[type]}`}
             >
               {confirmText}
             </button>
          </div>
       </div>
     );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      <div className={`relative bg-surface border border-outline-variant rounded-3xl w-full ${maxWidth} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
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
