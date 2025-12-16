import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Increased width to max-w-4xl and height management */}
      <div className="bg-[#1c1c1e] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col border border-white/10 relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#2c2c2e]/50 backdrop-blur-xl z-10">
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-purple-400 tracking-tight">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all transform hover:rotate-90"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        
        {/* Content Area */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0b]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                  <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fas fa-sparkles text-cyan-400 animate-pulse"></i>
                  </div>
              </div>
              <p className="text-gray-400 animate-pulse text-center font-mono text-sm tracking-wider">АНАЛИЗ ДАННЫХ...</p>
            </div>
          ) : (
             <div className="animate-fade-in pb-10">
                <ReactMarkdown
                    components={{
                        // Main Title (H1) - usually not used inside content but just in case
                        h1: ({node, ...props}) => <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-b border-white/10 pb-4" {...props} />,
                        
                        // Section Headers (H3 in your text)
                        h3: ({node, ...props}) => (
                            <div className="mt-10 mb-6 flex items-center gap-3">
                                <span className="h-px w-8 bg-cyan-500/50"></span>
                                <h3 className="text-xl md:text-2xl font-bold text-cyan-400 uppercase tracking-wide" {...props} />
                            </div>
                        ),
                        
                        // Bold text
                        strong: ({node, ...props}) => <span className="text-white font-extrabold text-shadow-sm" {...props} />,
                        
                        // Paragraphs
                        p: ({node, ...props}) => <p className="mb-5 text-gray-300 leading-relaxed text-lg font-light" {...props} />,
                        
                        // Lists
                        ul: ({node, ...props}) => <ul className="space-y-3 mb-6 pl-2" {...props} />,
                        li: ({node, ...props}) => (
                            <li className="flex items-start gap-3 text-gray-300 text-lg">
                                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
                                <span className="leading-relaxed">{props.children}</span>
                            </li>
                        ),
                        
                        // Links (Footer)
                        a: ({node, ...props}) => (
                            <a 
                                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-bold border-b border-purple-500/30 hover:border-purple-400 pb-0.5" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                {...props} 
                            />
                        ),

                        // Horizontal Rule
                        hr: ({node, ...props}) => <hr className="border-white/10 my-10" {...props} />,
                        
                        // Blockquotes (if any)
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-cyan-500/50 pl-4 py-2 my-6 bg-cyan-900/10 rounded-r-xl italic text-gray-400" {...props} />
                    }}
                >
                    {content}
                </ReactMarkdown>
             </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0b] text-center">
           <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
               PranaFlow • Wisdom & AI
           </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;