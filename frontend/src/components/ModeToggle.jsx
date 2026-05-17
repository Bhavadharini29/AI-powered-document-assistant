import React from 'react';
import { cn } from '../lib/utils';
import { BookOpen, Headphones } from 'lucide-react';

export function ModeToggle({ mode, setMode }) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="inline-flex items-center p-1 bg-muted rounded-full overflow-hidden">
        <button
          onClick={() => setMode('KNOWLEDGE')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
            mode === 'KNOWLEDGE' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>Smart Docs</span>
        </button>
        <button
          onClick={() => setMode('SUPPORT')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
            mode === 'SUPPORT' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Headphones className="w-4 h-4" />
          <span>Help Desk</span>
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {mode === 'KNOWLEDGE' ? 'Ask questions about your uploaded documents.' : 'Chat with our customer support assistant.'}
      </p>
    </div>
  );
}
