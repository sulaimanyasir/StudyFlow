import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Course } from '../../types';
import { quickAddParse, QuickAddResult } from '../../services/aiService';

interface AiQuickAddBarProps {
  courses: Course[];
  onParsed: (result: QuickAddResult) => void;
  placeholder?: string;
}

export default function AiQuickAddBar({ courses, onParsed, placeholder }: AiQuickAddBarProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    quickAddParse(text, courses)
      .then((result) => { onParsed(result); setText(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/40">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={placeholder || 'Type naturally, e.g. "DBMS assignment due next Friday, high priority"'}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {loading ? 'Parsing...' : 'AI Add'}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-rose-400 text-xs mt-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
