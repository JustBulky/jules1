import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';
import { Bot, User } from 'lucide-react';
import clsx from 'clsx';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';

  return (
    <div className={clsx(
      "flex w-full py-6 px-4 gap-4 max-w-4xl mx-auto",
      isBot ? "bg-transparent" : "bg-zinc-800/30"
    )}>
      <div className={clsx(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isBot ? "bg-blue-600/20 text-blue-400" : "bg-zinc-700 text-zinc-300"
      )}>
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
