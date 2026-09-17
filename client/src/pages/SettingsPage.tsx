import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Sliders,
  Bell,
  Database,
  Radio,
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshInterval, setRefreshInterval] = useState('10');
  const [notifyMilestones, setNotifyMilestones] = useState(true);
  const [notifyNegativeSentiment, setNotifyNegativeSentiment] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-sky-600" />
          Dashboard Configuration & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adjust real-time polling cadences, alert thresholds, and system preferences
        </p>
      </div>

      {saved && (
        <div className="p-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Real-time sync settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Radio className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Synchronization & Polling
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                WebSocket Live Stream Heartbeat
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="5">Every 5 seconds (Real-Time Ultra)</option>
                <option value="10">Every 10 seconds (Standard Balanced)</option>
                <option value="30">Every 30 seconds (Low Bandwidth)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Default Historical Chart Window
              </label>
              <select
                defaultValue="30"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days (Recommended)</option>
                <option value="90">Last 90 Days (Quarterly View)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications & Alert Thresholds */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Notification Triggers & Toasts
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Audience Growth Milestones
                </div>
                <div className="text-slate-400 text-[11px]">
                  Send instant notification when any connected channel hits 1,000+ incremental followers
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyMilestones}
                onChange={(e) => setNotifyMilestones(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Negative Sentiment Spike Alerts
                </div>
                <div className="text-slate-400 text-[11px]">
                  Alert when negative customer comments exceed 15% threshold within a 1-hour window
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyNegativeSentiment}
                onChange={(e) => setNotifyNegativeSentiment(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </label>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Cpu className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              System Architecture & Health
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">API Backend</div>
              <div className="font-bold text-slate-900 dark:text-white mt-1">Node.js + Express</div>
              <div className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold mt-0.5">● Healthy (port 5000)</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">WebSocket Hub</div>
              <div className="font-bold text-slate-900 dark:text-white mt-1">ws:// Engine</div>
              <div className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold mt-0.5">● Active Broadcast</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Database Store</div>
              <div className="font-bold text-slate-900 dark:text-white mt-1">Embedded SQLite / JSON</div>
              <div className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold mt-0.5">● Persisted (.data/db.json)</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
