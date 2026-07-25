import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Course, Assignment, Exam } from '../../types';
import { getWeeklyDigest } from '../../services/aiService';

interface AiWeeklyDigestProps {
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
}

export default function AiWeeklyDigest({ courses, assignments, exams }: AiWeeklyDigestProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [fetched, setFetched] = useState(false);

  const fetchDigest = () => {
    setLoading(true);
    setError('');
    getWeeklyDigest(courses, assignments, exams)
      .then((res) => { 
        setSummary(res.summary); 
        setFetched(true);
        sessionStorage.setItem('ai_weekly_digest', res.summary);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const cached = sessionStorage.getItem('ai_weekly_digest');
    if (cached) {
      setSummary(cached);
      setFetched(true);
    } else {
      fetchDigest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none bg-indigo-500" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">AI Weekly Digest</h3>
        </div>
        <button
          onClick={fetchDigest}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative z-10">
        {loading && !fetched && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Summarizing your week...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}
        {!error && summary && (
          <p className="text-sm text-slate-300 leading-relaxed font-light">{summary}</p>
        )}
      </div>
    </div>
  );
}
