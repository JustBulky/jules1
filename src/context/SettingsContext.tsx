import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Settings } from '../types';

interface SettingsContextType extends Settings {
  setSettings: (settings: Settings) => void;
  totalTokenUsage: number;
  addTokenUsage: (tokens: number) => void;
  estimatedCost: number;
}

const defaultSettings: Settings = {
  overseerrUrl: 'http://72.61.4.197:5055',
  overseerrApiKey: '',
  geminiApiKey: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<Settings>(() => {
    const stored = localStorage.getItem('media_concierge_settings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const [totalTokenUsage, setTotalTokenUsage] = useState<number>(() => {
    const stored = localStorage.getItem('media_concierge_tokens');
    return stored ? parseInt(stored, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('media_concierge_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('media_concierge_tokens', totalTokenUsage.toString());
  }, [totalTokenUsage]);

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
  };

  const addTokenUsage = (tokens: number) => {
    setTotalTokenUsage((prev) => prev + tokens);
  };

  // Estimate cost: Gemini 1.5 Flash is approx $0.35 / 1M input, $1.05 / 1M output.
  // We'll average to $0.70 per million for a rough estimate if we don't distinguish in/out.
  // Or simpler: $0.0000007 per token.
  const estimatedCost = totalTokenUsage * 0.0000007;

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setSettings,
        totalTokenUsage,
        addTokenUsage,
        estimatedCost,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
