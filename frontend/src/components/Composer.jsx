import React, { useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export function Composer({ input, setInput, handleSend, loading }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative max-w-3xl w-full mx-auto p-4 bg-background">
      <div className="relative flex items-end w-full group overflow-hidden rounded-2xl border bg-card transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message Assistant..."
          disabled={loading}
          rows={1}
          className="max-h-[200px] min-h-[56px] w-full resize-none bg-transparent px-4 py-[1.1rem] text-sm focus:outline-none disabled:opacity-50 scrollbar-hide text-foreground placeholder:text-muted-foreground"
        />
        <div className="absolute right-3 bottom-0 h-[56px] flex items-center bg-transparent">
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={cn(
              "flex items-center justify-center p-2 rounded-lg transition-all duration-200",
              input.trim() && !loading
                ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
            )}
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs text-muted-foreground">
          Assistant can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
