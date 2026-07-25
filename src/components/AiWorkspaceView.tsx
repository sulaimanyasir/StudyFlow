import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, FileText, BrainCircuit, Sparkles, MessageSquare } from 'lucide-react';
import AiChatInterface from './ui/AiChatInterface';
import AiQuizGenerator from './ui/AiQuizGenerator';
import AiNotesSummarizer from './ui/AiNotesSummarizer';

type AiTool = 'study-chat' | 'document-chat' | 'quiz' | 'summarizer';

export default function AiWorkspaceView() {
  const [activeTool, setActiveTool] = useState<AiTool>('study-chat');

  const tools = [
    { id: 'study-chat', label: 'Study Chat', icon: MessageSquare, description: 'Ask questions and get help on any subject.' },
    { id: 'document-chat', label: 'Document Chat', icon: FileText, description: 'Upload a document and chat directly with it.' },
    { id: 'quiz', label: 'Quiz Generator', icon: BrainCircuit, description: 'Test yourself based on topics or uploaded notes.' },
    { id: 'summarizer', label: 'Notes Summarizer', icon: Sparkles, description: 'Get structured summaries from your study materials.' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 relative z-10">
          <Bot className="w-8 h-8 text-indigo-400" />
          AI Workspace
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl relative z-10">
          Your intelligent study companion. Generate quizzes, summarize long documents, or chat directly with your course materials to master your subjects faster.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Sidebar Tools Menu */}
        <div className="lg:col-span-3 space-y-2">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as AiTool)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${
                  isActive 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`} />
                  <span className="font-bold">{tool.label}</span>
                </div>
                <p className={`text-xs ${isActive ? 'text-indigo-200/70' : 'text-slate-500'}`}>
                  {tool.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Tool Area */}
        <div className="lg:col-span-9">
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTool === 'study-chat' && <AiChatInterface mode="general" />}
            {activeTool === 'document-chat' && <AiChatInterface mode="document" />}
            {activeTool === 'quiz' && <AiQuizGenerator />}
            {activeTool === 'summarizer' && <AiNotesSummarizer />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
