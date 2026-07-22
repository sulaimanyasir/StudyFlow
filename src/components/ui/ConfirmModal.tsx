import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = true
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white/[0.03] border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-2xl"
          >
            {/* Subtle glow effect based on destruction type */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${isDestructive ? 'bg-rose-500' : 'bg-indigo-500'}`} />
            
            <div className="flex gap-4 items-start relative z-10">
              <div className={`p-3 rounded-2xl shrink-0 ${isDestructive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <div className="flex-1 space-y-2 pt-1">
                <h3 className="text-lg font-bold text-white tracking-tight leading-none">{title}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 relative z-10">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className={`px-5 py-2 text-white rounded-xl text-sm font-medium shadow-md transition-all hover:scale-[1.02] active:scale-95 ${
                  isDestructive 
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/10' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
