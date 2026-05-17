import React from 'react';
import { X, Settings2, Shield, Database } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:justify-center items-center backdrop-blur-sm bg-background/80 lg:bg-background/20 lg:p-4">
      <div 
        className={cn(
          "bg-card w-full max-w-lg lg:rounded-xl shadow-lg border border-border animate-in slide-in-from-bottom lg:slide-in-from-bottom-8 duration-300",
          "lg:h-auto h-[90vh] rounded-t-2xl flex flex-col"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Database className="w-4 h-4" /> Endpoints
            </h3>
            
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Knowledge Base API URL</label>
                <input 
                  type="text" 
                  defaultValue="http://localhost:8080/chat" 
                  disabled
                  className="px-3 py-2 bg-muted/50 border rounded-md text-sm cursor-not-allowed opacity-70"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Support Agent API URL</label>
                <input 
                  type="text" 
                  defaultValue="http://localhost:8080/support/chat" 
                  disabled
                  className="px-3 py-2 bg-muted/50 border rounded-md text-sm cursor-not-allowed opacity-70"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" /> Privacy & Guidelines
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Interactions are logged for diagnostic purposes only. 
              The knowledge assistant uses standard RAG vector DB (e.g. pgvector) architecture based on your uploaded PDFs. 
              Do not provide sensitive PII in chat.
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t bg-muted/20 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-md shadow-sm hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
