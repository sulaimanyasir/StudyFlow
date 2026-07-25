import React, { useState } from 'react';
import { generateQuiz, QuizResult } from '../../services/aiService';
import { BrainCircuit, Loader2, AlertCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function AiQuizGenerator() {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() && !file) return;
    setLoading(true);
    setError('');
    try {
      const res = await generateQuiz(topic, file || undefined, numQuestions);
      setQuiz(res);
      setCurrentQ(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setScore(0);
      setFinished(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showExplanation) return; // already answered
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === quiz!.questions[currentQ].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < quiz!.questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  if (finished && quiz) {
    return (
      <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">Quiz Completed!</h3>
        <p className="text-slate-400">You scored {score} out of {quiz.questions.length}</p>
        <div className="text-4xl font-black text-indigo-400 my-4">
          {Math.round((score / quiz.questions.length) * 100)}%
        </div>
        <button onClick={() => setQuiz(null)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
          Create Another Quiz
        </button>
      </div>
    );
  }

  if (quiz) {
    const q = quiz.questions[currentQ];
    return (
      <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white truncate max-w-[70%]">{quiz.title}</h3>
          <span className="text-xs font-mono bg-white/10 px-3 py-1 rounded-full text-slate-300">Question {currentQ + 1}/{quiz.questions.length}</span>
        </div>
        
        <p className="text-lg text-slate-200">{q.question}</p>
        
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let stateClass = "bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer";
            if (showExplanation) {
              if (i === q.correctAnswerIndex) {
                stateClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 cursor-default";
              } else if (i === selectedOption) {
                stateClass = "bg-rose-500/20 border-rose-500/50 text-rose-100 cursor-default";
              } else {
                stateClass = "bg-white/5 border-white/10 opacity-50 cursor-default";
              }
            } else if (selectedOption === i) {
              stateClass = "bg-indigo-500/20 border-indigo-500/50 text-indigo-100";
            }

            return (
              <div 
                key={i} 
                onClick={() => handleAnswer(i)}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${stateClass}`}
              >
                <span>{opt}</span>
                {showExplanation && i === q.correctAnswerIndex && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {showExplanation && i === selectedOption && i !== q.correctAnswerIndex && <XCircle className="w-5 h-5 text-rose-400" />}
              </div>
            )
          })}
        </div>

        {showExplanation && (
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <h4 className="text-sm font-bold text-indigo-300 mb-1">Explanation</h4>
            <p className="text-sm text-indigo-100">{q.explanation}</p>
          </div>
        )}

        {showExplanation && (
          <div className="flex justify-end">
            <button onClick={handleNext} className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors">
              {currentQ < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-white">Quiz Generator</h3>
          <p className="text-xs text-slate-400">Test your knowledge on any topic or document</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Topic (Optional if file provided)</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. World War II, Photosynthesis"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Study Material (Optional)</label>
          <div className="flex items-center gap-3">
            <input type="file" id="quiz-upload" className="hidden" accept=".pdf,.txt,.docx,.md" onChange={e => setFile(e.target.files?.[0] || null)} />
            <label htmlFor="quiz-upload" className="cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 flex items-center gap-2 transition-colors">
              <FileText className="w-4 h-4" />
              {file ? 'Change File' : 'Upload Notes'}
            </label>
            {file && <span className="text-xs text-slate-400 truncate max-w-[200px]">{file.name}</span>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Number of Questions: {numQuestions}</label>
          <input
            type="range"
            min="3" max="15"
            value={numQuestions}
            onChange={e => setNumQuestions(parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || (!topic.trim() && !file)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>
    </div>
  );
}
