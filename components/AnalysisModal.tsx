import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Timer to show real waiting time instead of fake progress
  useEffect(() => {
    let interval: any;
    if (isOpen && isLoading) {
      setSecondsElapsed(0);
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } 
    return () => clearInterval(interval);
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Increased width to max-w-4xl and height management */}
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col border border-gray-200 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-[#2c2c2e]/50 backdrop-blur-xl z-10">
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-gray-800 to-purple-600 dark:from-cyan-400 dark:via-white dark:to-purple-400 tracking-tight">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all transform hover:rotate-90"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        
        {/* Content Area */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-white dark:bg-gradient-to-b dark:from-[#1c1c1e] dark:to-[#0a0a0b]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-8 h-full">
              
              {/* Spinner & Icon */}
              <div className="relative">
                  <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fas fa-brain text-cyan-400 text-3xl animate-pulse"></i>
                  </div>
              </div>

              {/* REAL TIMER */}
              <div className="flex flex-col items-center gap-1">
                  <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Прошло времени
                  </div>
                  <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                      00:{secondsElapsed.toString().padStart(2, '0')}
                  </div>
              </div>

              <div className="text-center space-y-2 max-w-sm mx-auto">
                  <p className="text-gray-900 dark:text-white font-bold text-lg">Анализируем технику...</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                      Ожидание: <span className="text-cyan-600 dark:text-cyan-400 font-bold">1-2 минуты</span>.
                      <br/>
                      Пожалуйста, не закрывайте это окно, пока ИИ изучает научные данные.
                  </p>
              </div>
            </div>
          ) : (
             <div className="animate-fade-in pb-10">
                <ReactMarkdown
                    components={{
                        // Main Title (H1) - usually not used inside content but just in case
                        h1: ({node, ...props}) => <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-white/10 pb-4" {...props} />,
                        
                        // Section Headers (H3 in your text)
                        h3: ({node, ...props}) => (
                            <div className="mt-10 mb-6 flex items-center gap-3">
                                <span className="h-px w-8 bg-cyan-500/50"></span>
                                <h3 className="text-xl md:text-2xl font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide" {...props} />
                            </div>
                        ),
                        
                        // Bold text
                        strong: ({node, ...props}) => <span className="text-gray-900 dark:text-white font-extrabold text-shadow-sm" {...props} />,
                        
                        // Paragraphs
                        p: ({node, ...props}) => <p className="mb-5 text-gray-700 dark:text-gray-300 leading-relaxed text-lg font-light" {...props} />,
                        
                        // Lists
                        ul: ({node, ...props}) => <ul className="space-y-3 mb-6 pl-2" {...props} />,
                        li: ({node, ...props}) => (
                            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300 text-lg">
                                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
                                <span className="leading-relaxed">{props.children}</span>
                            </li>
                        ),
                        
                        // Links (Footer)
                        a: ({node, ...props}) => (
                            <a 
                                className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors font-bold border-b border-purple-500/30 hover:border-purple-400 pb-0.5" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                {...props} 
                            />
                        ),

                        // Horizontal Rule
                        hr: ({node, ...props}) => <hr className="border-gray-200 dark:border-white/10 my-10" {...props} />,
                        
                        // Blockquotes (if any)
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-cyan-500/50 pl-4 py-2 my-6 bg-cyan-50 dark:bg-cyan-900/10 rounded-r-xl italic text-gray-600 dark:text-gray-400" {...props} />
                    }}
                >
                    {content}
                </ReactMarkdown>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;