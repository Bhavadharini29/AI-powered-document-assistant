import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Settings2, Menu, X, Bot } from 'lucide-react';
import { cn } from './lib/utils';
import { ModeToggle } from './components/ModeToggle';
import { ChatWindow } from './components/ChatWindow';
import { Composer } from './components/Composer';
import { UploadPanel } from './components/UploadPanel';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [mode, setMode] = useState('KNOWLEDGE');
  const [messages, setMessages] = useState({ KNOWLEDGE: [], SUPPORT: [] });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);



  useEffect(() => {
    if (messages[mode].length === 0) {
      fetchHistory();
    }
  }, [mode]);

  const fetchHistory = async () => {
    try {
      setErrorState(null);
      const endpoint = mode === 'KNOWLEDGE' ? 'http://localhost:8080/chat/history' : 'http://localhost:8080/support/chat/history';
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      
      const formatted = [];
      data.reverse().forEach(msg => {
        formatted.push({ role: 'user', text: msg.question });
        formatted.push({ role: 'bot', text: msg.answer });
      });
      
      setMessages(prev => ({ ...prev, [mode]: formatted }));
    } catch (e) {
      console.error('Failed to fetch history', e);
      // Fallback: silent fail for history, allow user to chat
    }
  };

  const currentMessages = messages[mode];

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    setErrorState(null);
    const userMessage = { role: 'user', text: input };
    setMessages(prev => ({ ...prev, [mode]: [...prev[mode], userMessage] }));
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const endpoint = mode === 'KNOWLEDGE' ? 'http://localhost:8080/chat' : 'http://localhost:8080/support/chat';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentInput })
      });
      
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      
      if (data.answer) {
        setMessages(prev => ({ ...prev, [mode]: [...prev[mode], { role: 'bot', text: data.answer }] }));
      } else {
        setMessages(prev => ({ ...prev, [mode]: [...prev[mode], { role: 'bot', text: "Internal processing returned an empty format. Please try again.", isError: true }] }));
      }
    } catch (e) {
      console.error(e);
      setErrorState('Server unreachable. Quota exceeded or backend is down.');
      setInput(currentInput); // Put content back so user doesn't lose it
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    handleSend();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20 sm:p-4 lg:p-8 w-full">
      <div className="flex w-full h-screen sm:h-[calc(100vh-2rem)] lg:h-[calc(100vh-4rem)] max-w-6xl bg-background text-foreground overflow-hidden sm:rounded-2xl sm:border border-border sm:shadow-2xl relative">
        <Toaster position="top-right" />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar / Drawer */}
      <aside 
        className={cn(
          "w-80 border-r border-border bg-card shadow-sm fixed lg:relative z-40 h-full flex flex-col transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2 font-semibold">
            <Bot className="w-5 h-5 text-primary" />
            <span>AI Assistant</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              title="Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-muted rounded-md transition-colors lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <ModeToggle mode={mode} setMode={setMode} />
          
          <div className={cn("transition-all duration-300 origin-top", mode === 'KNOWLEDGE' ? "scale-y-100 opacity-100 block" : "scale-y-0 opacity-0 hidden")}>
            <UploadPanel />
          </div>

          <div className="mt-auto px-4 py-6 text-center border-t text-xs text-muted-foreground">
            Using RAG Architecture
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-background">
        <header className="h-16 border-b flex items-center justify-between px-4 lg:px-6 bg-card/50 backdrop-blur shrink-0 sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-muted rounded-md transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold">{mode === 'KNOWLEDGE' ? 'Smart Docs' : 'Help Desk'}</h1>
          </div>
        </header>

        <ChatWindow 
          messages={currentMessages} 
          loading={loading} 
          onRetry={handleRetry}
          errorState={errorState}
        />

        <div className="w-full bg-gradient-to-t from-background via-background/90 to-transparent pt-6 pb-4">
          <Composer 
            input={input} 
            setInput={setInput} 
            handleSend={handleSend} 
            loading={loading}
          />
        </div>
      </main>
      </div>
    </div>
  );
}

export default App;
