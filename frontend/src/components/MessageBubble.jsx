import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, User, Bot, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export function MessageBubble({ message }) {
  const { role, text, isError } = message;
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard', { id: 'copy-toast', position: 'bottom-right' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex w-full px-4 py-8 rounded-lg", isUser ? "bg-background" : "bg-muted/50")}>
      <div className="max-w-3xl border-0 mx-auto w-full flex gap-4 md:gap-6">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", isUser ? "bg-blue-600" : (isError ? "bg-destructive text-destructive-foreground" : "bg-green-600"))}>
            {isUser ? <User className="w-5 h-5" /> : (isError ? <AlertCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />)}
          </div>
        </div>
        
        <div className="flex-1 w-full min-w-0 prose prose-slate prose-p:leading-relaxed prose-pre:p-0 break-words">
          <div className="font-semibold mb-1 text-sm text-foreground/80 capitalize">
            {isUser ? 'You' : (isError ? 'System' : 'Assistant')}
          </div>
          
          <div className={cn("text-foreground", isError && "text-destructive font-medium")}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="relative rounded-md overflow-hidden my-4 group bg-[#1E1E1E]">
                      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-mono">
                        <span>{match[1]}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                            toast.success('Code copied!');
                          }}
                          className="hover:text-white transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="!m-0 text-sm"
                        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code {...props} className={cn("bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm", className)}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
          
          {!isUser && !isError && (
             <div className="flex mt-3 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
               <button 
                 onClick={handleCopy}
                 className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
               >
                 {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
