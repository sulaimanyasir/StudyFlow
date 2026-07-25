import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, AlertCircle } from 'lucide-react';
import { getStudyPlan, StudyPlanInput, StudyPlanStep } from '../../services/aiService';

interface AiStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: StudyPlanInput | null;
}

export default function AiStudyPlanModal({ isOpen, onClose, task }: AiStudyPlanModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<StudyPlanStep[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen || !task) return;
    setLoading(true);
    setError('');
    setPlan([]);
    getStudyPlan(task)
      .then((res) => setPlan(res.plan))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen, task]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto overflow-x-hidden bg-white/[0.03] border border-white/10 p-6 rounded-3xl shadow-2xl relative backdrop-blur-2xl"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none bg-indigo-500" />

            <div className="flex items-start justify-between gap-4 relative z-10 mb-4">
              <div className="flex gap-3 items-center">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-none">AI Study Plan</h3>
                  <p className="text-sm text-slate-400 mt-1">{task?.title}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 space-y-3">
              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating your plan...
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {!loading && !error && plan.map((step, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-400">{step.day}</span>
                    <span className="text-xs text-slate-500">{step.hours}h</span>
                  </div>
                  <p className="text-sm text-slate-200">{step.task}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
