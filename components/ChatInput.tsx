import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
      // Reset height immediately
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 p-4 pb-6 lg:pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div className="max-w-3xl mx-auto relative flex items-end gap-2">
        <div className="relative flex-grow bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200 shadow-inner">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="w-full max-h-[120px] py-3.5 px-4 bg-transparent border-none focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400 text-base leading-relaxed disabled:opacity-50 outline-none rounded-2xl"
            rows={1}
            style={{ minHeight: '52px' }}
          />
        </div>
        <button
          onClick={() => handleSubmit()}
          disabled={!text.trim() || isLoading}
          className={`
            flex-shrink-0 w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-200
            ${!text.trim() || isLoading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95'}
          `}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <SendHorizontal size={24} className={text.trim() ? "ml-1" : ""} />
          )}
        </button>
      </div>
      <div className="text-center mt-2">
         <p className="text-[10px] text-slate-400">
           Gemini can make mistakes. Please verify important information.
         </p>
      </div>
    </div>
  );
};
