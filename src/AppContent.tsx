import { useState, useEffect, useRef } from 'react';
import { AppLayout } from './components/AppLayout';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { SettingsModal } from './components/SettingsModal';
import { useSettings } from './context/SettingsContext';
import { GeminiService } from './services/geminiService';
import type { Message } from './types';

function AppContent() {
  const settings = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your Media Concierge. I can help you search for and request Movies and TV Shows on your Overseerr server. What would you like to watch today?',
      timestamp: Date.now()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasConfig = settings.overseerrUrl && settings.overseerrApiKey && settings.geminiApiKey;

  // Open settings on first load if missing config
  useEffect(() => {
    if (!hasConfig) {
      setIsSettingsOpen(true);
    }
  }, [hasConfig]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!hasConfig) {
      setIsSettingsOpen(true);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const gemini = new GeminiService(settings);

      const newMessages = await gemini.sendMessage(
        messages.concat(userMsg),
        text,
        (usage) => {
            // Estimate tokens if usage is provided.
            // usageMetadata usually has promptTokenCount, candidatesTokenCount, totalTokenCount
            if (usage && usage.totalTokenCount) {
                settings.addTokenUsage(usage.totalTokenCount);
            }
        }
      );

      setMessages(prev => [...prev, ...newMessages]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Error:** I encountered a problem connecting to the services. Please check your Settings (API Keys/URL) and network connection.\n\nDetails: ${error.message}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout onOpenSettings={() => setIsSettingsOpen(true)}>
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="flex flex-col min-h-full">
            <div className="flex-1 pb-32">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent pt-10">
        <ChatInput onSend={handleSendMessage} disabled={isProcessing} />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        canClose={!!hasConfig}
      />
    </AppLayout>
  );
}

export default AppContent;
