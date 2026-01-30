
import React, { Component, ErrorInfo, ReactNode, useState } from "react";
import { Copy, Check, Send } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// --- FUNCTIONAL COMPONENT FOR UI (To use Hooks) ---
const ErrorView: React.FC<{ error: Error | null }> = ({ error }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!error) return;
        try {
            const text = `Error: ${error.toString()}\nStack: ${error.stack}`;
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleSendToTg = () => {
        if (!error) return;

        const greeting = "Приветствую! 👋\nОбнаружил ошибку на сайте EntheoBreath. Вот лог:";
        const errorDetails = `\n\nError: ${error.toString()}\n\nStack:\n${error.stack?.slice(0, 500) || 'N/A'}...`;
        const fullMessage = encodeURIComponent(greeting + errorDetails);

        // Open Telegram with pre-filled message
        window.open(`https://t.me/nikolaiovchinnikov?text=${fullMessage}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-rose-500/30">
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-rose-500/20 blur-[60px] rounded-full animate-pulse-slow"></div>
                <i className="fas fa-biohazard text-6xl text-rose-500 relative z-10 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"></i>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 tracking-tight">Сбой в Матрице</h1>

            <div className="max-w-md space-y-4 mb-8">
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                    Энергетический поток прерван программной аномалией.
                    <br className="hidden md:block" />
                    Дышите глубже, это всего лишь код.
                </p>
            </div>

            {/* ERROR CODE BLOCK - УЛУЧШЕН СКРОЛЛ */}
            <div className="bg-[#121212] rounded-xl border border-white/10 mb-6 max-w-2xl w-full overflow-hidden relative group">
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${copied
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-transparent'
                            }`}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Скопировано' : 'Копировать'}
                    </button>
                </div>
                <div className="p-4 pt-12 max-h-[350px] overflow-y-auto custom-scrollbar text-left">
                    <code className="text-xs md:text-sm text-rose-400 font-mono break-all whitespace-pre-wrap block font-bold opacity-90 leading-relaxed">
                        <span className="text-white/60">Error: </span>{error?.message || error?.toString()}
                        {error?.stack && (
                            <>
                                <br /><br />
                                <span className="text-white/40">Stack Trace:</span>
                                <br />
                                <span className="text-rose-300/80">{error.stack}</span>
                            </>
                        )}
                    </code>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col md:flex-row gap-3 w-full max-w-lg">
                <button
                    onClick={handleSendToTg}
                    className="flex-1 px-6 py-3.5 bg-[#229ED9]/10 border border-[#229ED9]/30 text-[#229ED9] font-bold rounded-xl hover:bg-[#229ED9]/20 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02]"
                >
                    <Send size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    <span>Отправить в Telegram</span>
                </button>

                <button
                    onClick={() => window.location.reload()}
                    className="flex-1 px-6 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    <i className="fas fa-redo mr-2"></i>
                    Перезагрузить
                </button>
            </div>
        </div>
    );
};

// --- CLASS COMPONENT (LOGIC) ---
class ErrorBoundary extends Component<Props, State> {
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
            return <ErrorView error={this.state.error} />;
        }

        return (this as any).props.children;
    }
}

export default ErrorBoundary;
