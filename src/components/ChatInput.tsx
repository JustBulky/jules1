import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-zinc-900 border-t border-zinc-800">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-zinc-800 rounded-xl p-2 border border-zinc-700 focus-within:border-blue-500 transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="What would you like to request?"
          className="w-full bg-transparent text-white placeholder-zinc-500 resize-none outline-none py-3 px-2 min-h-[50px] max-h-[200px]"
          rows={1}
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="p-3 mb-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-transparent disabled:text-zinc-500 transition-all"
        >
          {disabled ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>
      <div className="text-center mt-2 text-xs text-zinc-500">
        AI can make mistakes. Please verify titles.
      </div>
    </div>
  );
};
