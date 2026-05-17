import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Bot, RefreshCcw } from 'lucide-react';
import { cn } from '../lib/utils';

export function ChatWindow({ messages, loading, onRetry, errorState }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, errorState]);

  return (
    <div className="flex-1 overflow-y-auto w-full flex flex-col pt-4">
      {messages.length === 0 && !loading && !errorState && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">How can I help you today?</h2>
          <p className="max-w-md text-sm">
            You can ask me questions about your uploaded documents or get customer support assistance.
          </p>
        </div>
      )}

      {messages.map((msg, idx) => (
        <MessageBubble key={idx} message={msg} />
      ))}

      {loading && (
        <div className="flex w-full px-4 py-8 bg-muted/50 animate-pulse">
          <div className="max-w-3xl mx-auto w-full flex gap-4 md:gap-6">
            <div className="w-8 h-8 rounded-full bg-green-600/50 flex flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
              <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      )}

      {errorState && (
        <div className="flex w-full px-4 py-8 bg-destructive/10">
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center justify-center text-center">
            <div className="bg-destructive/20 text-destructive p-4 rounded-lg flex flex-col items-center max-w-sm">
              <RefreshCcw className="w-8 h-8 mb-3" />
              <p className="font-semibold mb-2">Connection Error</p>
              <p className="text-sm opacity-90 mb-4">{errorState}</p>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-background hover:bg-muted text-foreground transition-colors rounded-md text-sm font-medium shadow-sm"
              >

                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={chatEndRef} className="h-4" />
    </div>
  );
}
