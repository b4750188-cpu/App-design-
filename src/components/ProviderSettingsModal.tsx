import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Key, AlertCircle, Database, CheckCircle2, DollarSign } from 'lucide-react';
import { ProviderConfig, ProviderUsage } from '../server/types.ts';

interface ProviderSettingsModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({ onClose, onRefresh }) => {
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [usages, setUsages] = useState<ProviderUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const [googleKey, setGoogleKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const loadProviders = async () => {
    try {
      const res = await fetch('/api/providers');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
        setUsages(data.usage || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleSaveGoogleKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleKey.trim()) return;

    try {
      const res = await fetch('/api/providers/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google_places', apiKey: googleKey.trim() }),
      });
      if (res.ok) {
        setSaveStatus('Google Places API key saved successfully.');
        setGoogleKey('');
        loadProviders();
        onRefresh();
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch {
      setSaveStatus('Failed to update Google Places API key.');
    }
  };

  const handleSaveYouTubeKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeKey.trim()) return;

    try {
      const res = await fetch('/api/providers/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'youtube', apiKey: youtubeKey.trim() }),
      });
      if (res.ok) {
        setSaveStatus('YouTube Data API key saved successfully.');
        setYoutubeKey('');
        loadProviders();
        onRefresh();
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch {
      setSaveStatus('Failed to update YouTube Data API key.');
    }
  };

  const gConfig = configs.find((c) => c.providerName === 'google_places');
  const yConfig = configs.find((c) => c.providerName === 'youtube');
  const cConfig = configs.find((c) => c.providerName === 'crawler');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Provider Integrations & Quota Control</h3>
              <p className="text-xs text-slate-400">
                Official Google Places API (New), YouTube API, and SSRF-Safe Crawler status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveStatus && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* 1. Google Places Provider */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-sm text-slate-200">Google Places API (New)</span>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${
                  gConfig?.status === 'ONLINE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {gConfig?.status || 'NOT_CONFIGURED'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Primary business discovery provider. Strictly uses official endpoints (Text Search, Nearby, Details)
              with explicit field masks and zero scraping.
            </p>

            {gConfig?.hasApiKey && (
              <div className="text-xs text-slate-300 font-mono">
                Active Key: <span className="text-emerald-400">{gConfig.apiKeyMasked}</span>
              </div>
            )}

            <form onSubmit={handleSaveGoogleKey} className="flex gap-2 pt-1">
              <input
                type="password"
                placeholder={gConfig?.hasApiKey ? 'Enter new key to update...' : 'Paste Google Places API Key'}
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!googleKey.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                Save Key
              </button>
            </form>
          </div>

          {/* 2. YouTube Data API */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-red-400" />
                <span className="font-bold text-sm text-slate-200">YouTube Data API v3 (Optional)</span>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${
                  yConfig?.status === 'ONLINE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {yConfig?.status || 'NOT_CONFIGURED'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Discovers official video channels and public statistics. When unconfigured, queries return "NOT
              CHECKED" and never invent fake channels.
            </p>

            {yConfig?.hasApiKey && (
              <div className="text-xs text-slate-300 font-mono">
                Active Key: <span className="text-emerald-400">{yConfig.apiKeyMasked}</span>
              </div>
            )}

            <form onSubmit={handleSaveYouTubeKey} className="flex gap-2 pt-1">
              <input
                type="password"
                placeholder={yConfig?.hasApiKey ? 'Enter new key to update...' : 'Paste YouTube Data API Key'}
                value={youtubeKey}
                onChange={(e) => setYoutubeKey(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!youtubeKey.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                Save Key
              </button>
            </form>
          </div>

          {/* 3. Cost Control & Quota Log */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-slate-200">Cost Control & Field Masks</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Explicit Masks Enabled</span>
            </div>

            <p className="text-xs text-slate-400">
              Requirement 40: Wildcard "*" requests are strictly forbidden. Every Google Places request transmits an
              explicit field mask to minimize Google Cloud processing costs.
            </p>

            {usages.length > 0 && (
              <div className="pt-2 border-t border-slate-900 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Active Request Logs:</div>
                {usages.map((u, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center justify-between font-mono py-1">
                    <span>{u.endpoint}</span>
                    <span className="text-indigo-400">{u.requestsCount} reqs</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
