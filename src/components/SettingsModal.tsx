import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { OverseerrService } from '../services/overseerr';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  canClose: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, canClose }) => {
  const settings = useSettings();
  const [formData, setFormData] = useState({
    overseerrUrl: settings.overseerrUrl,
    overseerrApiKey: settings.overseerrApiKey,
    geminiApiKey: settings.geminiApiKey,
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [debugUrl, setDebugUrl] = useState<string>('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    settings.setSettings(formData);
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('loading');
    const overseerr = new OverseerrService(formData.overseerrUrl, formData.overseerrApiKey);
    setDebugUrl(overseerr.getTestUrl());

    try {
      await overseerr.testConnection();
      setTestStatus('success');
    } catch (error) {
      setTestStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          {canClose && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
              aria-label="Close settings"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Overseerr Config */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Overseerr Configuration</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Overseerr URL</label>
              <input
                type="text"
                name="overseerrUrl"
                value={formData.overseerrUrl}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="http://localhost:5055"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Overseerr API Key</label>
              <input
                type="password"
                name="overseerrApiKey"
                value={formData.overseerrApiKey}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="YOUR_API_KEY"
              />
            </div>

            <div className="flex flex-col space-y-2">
                <button
                    onClick={handleTestConnection}
                    disabled={testStatus === 'loading' || !formData.overseerrUrl || !formData.overseerrApiKey}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors"
                >
                    {testStatus === 'loading' && <Loader2 className="animate-spin" size={18} />}
                    <span>Test Connection</span>
                </button>

                {/* Debug View */}
                {debugUrl && (
                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-xs font-mono text-zinc-400 break-all">
                        <span className="text-zinc-500 font-bold">DEBUG URL:</span> {debugUrl}
                    </div>
                )}

                {testStatus === 'success' && (
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                        <CheckCircle size={16} />
                        <span>Connection Successful</span>
                    </div>
                )}
                {testStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        <span>Connection Failed. Check URL and Key. Ensure CORS is handled if local.</span>
                    </div>
                )}
            </div>
          </div>

          <div className="h-px bg-zinc-700 my-4" />

          {/* Gemini Config */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-300">Gemini Configuration</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Gemini API Key</label>
              <input
                type="password"
                name="geminiApiKey"
                value={formData.geminiApiKey}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="YOUR_GEMINI_KEY"
              />
            </div>
          </div>

           <div className="h-px bg-zinc-700 my-4" />

           {/* Stats */}
           <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700">
               <h4 className="text-sm font-bold text-zinc-400 uppercase mb-2">Usage Statistics</h4>
               <div className="flex justify-between items-center text-sm">
                   <span className="text-zinc-300">Total Tokens Used:</span>
                   <span className="text-white font-mono">{settings.totalTokenUsage.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-sm mt-1">
                   <span className="text-zinc-300">Est. Cost:</span>
                   <span className="text-green-400 font-mono">${settings.estimatedCost.toFixed(4)}</span>
               </div>
           </div>
        </div>

        <div className="p-6 border-t border-zinc-700 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!formData.overseerrUrl || !formData.overseerrApiKey || !formData.geminiApiKey}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-6 rounded font-medium transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
