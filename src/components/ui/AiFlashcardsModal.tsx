import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, X, Loader2, AlertCircle, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { getFlashcards, Flashcard } from '../../services/aiService';

interface AiFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
}

export default function AiFlashcardsModal({ isOpen, onClose, courseName }: AiFlashcardsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) {
      setCards([]);
      setTopic('');
      setNotes('');
      setError('');
      setIndex(0);
      setFlipped(false);
    }
  }, [isOpen]);

  const generate = () => {
    setLoading(true);
    setError('');
    setIndex(0);
    setFlipped(false);
    getFlashcards(topic, notes, courseName)
      .then((res) => setCards(res.flashcards))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

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
            className="w-full max-w-lg bg-white/[0.03] border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-2xl"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none bg-indigo-500" />

            <div className="flex items-start justify-between gap-4 relative z-10 mb-4">
              <div className="flex gap-3 items-center">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-none">AI Flashcards</h3>
                  <p className="text-sm text-slate-400 mt-1">{courseName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {cards.length === 0 && (
              <div className="relative z-10 space-y-3">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic (e.g. Database Normalization)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Paste notes here (optional)"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
                {error && (
                  <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
                <button
                  onClick={generate}
                  disabled={loading || !topic}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                  {loading ? 'Generating...' : 'Generate Flashcards'}
                </button>
              </div>
            )}

            {cards.length > 0 && (
              <div className="relative z-10 space-y-4">
                <div
                  onClick={() => setFlipped(!flipped)}
                  className="min-h-[180px] flex items-center justify-center text-center p-6 bg-white/[0.04] border border-white/10 rounded-2xl cursor-pointer select-none"
                >
                  <p className="text-slate-100 text-sm leading-relaxed">
                    {flipped ? cards[index].answer : cards[index].question}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}
                    disabled={index === 0}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-30 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{index + 1} / {cards.length}</span>
                    <button onClick={() => setFlipped(!flipped)} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                      <RotateCw className="w-3 h-3" /> Flip
                    </button>
                  </div>
                  <button
                    onClick={() => { setIndex((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}
                    disabled={index === cards.length - 1}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-30 rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setCards([])}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Start over
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
