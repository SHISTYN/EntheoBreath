import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="mb-8 relative">
             <div className="absolute inset-0 bg-rose-500/20 blur-[50px] rounded-full animate-pulse-slow"></div>
             <i className="fas fa-biohazard text-6xl text-rose-500 relative z-10"></i>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Сбой в Матрице</h1>
          <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
            Энергетический поток прерван. Произошла программная ошибка. 
            Дышите глубже, это всего лишь код.
          </p>

          <div className="bg-[#121212] p-4 rounded-xl border border-white/10 mb-8 max-w-lg w-full overflow-hidden">
             <code className="text-xs text-rose-400 font-mono break-all block">
                {this.state.error?.toString()}
             </code>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-glow-cyan"
          >
            <i className="fas fa-redo mr-2"></i>
            Перезагрузить Реальность
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;