import React, { useState } from 'react';
import { summarizeNotes } from '../../services/aiService';
import { FileText, Loader2, AlertCircle, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AiNotesSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const res = await summarizeNotes(file);
      setSummary(res.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to summarize notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-white">Notes Summarizer</h3>
          <p className="text-xs text-slate-400">Upload PDF, DOCX, or Text to get a summary</p>
        </div>
      </div>

      {!summary ? (
        <div className="space-y-4">
          <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".pdf,.txt,.docx,.md" 
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
              <UploadCloud className={`w-8 h-8 ${file ? 'text-indigo-400' : 'text-slate-500'} group-hover:text-indigo-400 transition-colors`} />
              <div className="text-sm">
                {file ? (
                  <span className="font-medium text-white">{file.name}</span>
                ) : (
                  <span className="text-slate-400">Click or drag a file to upload</span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleSummarize}
            disabled={loading || !file}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            {loading ? 'Summarizing...' : 'Summarize Document'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
          <button
            onClick={() => { setSummary(''); setFile(null); }}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors text-sm font-medium"
          >
            Summarize Another Document
          </button>
        </div>
      )}
    </div>
  );
}
