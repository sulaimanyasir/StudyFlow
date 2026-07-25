import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Paperclip, FileText, X } from 'lucide-react';
import { sendStudyChat, uploadDocumentChat } from '../../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isError?: boolean;
}

interface AiChatInterfaceProps {
  mode: 'general' | 'document';
}

export default function AiChatInterface({ mode }: AiChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentContext, setDocumentContext] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (mode === 'document' && !selectedFile && !documentContext) return;
    
    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (mode === 'general') {
        const res = await sendStudyChat(userMessage.text);
        setMessages(prev => [...prev, { id: Date.now().toString(), text: res.reply, sender: 'ai' }]);
      } else {
        const res = await uploadDocumentChat(userMessage.text, selectedFile as File, documentContext);
        setMessages(prev => [...prev, { id: Date.now().toString(), text: res.reply, sender: 'ai' }]);
        if (res.documentContext) setDocumentContext(res.documentContext);
        setSelectedFile(null); // Keep context in memory, user doesn't need to re-upload for subsequent queries
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: err.message || 'Failed to send message', sender: 'ai', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setDocumentContext(''); // reset context when new file is uploaded
      setMessages([{ id: 'system', text: `Document "${e.target.files[0].name}" attached. Ask me anything about it!`, sender: 'ai' }]);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-lg relative">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          {mode === 'general' ? 'AI Study Chat' : 'Document Chat (RAG)'}
        </h3>
        {mode === 'document' && (
          <div className="flex items-center gap-2">
            <input type="file" id="doc-upload" className="hidden" accept=".pdf,.txt,.docx,.md" onChange={handleFileChange} />
            <label htmlFor="doc-upload" className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium border border-indigo-500/20 transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
              Upload Document
            </label>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && mode === 'general' && (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
            Start a conversation with your AI study tutor...
          </div>
        )}
        {messages.length === 0 && mode === 'document' && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
            <FileText className="w-8 h-8 opacity-50" />
            <p>Upload a document to start chatting with it.</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/10 text-slate-200'} ${msg.isError ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : ''}`}>
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                {msg.sender === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-white/[0.01]">
        {selectedFile && mode === 'document' && (
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-400 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10">
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="hover:text-white p-0.5"><X className="w-3 h-3" /></button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={mode === 'document' && !selectedFile && !documentContext ? 'Upload a document first...' : 'Type a message...'}
            disabled={loading || (mode === 'document' && !selectedFile && !documentContext)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || (mode === 'document' && !selectedFile && !documentContext)}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-slate-500 text-white rounded-xl transition-colors shrink-0 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
