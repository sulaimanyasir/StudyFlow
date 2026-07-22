import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here if needed
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090e1a] flex flex-col items-center justify-center p-4 text-slate-200 font-sans">
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl max-w-md w-full text-center space-y-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-rose-500 pointer-events-none" />

            <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-rose-500/20 relative z-10">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2 relative z-10">
              <h1 className="text-2xl font-bold text-white tracking-tight">Oops! Something went wrong.</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                We've encountered an unexpected issue. Your data is safely stored on your device, but we need to reload the application to continue.
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95 mt-4"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
