import React from 'react';
import { Settings as SettingsIcon, Film } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  onOpenSettings: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, onOpenSettings }) => {
  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100">
      <header className="flex-shrink-0 h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/80 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Film size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Media Concierge</h1>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
          title="Settings"
        >
          <SettingsIcon size={20} />
        </button>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
