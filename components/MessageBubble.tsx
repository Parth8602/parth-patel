import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';
import { Bot, User, AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
          ${isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}
        `}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`
          flex flex-col relative
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div className={`
            px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed break-words w-full
            ${isUser 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : message.error 
                ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-sm'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}
          `}>
            {message.error ? (
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{message.text}</span>
              </div>
            ) : (
              <div className={`markdown-body ${isUser ? 'text-white' : 'text-slate-800'}`}>
                 <ReactMarkdown
                  components={{
                    // Style code blocks specifically
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !String(children).includes('\n');
                      return isInline ? (
                        <code className={`${isUser ? 'bg-blue-700' : 'bg-slate-100'} px-1.5 py-0.5 rounded font-mono text-[0.9em]`} {...props}>
                          {children}
                        </code>
                      ) : (
                        <div className="my-3 rounded-lg overflow-hidden bg-slate-900 text-slate-50 text-xs md:text-sm p-3 font-mono">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </div>
                      );
                    },
                    // Style links
                    a({ href, children }) {
                      return (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`underline underline-offset-2 ${isUser ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                          {children}
                        </a>
                      );
                    },
                    // Paragraphs
                    p({ children }) {
                      return <p className="mb-2 last:mb-0">{children}</p>;
                    },
                    // Lists
                    ul({ children }) {
                      return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>;
                    }
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
